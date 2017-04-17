const express = require('express');
const cql = require('cql-execution');
const fhir = require('cql-fhir');
const localRepo = require('../../lib/local-repo');
const localCodeService = require('../../lib/local-code-service');
const CodeService = require('code-service');
const router = express.Router();

var codeservice;

// Establish the routes
router.get('/:library', resolver, get);
router.post('/:library', resolver, valuesetter, execute);
router.get('/:library/version/:version', resolver, get);
router.post('/:library/version/:version', resolver, valuesetter, execute);
router.post('/:library/expression/:expression', resolver, valuesetter, execute);
router.post('/:library/version/:version/expression/:expression', resolver, valuesetter, execute);

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
    res.sendStatus(404);
    return;
  }
  // Set the library in the res.locals for use by other middleware and/or routes
  res.locals.library = lib;

  // Confirm expression (if applicable)
  if (typeof req.params.expression !== 'undefined') {
    let def = lib.expressions[req.params.expression];
    // Check the library to ensure this is a valid returnable expression
    if (typeof def === 'undefined' || def.constructor.name === 'FunctionDef') {
      // Set the 404 status and halt the request chain now
      res.sendStatus(404);
      return;
    }
    // Set the expression in the res.locals for use by other middleware and/or routes
    res.locals.expression = def.name;
  }

  // Set the response header so the client knows exactly what library & expression is being processed
  const libIdentifier = res.locals.library.source.library.identifier;
  let loc = libIdentifier.id;
  if (typeof libIdentifier.version !== 'undefined') {
    loc += `/version/${libIdentifier.version}`;
  }
  if (typeof res.locals.expression !== 'undefined') {
    loc += `/expression/${res.locals.expression}`;
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
 * Route handler that executes data against the requested library.
 * Requires `resolver` handler to precede it in the handler chain.
 */
function valuesetter(req, res, next) {
  // Get the lib from the res.locals (thanks, middleware!)
  const valuesets = res.locals.library.valuesets;

  codeservice = new CodeService.CodeService('localCodeService/vsac_cache/valueset-db.json', 
    valuesets,'localCodeService/vsac_cache', next );
  if (codeservice.valueSets !== undefined && valuesets === undefined) {
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

  // Load the patient source
  const usingFHIR = lib.source.library.usings.def.find(d => d.url == 'http://hl7.org/fhir' || d.localIdentifier == 'FHIR');
  if (typeof usingFHIR === 'undefined' || usingFHIR.version != '1.0.2') {
    res.status(501).send(`Not Implemented: Unsupported data model (must be FHIR 1.0.2`);
    return;
  }
  const patientSource = fhir.PatientSource.FHIRv102();

  // Check for valid input
  const data = typeof req.body.data !== 'undefined' ? req.body.data : [];
  if (!Array.isArray(data)) {
    res.status(400).send('Invalid input.  The "data" parameter must be an array of FHIR resources.');
    return;
  }

  // Load the data into the patient source
  // Since the data is an array of patient records, we need to wrap them in a bundle (as the executor expects)
  if (data.length > 0) {
    const bundle = {
      resourceType: 'Bundle',
      type: 'collection',
      entry: data.map(r => { return {resource: r}; })
    };
    patientSource.loadBundles([bundle]);
  }

  // Execute it and send the results
  const executor = new cql.Executor(lib, codeservice);
  const results = executor.exec(patientSource);
  sendResults(res, results);
}

/**
 * Sends the execution results back to the client
 */
function sendResults(res, results) {
  const resultIDs = Object.keys(results.patientResults);
  if (resultIDs.length == 0) {
    res.status(400).send('Insufficient data to provide results.');
    return;
  } else if (resultIDs.length > 1) {
    res.status(400).send('Data contained information about more than one patient.');
    return;
  }
  const pid = resultIDs[0];
  const pResults = results.patientResults[pid];
  delete(pResults.Patient);
  const libIdentifier = res.locals.library.source.library.identifier;
  const formattedResults = {
    library: { name: libIdentifier.id, version: libIdentifier.version},
    timestamp: new Date(),
    patientID: pid
  };
  if (typeof res.locals.expression === 'undefined') {
    formattedResults.results = pResults;
  } else {
    formattedResults.expression = res.locals.expression;
    formattedResults.result = pResults[res.locals.expression];
  }
  res.json(formattedResults);
}

module.exports = router;
