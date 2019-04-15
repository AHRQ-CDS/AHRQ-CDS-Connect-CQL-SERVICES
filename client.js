'use strict';

/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const program = require('commander');
const request = require('request');

const DEFAULT_EXEC_EP = 'http://localhost:3000/api/library/USPSTF_Statin_Use_for_Primary_Prevention_of_CVD_in_Adults_FHIRv102/version/1.0.1';
const DEFAULT_EXEC_MSG = path.join('test', 'examples', 'exec', 'unhealthy_patient.json');
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
  .action((options) => {
    console.log('--------------- START --------------');
    const postOptions = {
      url: options.endpoint,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };
    fs.createReadStream(options.message)
      .on('error', (err) => {
        console.log(err);
        console.log('--------------- DONE ---------------');
      })
      .pipe(request.post(postOptions, (err, resp, body) => {
        if (err) {
          console.error(err);
          console.log('--------------- DONE ---------------');
          return;
        }
        console.log(`STATUS: ${resp.statusCode} ${resp.statusMessage}`);
        console.log('--------------- HEADERS ------------');
        for (const key of Object.keys(resp.headers)) {
          console.log(key, ':', resp.headers[key]);
        }
        console.log('--------------- BODY ---------------');
        if (resp.headers['content-type'] && resp.headers['content-type'].indexOf('json') != -1) {
          console.log(JSON.stringify(JSON.parse(body), null, 2));
        } else {
          console.log(body);
        }
        console.log('--------------- DONE ---------------');
      }));
  });

const DEFAULT_HOOKS_DISCOVER_EP = 'http://localhost:3000/cds-services';
program
  .command('hooks-discover')
  .alias('hd')
  .description(`Get the CDS Hooks discovery endpoint.  Options can be passed to\n` +
            `  specify the endpoint.  If not specified, the following default is used:\n` +
            `    --endpoint ${DEFAULT_HOOKS_DISCOVER_EP}\n`)
  .option('-e, --endpoint <url>', 'The endpoint to post the message to', DEFAULT_HOOKS_DISCOVER_EP)
  .action((options) => {
    console.log('--------------- START --------------');
    const getOptions = {
      url: options.endpoint,
      headers: {
        'Accept': 'application/json'
      }
    };
    request.get(getOptions, (err, resp, body) => {
      if (err) {
        console.error(err);
        console.log('--------------- DONE ---------------');
        return;
      }
      console.log(`STATUS: ${resp.statusCode} ${resp.statusMessage}`);
      console.log('--------------- HEADERS ------------');
      for (const key of Object.keys(resp.headers)) {
        console.log(key, ':', resp.headers[key]);
      }
      console.log('--------------- BODY ---------------');
      if (resp.headers['content-type'] && resp.headers['content-type'].indexOf('json') != -1) {
        console.log(JSON.stringify(JSON.parse(body), null, 2));
      } else {
        console.log(body);
      }
      console.log('--------------- DONE ---------------');
    });
  });

const DEFAULT_HOOKS_CALL_EP = 'http://localhost:3000/cds-services/statin-use';
const DEFAULT_HOOKS_MSG = path.join('test', 'examples', 'hooks', 'unhealthy_patient.json');
program
  .command('hooks-call')
  .alias('hc')
  .description(`Call a CDS Hook.  Options can be passed to specify the endpoint and message to post.\n` +
            `  If not specified, the following defaults are used:\n` +
            `    --endpoint ${DEFAULT_HOOKS_CALL_EP}\n`+
            `    --message ${DEFAULT_HOOKS_MSG}`)
  .option('-e, --endpoint <url>', 'The endpoint to post the message to', DEFAULT_HOOKS_CALL_EP)
  .option('-m, --message <path>', 'The path containing the JSON message to post', DEFAULT_HOOKS_MSG)
  .action((options) => {
    console.log('--------------- START --------------');
    const postOptions = {
      url: options.endpoint,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };
    fs.createReadStream(options.message)
      .on('error', (err) => {
        console.log(err);
        console.log('--------------- DONE ---------------');
      })
      .pipe(request.post(postOptions, (err, resp, body) => {
        if (err) {
          console.error(err);
          console.log('--------------- DONE ---------------');
          return;
        }
        console.log(`STATUS: ${resp.statusCode} ${resp.statusMessage}`);
        console.log('--------------- HEADERS ------------');
        for (const key of Object.keys(resp.headers)) {
          console.log(key, ':', resp.headers[key]);
        }
        console.log('--------------- BODY ---------------');
        if (resp.headers['content-type'] && resp.headers['content-type'].indexOf('json') != -1) {
          console.log(JSON.stringify(JSON.parse(body), null, 2));
        } else {
          console.log(body);
        }
        console.log('--------------- DONE ---------------');
      }));
  });

program.parse(process.argv);

