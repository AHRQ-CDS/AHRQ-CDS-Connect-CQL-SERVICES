'use strict';

/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const axios = require('axios');

const handleRequest = async (options) => {
  console.log('--------------- START --------------');
  try {
    const request = {
      method: options.message ? 'post' : 'get',
      url: options.endpoint,
      headers: {
        'Accept': 'application/json'
      }
    };
    if (options.message) {
      const file = await fs.readFileSync(options.message, 'utf-8');
      request.data = JSON.parse(file);
      request.headers['Content-Type'] = 'application/json';
    }
    const resp =  await axios(request);
    console.log(`STATUS: ${resp.status} ${resp.statusText}`);
    console.log('--------------- HEADERS ------------');
    for (const key of Object.keys(resp.headers)) {
      console.log(key, ':', resp.headers[key]);
    }
    console.log('--------------- BODY ---------------');
    if (resp.headers['content-type'] && resp.headers['content-type'].indexOf('json') != -1) {
      console.log(JSON.stringify(resp.data, null, 2));
    } else {
      console.log(resp.data);
    }
    console.log('--------------- DONE ---------------');
  } catch (err) {
    console.error(err);
    console.log('--------------- DONE ---------------');
  }
};

const DEFAULT_EXEC_EP = 'http://localhost:3000/api/library/USPSTFStatinUseForPrimaryPreventionOfCVDInAdultsFHIRv401/version/2.0.0';
const DEFAULT_EXEC_MSG = path.join('test', 'examples', 'exec', 'R4', 'unhealthy_patient.json');
program
  .command('exec-post')
  .alias('ep')
  .description(`Post a JSON message to a library endpoint.  Options can be passed to\n` +
            `  specify the endpoint and message to post.  If not specified, the\n` +
            `  following defaults are used:\n` +
            `    --endpoint ${DEFAULT_EXEC_EP}\n`+
            `    --message ${DEFAULT_EXEC_MSG}`)
  .option('-e, --endpoint <url>', 'The endpoint to post the message to', DEFAULT_EXEC_EP)
  .option('-m, --message <path>', 'The path containing the JSON message to post', DEFAULT_EXEC_MSG)
  .action(handleRequest);

const DEFAULT_HOOKS_DISCOVER_EP = 'http://localhost:3000/cds-services';
program
  .command('hooks-discover')
  .alias('hd')
  .description(`Get the CDS Hooks discovery endpoint.  Options can be passed to\n` +
            `  specify the endpoint.  If not specified, the following default is used:\n` +
            `    --endpoint ${DEFAULT_HOOKS_DISCOVER_EP}\n`)
  .option('-e, --endpoint <url>', 'The endpoint to post the message to', DEFAULT_HOOKS_DISCOVER_EP)
  .action(handleRequest);

const DEFAULT_HOOKS_CALL_EP = 'http://localhost:3000/cds-services/statin-use';
const DEFAULT_HOOKS_CALL_MSG = path.join('test', 'examples', 'hooks', 'R4', 'unhealthy_patient.json');
program
  .command('hooks-call')
  .alias('hc')
  .description(`Call a CDS Hook.  Options can be passed to specify the endpoint and message to post.\n` +
            `  If not specified, the following defaults are used:\n` +
            `    --endpoint ${DEFAULT_HOOKS_CALL_EP}\n`+
            `    --message ${DEFAULT_HOOKS_CALL_MSG}`)
  .option('-e, --endpoint <url>', 'The endpoint to post the message to', DEFAULT_HOOKS_CALL_EP)
  .option('-m, --message <path>', 'The path containing the JSON message to post', DEFAULT_HOOKS_CALL_MSG)
  .action(handleRequest);

const DEFAULT_HOOKS_FEEDBACK_EP = 'http://localhost:3000/cds-services/statin-use/feedback';
const DEFAULT_HOOKS_FEEDBACK_MSG = path.join('test', 'examples', 'hooks', 'R4', 'feedback.json');
program
  .command('hooks-feedback')
  .alias('hf')
  .description(`Post feedback on CDS Hooks cards.  Options can be passed to specify the endpoint and message to post.\n` +
            `  If not specified, the following defaults are used:\n` +
            `    --endpoint ${DEFAULT_HOOKS_FEEDBACK_EP}\n`+
            `    --message ${DEFAULT_HOOKS_FEEDBACK_MSG}`)
  .option('-e, --endpoint <url>', 'The endpoint to post the message to', DEFAULT_HOOKS_FEEDBACK_EP)
  .option('-m, --message <path>', 'The path containing the JSON message to post', DEFAULT_HOOKS_FEEDBACK_MSG)
  .action(handleRequest);


program.parseAsync(process.argv);

