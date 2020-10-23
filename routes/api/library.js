'use strict';

const express = require('express');
const cql = require('cql-execution');
const fhir = require('cql-exec-fhir');
const csLoader = require('../../lib/code-service-loader');
const libsLoader = require('../../lib/libraries-loader');
const router = express.Router();
const process = require('process');

// Establish the routes
router.get('/:library', resolver, get);
router.post('/:library', resolver, valuesetter, execute);
router.get('/:library/version/:version', resolver, get);
router.post('/:library/version/:version', resolver, valuesetter, execute);

/**
 * Middleware to confirm and load library name and expression from URL.
 * Puts resulting library and expression name in `res.locals`.
 */
function resolver(req, res, next) {
  // Load the library
  let lib;
  if (typeof req.params.version === 'undefined') {
    lib = libsLoader.get().resolveLatest(req.params.library);
  } else {
    lib = libsLoader.get().resolve(req.params.library, req.params.version);
  }
  if (typeof lib === 'undefined') {
    // Set the 404 status and halt the request chain now
    logError(`Library not found: ${req.params.library} v${req.params.version}`);
    res.sendStatus(404);
    return;
  }
  // Set the library in the res.locals for use by other middleware and/or routes
  res.locals.library = lib;

  // Set the response header so the client knows exactly what library is being processed
  const libIdentifier = res.locals.library.source.library.identifier;
  let loc = libIdentifier.id;
  if (typeof libIdentifier.version !== 'undefined') {
    loc += `/version/${libIdentifier.version}`;
  }
  res.location(`${req.baseUrl}/${loc}`);

  // Invoke the next middleware/route in the chain
  next();
}

/**
 * Route handler that gets the ELM JSON for the requested library
 * Requires `resolver` handler to precede it in the handler chain.
 */
function get(req, res, next) {
  // Get the lib from the res.locals (thanks, middleware!)
  const lib = res.locals.library;
  // Send the json
  res.json(lib.source);
}

/**
 * Route handler that reads the valuesets needed by the requested
 * library and cross-checks with the local code service cache. If
 * no local version of a valueset is found, it is downloaded from
 * the Value Set Authority Center (VSAC). Requires 'resolver' handler
 * to proceed it in the handler chain.
 */
function valuesetter(req, res, next) {
  // Get the lib from the res.locals (thanks, middleware!)
  const library = res.locals.library;

  // If the calling library has valuesets, crosscheck them with the local
  // codeservice. Any valuesets not found in the local cache will be
  // downloaded from VSAC.
  // Use of API Key is preferred, as username/password will not be supported on Jan 1 2021
  const ensureValueSets = process.env['UMLS_API_KEY']
    ? csLoader.get().ensureValueSetsInLibraryWithAPIKey(library)
    : csLoader.get().ensureValueSetsInLibrary(library);
  ensureValueSets.then( () => next() )
    .catch( (err) => {
      logError(err);
      if (req.app.locals.ignoreVSACErrors) {
        next();
      } else {
        let errToSend = err;
        if (err instanceof Error) {
          errToSend = err.message;
        } else if (Array.isArray(err)) {
          errToSend = err.map(e => e instanceof Error ? e.message : e);
        }
        sendError(res, 500, errToSend, false);
      }
    });
}

/**
 * Route handler that executes data against the requested library.
 * Requires `resolver` handler to precede it in the handler chain.
 */
function execute(req, res, next) {
  // Get the lib from the res.locals (thanks, middleware!)
  const lib = res.locals.library;

  // Confirm parameters is an object
  const parameters = typeof req.body.parameters !== 'undefined' ? req.body.parameters : {};
  if (typeof parameters !== 'object' || Array.isArray(parameters)) {
    // Set the 400 status and halt the request chain now
    sendError(res, 400, 'Invalid input.  The "parameters" parameter, if supplied, must be an object with parameter name keys.');
    return;
  }

  // Confirm return expressions (if applicable)
  const expressions = typeof req.body.returnExpressions !== 'undefined' ? req.body.returnExpressions : [];
  if (!Array.isArray(expressions)) {
    // Set the 400 status and halt the request chain now
    sendError(res, 400, 'Invalid input.  The "returnExpressions" parameter, if supplied, must be an array of expression names.');
    return;
  }
  for (const expr of expressions) {
    let def = lib.expressions[expr];
    // Check the library to ensure this is a valid returnable expression
    if (typeof def === 'undefined' || def.constructor.name === 'FunctionDef') {
      // Set the 400 status and halt the request chain now
      sendError(res, 400, `Expression not found: ${res.locals.library.source.library.identifier} ${expr}`);
      return;
    }
  }

  // Check for valid input
  const data = typeof req.body.data !== 'undefined' ? req.body.data : [];
  if (!Array.isArray(data)) {
    sendError(res, 400, 'Invalid input.  The "data" parameter must be an array of FHIR resources.');
    return;
  }

  // Load the patient source
  let patientSource;
  const usingFHIR = lib.source.library.usings.def.find(d => d.url == 'http://hl7.org/fhir' || d.localIdentifier == 'FHIR');
  switch (usingFHIR.version) {
  case '1.0.2': patientSource = fhir.PatientSource.FHIRv102(); break;
  case '3.0.0': patientSource = fhir.PatientSource.FHIRv300(); break;
  case '4.0.0': patientSource = fhir.PatientSource.FHIRv400(); break;
  default:
    logError(`Library does not use any supported data models: ${lib.source.library.usings.def}`);
    sendError(res, 501, `Not Implemented: Unsupported data model (must be FHIR 1.0.2, 3.0.0, or 4.0.0`);
    return;
  }

  // Load the data into the patient source
  // Since the data is an array of patient records, we need to wrap them in a bundle (as the executor expects)
  if (data.length > 0) {
    // Check the data to confirm it looks like FHIR.  If it looks like FHIR, put it in a bundle and load it.
    // If it doesn't look like FHIR, return an error.
    if (data.every(r => typeof r.resourceType === 'string')) {
      // FHIR formatted.  We're all good.  Load it.
      patientSource.loadBundles([{
        resourceType: 'Bundle',
        type: 'collection',
        entry: data.map(r => { return {resource: r}; })
      }]);
    } else {
      sendError(res, 400, `Data must be in FHIR 1.0.2 (DSTU2) format.`);
      return;
    }
  }

  // Execute it and send the results
  try {
    const executor = new cql.Executor(lib, csLoader.get(), parameters);
    const results = executor.exec(patientSource);
    sendResults(res, results, parameters, expressions);
  } catch (err) {
    logError(err);
    let errToSend = err;
    if (err instanceof Error) {
      errToSend = err.message;
    } else if (Array.isArray(err)) {
      errToSend = err.map(e => e instanceof Error ? e.message : e);
    }
    sendError(res, 500, errToSend, false);
  }
}

/**
 * Sends the execution results back to the client
 */
function sendResults(res, results, parameters = {}, returnExpressions = []) {
  const resultIDs = Object.keys(results.patientResults);
  if (resultIDs.length == 0) {
    sendError(res, 400, 'Insufficient data to provide results.');
    return;
  } else if (resultIDs.length > 1) {
    sendError(res, 400, 'Data contained information about more than one patient.');
    return;
  }
  const pid = resultIDs[0];
  const pResults = results.patientResults[pid];
  delete(pResults.Patient);
  const libIdentifier = res.locals.library.source.library.identifier;
  const formattedResults = {
    library: { name: libIdentifier.id, version: libIdentifier.version},
    parameters: parameters,
    returnExpressions: returnExpressions,
    timestamp: new Date(),
    patientID: pid,
    results: {}
  };
  if (Object.keys(parameters).length == 0) {
    delete(formattedResults.parameters);
  }
  if (returnExpressions.length == 0) {
    delete(formattedResults.returnExpressions);
    formattedResults.results = pResults;
  } else {
    for (const expr of returnExpressions) {
      formattedResults.results[expr] = pResults[expr];
    }
  }
  res.json(formattedResults);
}

function sendError(res, code, message, logIt = true) {
  if (logIt) {
    logError(message);
  }
  res.type('text/plain');
  res.status(code).send(message);
}

function logError(err) {
  if(process.env.NODE_ENV === 'test') {
    return;
  }
  if (Array.isArray(err)) {
    for (const e of err) {
      logError(e);
    }
    return;
  }
  const errString = err instanceof Error ? `${err.message}\n  ${err.stack}` : `${err}`;
  console.error((new Date()).toISOString(), 'ERROR:', errString);
}

module.exports = router;
