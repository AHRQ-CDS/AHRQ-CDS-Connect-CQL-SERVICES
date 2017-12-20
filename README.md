# CQL Execution Service

The CQL Execution Service is an Express-based RESTful service for executing CQL.

This project was initialized using the [Express application generator](https://expressjs.com/en/starter/generator.html) (from which it gets its project structure and dependencies).

# Installing as a Service on Windows Server 2012

This service will be piloted on Windows Server 2012.  Installation instructions are [here](docs/windows_2012_install.md).

# Installing for Development

To use this project in a development environment, you should perform the following steps:

1. Install [Node.js LTS] (https://nodejs.org/en/download/)
2. Install [Yarn](https://yarnpkg.com/en/docs/install)
3. Execute the following from this project's root directory: `yarn`
    ```
    $ yarn
    ```

# Configuration

## Setting NLM Credentials for VSAC Downloads

The CQL Execution Service requires a free Unified Medical Language System (UMLS) account from the National Library of Medicine (NLM).  If you do not yet have an account, [sign up here](https://uts.nlm.nih.gov//license.html).

Once you have your NLM credentials, you must assign them to the `UMLS_USER_NAME` and `UMLS_PASSWORD` environment variables.

Mac/Linux:
```
$ export UMLS_USER_NAME=myusername
$ export UMLS_PASSWORD=mypassword
```

Windows:
```
> set UMLS_USER_NAME=myusername
> set UMLS_PASSWORD=mypassword
```

If you do not properly set the above environment variables, the CQL Execution Service will fail to download the required value sets from VSAC.

## Ignoring VSAC Errors

If there are errors downloading value sets, the execution service will abort the execution request.  To change this behavior so that VSAC errors are ignored set the `IGNORE_VSAC_ERRORS` environment variable to `true`.

Mac/Linux:
```
$ export IGNORE_VSAC_ERRORS=true
```

Windows:
```
> set IGNORE_VSAC_ERRORS=true
```

_NOTE: This should only be done during development since unresolved value sets may affect CDS results!_

## Overriding the CQL Execution Service Port

The default port for this web application is `3000`.  To override the port, set your system's `PORT` environment variable to the desired port.

Mac/Linux:
```
$ export PORT=9000
```

Windows:
```
> set PORT=9000
```

# Adding CQL Libraries

This service is packaged with the [Statin Use for Primary Prevention of CVD in Adults](https://cds.ahrq.gov/cdsconnect/artifact/statin-use-primary-prevention-cvd-adults) CQL library.  You can find its ELM JSON files in the _localRepository_ folder.

To add other CQL libraries, you must first [translate them to ELM JSON](https://github.com/cqframework/clinical_quality_language/tree/master/Src/java).  You can then add their ELM JSON (and the ELM JSON of any dependencies) to the _localRepository_ folder.

_NOTE: The CQL Execution Service only supports the FHIR 1.0.2 data model.  It will not work with CQL that uses any other data models._

# Running the CQL Execution Service

To run the server, simply invoke `yarn start`.
```
$ yarn start
```

_**NOTE**: This service operates on HTTP only.  This means that information between the client and the server is **not** encrypted.  Under this configuration, calls to the CQL Execution Service that contain real patient data should originate from the same host and avoid going over the network._

# Test the CQL Execution Service

## The Home Page

If the service is running correctly, you should be able to load its home page in a browser by visiting: [http://localhost:3000](http://localhost:3000) (or replacing _localhost_ with the server name).  This will list out the loaded CQL libraries.

## The Test Client

You can also execute a test client to ensure the API is working correctly.  This will post a message with synthetic data to the endpoint and show the response.

```
$ node client post
```

If successful, you should see something like this:
```
--------------- START --------------
STATUS: 200 OK
--------------- HEADERS ------------
x-powered-by : Express
location : /api/library/USPSTF_Statin_Use_for_Primary_Prevention_of_CVD_in_Adults_FHIRv102/version/1.0.0
content-type : application/json; charset=utf-8
content-length : 769
etag : W/"301-S0M0zQt6oH2PdzaP5ph03w"
date : Wed, 20 Dec 2017 16:28:02 GMT
connection : close
--------------- BODY ---------------
{
  "library": {
    "name": "USPSTF_Statin_Use_for_Primary_Prevention_of_CVD_in_Adults_FHIRv102",
    "version": "1.0.0"
  },
  "returnExpressions": [
    "Recommendation",
    "Rationale",
    "Errors"
  ],
  "timestamp": "2017-12-20T16:28:02.029Z",
  "patientID": "2-1",
  "results": {
    "Recommendation": "Start low to moderate intensity lipid lowering therapy based on outcome of shared decision making between patient and provider",
    "Rationale": "The USPSTF found adequate evidence that use of low- to moderate-dose statins reduces the probability of CVD events (MI or ischemic stroke) and mortality by at least a moderate amount in adults aged 40 to 75 years who have 1 or more CVD risk factors (dyslipidemia, diabetes, hypertension, or smoking) and a calculated 10-year CVD event risk of 10% or greater.",
    "Errors": null
  }
}
--------------- DONE ---------------
```

### Test Client Arguments

By default, the test client posts synthetic records for an "unhealthy patient" to the USPSTF Statin Use endpoint.  These defaults can be overridden using commandline arguments.  For usage, run the command: `node client post --help`.

```bat
> node client post --help

  Usage: post|p [options]

  Post a JSON message to a library endpoint.  Options can be passed to
  specify the endpoint and message to post.  If not specified, the
  following defaults are used:
    --endpoint http://localhost:3000/api/library/USPSTF_Statin_Use_for_Primary_Prevention_of_CVD_in_Adults_FHIRv102/version/1.0.0
    --message test/fixtures/unhealthy_patient.json

  Options:

    -h, --help            output usage information
    -e, --endpoint <url>  The endpoint to post the message to
    -m, --message <path>  The path containing the JSON message to post
```

As an example, you can try posting a different file as the message:

```bat
node client post -m test/fixtures/healthy_patient.json
```

If successful, , you should see something like this (note the different _results_):
```
--------------- START --------------
STATUS: 200 OK
--------------- HEADERS ------------
x-powered-by : Express
location : /api/library/USPSTF_Statin_Use_for_Primary_Prevention_of_CVD_in_Adults_FHIRv102/version/1.0.0
content-type : application/json; charset=utf-8
content-length : 638
etag : W/"27e-UwHVEowAniejlYIKVKjVOQ"
date : Wed, 20 Dec 2017 16:43:50 GMT
connection : close
--------------- BODY ---------------
{
  "library": {
    "name": "USPSTF_Statin_Use_for_Primary_Prevention_of_CVD_in_Adults_FHIRv102",
    "version": "1.0.0"
  },
  "returnExpressions": [
    "Recommendation",
    "Rationale",
    "Errors"
  ],
  "timestamp": "2017-12-20T16:43:50.882Z",
  "patientID": "1-1",
  "results": {
    "Recommendation": "No USPSTF recommendation provided, as patient does not meet inclusion criteria",
    "Rationale": "The USPSTF guideline applies to adults aged 40 to 75 years who have 1 or more CVD risk factors (dyslipidemia, as evidenced by LDL > 130 mg/dL or HDL < 40 mg/dL, diabetes, hypertension, or smoking) and a calculated 10-year CVD event risk >= 7.5% (grade C) or >= 10% (grade B).",
    "Errors": null
  }
}
--------------- DONE ---------------
```

# Linting the Code

To encourage quality and consistency within the code base, all code should pass eslint without any warnings.  Many text editors can be configured to automatically flag eslint violations.  We also provide an npm script for running eslint on the project.  To run eslint, execute the following command:
```
$ yarn run lint
```