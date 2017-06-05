const express = require('express');
const cql = require('cql-execution');
const fhir = require('cql-fhir');
const debug = require('debug')('cql-exec-service');
const localRepo = require('../../lib/local-repo');
const cs = require('cds-code-service');
const router = express.Router();
const pb = require('../../lib/PatientBundle');

// Global variable that will hold our code service.
var codeservice;

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
    lib = localRepo.get().resolveLatest(req.params.library);
  } else {
    lib = localRepo.get().resolve(req.params.library, req.params.version);
  }
  if (typeof lib === 'undefined') {
    // Set the 404 status and halt the request chain now
    debug('ERROR: Library not found:', req.params.library, req.params.version);
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
  const valuesets = res.locals.library.valuesets;

  // Check to see if the code service has been initialized yet. If not,
  // create a new CodeService instance.
  if (typeof(codeservice) === 'undefined') {
    codeservice = new cs.CodeService('localCodeService/vsac_cache');
    codeservice.loadValueSetsFromFile('localCodeService/vsac_cache/valueset-db.json');
  }

  // If the calling library has valuesets, crosscheck them with the local
  // codeservice. Any valuesets not found in the local cache will be
  // downloaded from VSAC.
  let valuesetArray = Object.keys(valuesets).map(function(idx) {return valuesets[idx];});
  if (valuesetArray !== null) { // We have some valuesets... get them.
    codeservice.ensureValueSets(valuesetArray)
    .then( () => next() )
    .catch( (err) => {
      debug('ERROR:', res.locals.library.source.library.identifier, err);
      if (req.app.locals.ignoreVSACErrors) {
        next();
      } else {
        let errToSend = err;
        if (err instanceof Error) {
          errToSend = err.message;
        } else if (Array.isArray(err)) {
          errToSend = err.map(e => e instanceof Error ? e.message : e);
        }
        res.status(500).send(errToSend);
      }
    });
  } else { // No valuesets. Go to next handler.
    next();
  }
}

/**
 * Route handler that executes data against the requested library.
 * Requires `resolver` handler to precede it in the handler chain.
 */
function execute(req, res, next) {
  // Get the lib from the res.locals (thanks, middleware!)
  const lib = res.locals.library;

  // Confirm return expressions (if applicable)
  const expressions = typeof req.body.returnExpressions !== 'undefined' ? req.body.returnExpressions : [];
  if (!Array.isArray(expressions)) {
    // Set the 400 status and halt the request chain now
    res.status(400).send('Invalid input.  The "returnExpressions" parameter, if supplied, must be an array of expression names.');
    return;
  }
  for (const expr of expressions) {
    let def = lib.expressions[expr];
    // Check the library to ensure this is a valid returnable expression
    if (typeof def === 'undefined' || def.constructor.name === 'FunctionDef') {
      // Set the 400 status and halt the request chain now
      debug('ERROR: Expression not found:', res.locals.library.source.library.identifier, expr);
      res.status(400).send(`Invalid input.  Cannot find expression to return with name: ${expr}.`);
      return;
    }
  }

  // Check for valid input
  const data = typeof req.body.data !== 'undefined' ? req.body.data : [];
  if (!Array.isArray(data)) {
    debug('ERROR: The "data" parameter is not an array');
    res.status(400).send('Invalid input.  The "data" parameter must be an array of FHIR resources.');
    return;
  }

  // Load the patient source
  const usingFHIR = lib.source.library.usings.def.find(d => d.url == 'http://hl7.org/fhir' || d.localIdentifier == 'FHIR');
  if (typeof usingFHIR === 'undefined' || usingFHIR.version != '1.0.2') {
    debug('ERROR: Library does not use any supported data models', lib.source.library.usings.def);
    res.status(501).send(`Not Implemented: Unsupported data model (must be FHIR 1.0.2`);
    return;
  }
  const patientSource = fhir.PatientSource.FHIRv102();

  // Load the data into the patient source
  // Since the data is an array of patient records, we need to wrap them in a bundle (as the executor expects)
  if (data.length > 0) {
    // Check header to ensure this is actually FHIR formatted data. If it isn't,
    // then we need to convert it.
    let bundle;
    if (req.headers['content-type'] !== 'application/json+fhir') {
      // Not FHIR formatted.  Need to convert.
      bundle = pb.parseMessage(data);
    } else { // === 'application/json+fhir'
      // FHIR formatted.  We're all good.
      bundle = {
        resourceType: 'Bundle',
        type: 'collection',
        entry: data.map(r => { return {resource: r}; })
      };
    }
    patientSource.loadBundles([bundle]);
  }

  // Execute it and send the results
  const executor = new cql.Executor(lib, codeservice);
  const results = executor.exec(patientSource);
  sendResults(res, results, expressions);
}

/**
 * Sends the execution results back to the client
 */
function sendResults(res, results, returnExpressions = []) {
  const resultIDs = Object.keys(results.patientResults);
  if (resultIDs.length == 0) {
    debug('ERROR: Insufficient data to provide results.');
    res.status(400).send('Insufficient data to provide results.');
    return;
  } else if (resultIDs.length > 1) {
    debug('ERROR: Data contained information about more than one patient.');
    res.status(400).send('Data contained information about more than one patient.');
    return;
  }
  const pid = resultIDs[0];
  const pResults = results.patientResults[pid];
  delete(pResults.Patient);
  const libIdentifier = res.locals.library.source.library.identifier;
  const formattedResults = {
    library: { name: libIdentifier.id, version: libIdentifier.version},
    returnExpressions: returnExpressions,
    timestamp: new Date(),
    patientID: pid,
    results: {}
  };
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

module.exports = router;
