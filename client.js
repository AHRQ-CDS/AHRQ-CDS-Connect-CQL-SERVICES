/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const program = require('commander');
const request = require('request');

const DEFAULT_EP = 'http://localhost:3000/api/library/USPSTF_Statin_Use_for_Primary_Prevention_of_CVD_in_Adults_FHIRv102/version/1';
const DEFAULT_MSG = path.join('test', 'fixtures', 'unhealthy_patient.json');
program
  .command('post')
  .alias('p')
  .description(`Post a JSON message to a library endpoint.  Options can be passed to\n` +
            `  specify the endpoint and message to post.  If not specified, the\n` +
            `  following defaults are used:\n` +
            `    --endpoint ${DEFAULT_EP}\n`+
            `    --message ${DEFAULT_MSG}`)
  .option('-e, --endpoint <url>', 'The endpoint to post the message to', DEFAULT_EP)
  .option('-m, --message <path>', 'The path containing the JSON message to post', DEFAULT_MSG)
  .action((options) => {
    console.log('--------------- START --------------');
    const postOptions = {
      url: options.endpoint,
      headers: {
        'Content-Type': 'application/json+fhir'
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

