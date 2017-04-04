const express = require('express');
const cql = require('cql-execution');
const fhir = require('cql-fhir');
const localRepo = require('../../lib/local-repo');
const localCodeService = require('../../lib/local-code-service');
const router = express.Router();

/* POST data to library for execution. */
router.post('/:library', execute);
router.post('/:library/expression/:expression', execute);
router.post('/:library/version/:version', execute);
router.post('/:library/version/:version/expression/:expression', execute);

function execute(req, res, next) {
  // Load the library
  let lib;
  if (typeof req.params.version === 'undefined') {
    lib = localRepo.get().resolveLatest(req.params.library);
  } else {
    lib = localRepo.get().resolve(req.params.library, req.params.version);
  }
  if (typeof lib === 'undefined') {
    res.sendStatus(404);
    return;
  }

  // Set the response header so the client knows exactly what library & expression is being processed
  let loc = lib.source.library.identifier.id;
  if (typeof lib.source.library.identifier.version !== 'undefined') {
    loc += `/version/${lib.source.library.identifier.version}`;
  }
  if (typeof req.params.expression !== 'undefined') {
    loc += `/expression/${req.params.expression}`;
  }
  res.location(`${req.baseUrl}/${loc}`);

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
  const executor = new cql.Executor(lib, localCodeService.get());
  const results = executor.exec(patientSource);
  sendResults(res, lib, results, req.params.expression);
}

function sendResults(res, lib, results, expression) {
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
  const formattedResults = {
    library: { name: lib.source.library.identifier.id, version: lib.source.library.identifier.version},
    timestamp: new Date(),
    patientID: pid
  };
  if (typeof expression === 'undefined') {
    formattedResults.results = pResults;
  } else {
    formattedResults.expression = expression;
    formattedResults.result = pResults[expression];
  }
  res.json(formattedResults);
}

module.exports = router;
