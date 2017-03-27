const express = require('express');
const cql = require('cql-execution');
const fhir = require('cql-fhir');
const localRepo = require('../lib/local-repo');
const localCodeService = require('../lib/local-code-service');
const router = express.Router();

/* POST data to library for execution. */
router.post('/:library/version/:version', function(req, res, next) {
  // Load the library
  const lib = localRepo.get().resolve(req.params.library, req.params.version);
  if (typeof lib === 'undefined') {
    res.sendStatus(404);
    return;
  }

  // Load the patient source
  const usingFHIR = lib.source.library.usings.def.find(d => d.url == 'http://hl7.org/fhir' || d.localIdentifier == 'FHIR');
  if (typeof usingFHIR === 'undefined' || usingFHIR.version != '1.0.2') {
    res.status(501).send(`Not Implemented: Unsupported data model (must be FHIR 1.0.2`);
    return;
  }
  const patientSource = fhir.PatientSource.FHIRv102();

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

  const executor = new cql.Executor(lib, localCodeService.get());
  const results = executor.exec(patientSource);

  sendResults(res, lib, results);

});

function sendResults(res, lib, results) {
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
    patientID: pid,
    results: pResults
  };
  res.json(formattedResults);
}

module.exports = router;
