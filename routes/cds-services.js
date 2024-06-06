'use strict';

const express = require('express');
const router = express.Router();
const cql = require('cql-execution');
const fhir = require('cql-exec-fhir');
const fhirclient  = require('fhirclient');
const cloneDeep = require('lodash/cloneDeep');
const isPlainObject = require('lodash/isPlainObject');
const uuid = require('../lib/uuid');
const csLoader = require('../lib/code-service-loader');
const hooksLoader = require('../lib/hooks-loader');
const libsLoader = require('../lib/libraries-loader');
const cardLogger = require('../lib/card-logger');

// Middleware to setup response headers with CORS
router.use((request, response, next) => {
  response.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Expose-Headers': 'Origin, Accept, Content-Location, Location, X-Requested-With',
    'Content-Type': 'application/json; charset=utf-8',
  });
  next();
});

// Establish the routes
router.get('/', discover);
router.post('/:id', resolver, valuesetter, call);
router.post('/:id/feedback', feedback);

/**
 * Route handler that returns the list of available CDS services.
 * @see {@link https://cds-hooks.hl7.org/2.0/#discovery|Discovery}
 */
function discover(req, res, next) {
  res.json({
    services: hooksLoader.get().all(true)
  });
}

/**
 * Middleware to confirm and load hook and library from URL.
 * Puts resulting hook definition and library in `res.locals`.
 */
function resolver(req, res, next) {
  // Check to ensure required properties are present
  if (!req.body.hook || !req.body.hookInstance || !req.body.context) {
    sendError(res, 400, 'Invalid request. Missing at least one required field from: hook, hookInstance, context.');
    return;
  }

  // Load the service definition
  const hook = hooksLoader.get().find(req.params.id);
  if (!hook) {
    logError(`Hook not found: ${req.params.id}`);
    res.sendStatus(404);
    return;
  }
  res.locals.hook = hook;

  // Ensure the CQL library is specified in the hook definition
  if (!hook._config || !hook._config.cql || !hook._config.cql.library || !hook._config.cql.library.id) {
    sendError(res, 500, 'CDS Hook config does not specificy the CQL library to use.');
    return;
  }

  // Load the library
  let lib;
  if (typeof hook._config.cql.library.version === 'undefined') {
    lib = libsLoader.get().resolveLatest(hook._config.cql.library.id);
  } else {
    lib = libsLoader.get().resolve(hook._config.cql.library.id, hook._config.cql.library.version);
  }

  if (typeof lib === 'undefined') {
    logError(`Library not found: ${hook._config.cql.library.id} v${hook._config.cql.library.version}`);
    // Set the 500 status and halt the request chain now
    sendError(res, 500, 'CDS Hook config specified a CQL library, but library could not be located.');
    return;
  }
  // Set the library in the res.locals for use by other middleware and/or routes
  res.locals.library = lib;

  // Invoke the next middleware/route in the chain
  next();
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
  const ensureValueSets = csLoader.get().ensureValueSetsInLibraryWithAPIKey(library);
  ensureValueSets.then(() => next())
    .catch((err) => {
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
 * Route handler that handles a service call.
 * @see {@link https://cds-hooks.hl7.org/2.0/#calling-a-cds-service|Calling a CDS Service}
 * @see {@link https://cds-hooks.hl7.org/2.0/#cds-service-response|CDS Service Response}
 */
async function call(req, res, next) {
  const hook = res.locals.hook;

  // Build up a single bundle representing all data
  const bundle = {
    resourceType: 'Bundle',
    type: 'collection',
    entry: []
  };
  if (hook.prefetch) {
    // Create a FHIR client in case we need to call out to the FHIR server
    const client = getFHIRClient(req, res);
    const searchRequests = [];
    // Iterate through the prefetch keys to determine if they are supplied or if we need to query for the data
    for (const key of Object.keys(hook.prefetch)) {
      const pf = req.body.prefetch[key];
      if (typeof pf === 'undefined') {
        // The prefetch was not provided, so use the FHIR client (if available) to request the data
        if (client == null) {
          res.sendStatus(412);
          return;
        }
        let searchURL = hook.prefetch[key];
        // Replace the context placeholders in the queries
        Object.keys(req.body.context || {}).forEach(contextKey => {
          searchURL = searchURL.split(`{{context.${contextKey}}}`).join(req.body.context[contextKey]);
        });
        // Perform the search and add the response to the bundle
        const searchRequest = client.request(searchURL, { pageLimit: 0, flat: true })
          .then(result => addResponseToBundle(result, bundle));
        // Push the promise onto the array so we can await it later
        searchRequests.push(searchRequest);
      } else {
        // The prefetch was supplied so just add it directly to the bundle
        addResponseToBundle(pf, bundle);
      }
    }
    // Wait for any open requests to finish, returning if there is an error
    try {
      await Promise.all(searchRequests);
    } catch {
      res.sendStatus(412);
      return;
    }
  }

  // Get the lib from the res.locals (thanks, middleware!)
  const lib = res.locals.library;

  // Load the patient source
  let patientSource;
  const usingFHIR = lib.source.library.usings.def.find(d => d.url == 'http://hl7.org/fhir' || d.localIdentifier == 'FHIR');
  switch (usingFHIR.version) {
  case '1.0.2': patientSource = fhir.PatientSource.FHIRv102(); break;
  case '3.0.0': patientSource = fhir.PatientSource.FHIRv300(); break;
  case '4.0.0': patientSource = fhir.PatientSource.FHIRv400(); break;
  case '4.0.1': patientSource = fhir.PatientSource.FHIRv401(); break;
  default:
    logError(`Library does not use any supported data models: ${lib.source.library.usings.def}`);
    sendError(res, 501, `Not Implemented: Unsupported data model (must be FHIR 1.0.2, 3.0.0, 4.0.0, or 4.0.1`);
    return;
  }

  // Load the data into the patient source
  patientSource.loadBundles([bundle]);

  // Execute it and send the results
  let results;
  try {
    const executor = new cql.Executor(lib, csLoader.get());
    results = await executor.exec(patientSource);
  } catch (err) {
    logError(err);
    let errToSend = err;
    let responseCode = 500;
    if (err instanceof Error) {
      errToSend = err.message;
      // If it's an invalid UCUM unit or other invalid value, send 422 response code instead
      // of 500. Ideally this would be a more specific error type we could catch, but it isn't;
      // so detect it via a simple string match for the word 'invalid' or 'UCUM' for now.
      if (errToSend.indexOf('invalid') !== -1 || errToSend.indexOf('UCUM') !== -1) {
        responseCode = 422;
      }
    } else if (Array.isArray(err)) {
      errToSend = err.map(e => e instanceof Error ? e.message : e);
    }
    sendError(res, responseCode, errToSend, false);
  }

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

  const response = {
    cards: []
  };

  // Calculate the cards and systemActions for the response
  const calculate = (itemsLabel, itemLabel) => {
    if (!Array.isArray(hook._config[itemsLabel])) {
      return; // not configured
    }
    // Iterate the items from the config and replace the ${...} expressions
    for (const itemCfg of hook._config[itemsLabel]) {
      // Check the condition
      if (itemCfg.conditionExpression != null) {
        const hasConditionExpression = Object.prototype.hasOwnProperty.call(pResults, itemCfg.conditionExpression.split('.')[0]);
        if (!hasConditionExpression) {
          throw new Error(`Hook configuration for ${hook.id} refers to non-existent conditionExpression: ${itemCfg.conditionExpression}`);
        }
        const condition = resolveExp(pResults, itemCfg.conditionExpression);
        if (!condition) {
          continue;
        }
      }
      let item = interpolateVariables(itemCfg[itemLabel], pResults);
      // If it's a card, assign random UUIDs to the card and its suggestions (or keep original uuid if in config)
      if (itemsLabel === 'cards') {
        item = Object.assign( { uuid: uuid.v4() }, item );
        if (Array.isArray(item.suggestions)) {
          item.suggestions = item.suggestions.map(sug => Object.assign({ uuid: uuid.v4() }, sug));
        }
      }
      response[itemsLabel] = response[itemsLabel] || [];
      response[itemsLabel].push(item);
    }
  };
  try {
    calculate('cards', 'card');
    calculate('systemActions', 'action');
  } catch (e) {
    sendError(res, 500, e instanceof Error ? e.message : e);
    return;
  }

  // If there are errors or warnings, report them as extensions
  const report = (label, items) => {
    if (items == null || items.length === 0) {
      return;
    } else if (!Array.isArray(items)) {
      items = [items];
    }
    response.extension = response.extension || {};
    response.extension[label] = items;
  };
  report('errors', pResults['Errors']);
  report('warnings', pResults['Warnings']);

  // Log the cards, but ignore any errors since we don't want a logging failure to stop the response
  await Promise.allSettled(response.cards.map(card => cardLogger.logCard(hook.id, card)));

  res.json(response);
}

/**
 * Route handler that handles feedback.
 * @see {@link https://cds-hooks.hl7.org/2.0/#feedback|Feedback}
 */
async function feedback(req, res, next) {
  // Check to ensure required properties are present
  if (!Array.isArray(req.body.feedback)) {
    sendError(res, 400, 'Invalid request. Required field \'feedback\' must be an array.');
    return;
  } else if (req.body.feedback.some(f => !f.card || !f.outcome || !f.outcomeTimestamp)) {
    sendError(res, 400, 'Invalid request. Missing at least one of the following required fields from a feedback item: card, outcome, outcomeTimestamp.');
    return;
  } else if (req.body.feedback.some(f => f.outcome === 'accepted' && !Array.isArray(f.acceptedSuggestions))) {
    sendError(res, 400, 'Invalid request. At least one feedback item has outcome \'accepted\' but is missing acceptedSuggestions array.');
    return;
  }

  // Load the service definition
  const hook = hooksLoader.get().find(req.params.id);
  if (!hook) {
    logError(`Hook not found: ${req.params.id}`);
    res.sendStatus(404);
    return;
  }

  const results = await Promise.allSettled(req.body.feedback.map(feedback => cardLogger.logFeedback(hook.id, feedback)));
  if (results.every(r => r.status === 'fulfilled')) {
    res.sendStatus(200);
  } else {
    // If any cards failed to be logged, let the client know since feedback is useless when not logged
    sendError(res, 500, 'Failed to process feedback');
  }
}

function getFHIRClient(req, res) {
  if (req.body.fhirServer) {
    const state = {
      serverUrl: req.body.fhirServer,
    };
    if (req.body.fhirAuthorization) {
      const auth = req.body.fhirAuthorization;
      Object.assign(state, {
        clientId: auth.subject,
        scope: auth.scope,
        tokenResponse: {
          token_type: auth.token_type,
          scope: auth.scope,
          client_id: auth.subject,
          expires_in: auth.expires_in,
          access_token: auth.access_token
        }
      });
    }
    return fhirclient(req, res).client(state);
  }
}

function addResponseToBundle(response, bundle) {
  if (response == null) {
    // no results, do nothing
  } else if (Array.isArray(response)) {
    response.forEach(resource => {
      bundle.entry.push({ resource });
    });
  } else if (response.resourceType === 'Bundle' && response.type === 'searchset') {
    if (response.entry && response.entry.length > 0) {
      response.entry.forEach(entry => {
        if (entry != null && entry.resource != null) {
          bundle.entry.push({ resource: entry.resource });
        }
      });
    }
  } else {
    bundle.entry.push({ resource: response });
  }
}

function interpolateVariables(arg, results) {
  if (typeof arg === 'string') {
    // Look for embedded variables of form ${myVar}
    const matches = arg.match(/\$\{[^}]+\}/g);
    if (matches) {
      for (const m of matches) {
        // Get the variable name and then the result of the variable from execution
        const exp = /^\$\{(.+)\}$/.exec(m);
        const expVal = resolveExp(results, exp[1]);
        if (m === arg) {
          // The value contains *only* the expression variable, so replace it with the proper typed result
          // e.g., "${InPopulation}" should be replaced with true, not "true"
          return expVal;
        }
        // Otherwise, the value is embedded in a string, so replace it within the string
        // e.g., "The result is ${result}"
        arg = arg.replace(`\${${exp[1]}}`, expVal);
      }
    }
    return arg;
  } else if (Array.isArray(arg)) {
    // It's an array, so interpolate each item in the array
    return arg.map(a => interpolateVariables(a, results));
  } else if (isPlainObject(arg)) {
    // Make a clone so we don't modify the original object
    const obj = cloneDeep(arg);
    // It's a plain object so interpolate the value of each key
    for (const key of Object.keys(obj)) {
      obj[key] = interpolateVariables(obj[key], results);
    }
    return obj;
  }
  // Whatever it is, just pass it through
  return arg;
}

function resolveExp(result, expr) {
  const parts = expr.split('.');
  for (const part of parts) {
    if (result == null) {
      break;
    }
    result = result[part];
  }
  return result == null ? '' : result;
}

function sendError(res, code, message, logIt = true) {
  if (logIt) {
    logError(message);
  }
  res.type('text/plain');
  res.status(code).send(message);
}

function logError(err) {
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
