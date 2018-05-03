# CQL Services

CQL Services is an Express.js application that provides RESTful services for executing CQL.  Currently two services are provided:

- CQL Exec: A custom RESTful API for invoking CQL and receiving back the calculated results as JSON
- CQL Hooks: A standards-based RESTful API that exposes configured CQL according to the [CDS Hooks](https://cds-hooks.org/) standard

_NOTE: The CDS Hooks standard is not yet finalized, so some aspects of this service will likely need modification when CDS Hooks 1.0 is released._

This project was initialized using the [Express application generator](https://expressjs.com/en/starter/generator.html) (from which it gets its project structure and dependencies).

# Installing as a Service on Windows Server 2012

An earlier version of this service was originally piloted on Windows Server 2012.  Installation instructions are [here](docs/windows_2012_install.md).

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

The CQL Services require a free Unified Medical Language System (UMLS) account from the National Library of Medicine (NLM).  If you do not yet have an account, [sign up here](https://uts.nlm.nih.gov//license.html).

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

If you do not properly set the above environment variables, the CQL Services will fail to download the required value sets from VSAC.

## Ignoring VSAC Errors

If there are errors downloading value sets, the services will abort the execution request.  To change this behavior so that VSAC errors are ignored set the `IGNORE_VSAC_ERRORS` environment variable to `true`.

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

_NOTE: The CQL Services only support the FHIR 1.0.2 data model.  They will not work with CQL that uses any other data models._

# Adding CQL Hooks

This service is packaged with the [Statin Use for Primary Prevention of CVD in Adults](https://cds.ahrq.gov/cdsconnect/artifact/statin-use-primary-prevention-cvd-adults) CQL Hook.  You can find its Hook config in the _localHooks_ folder.  Note that it requires the corresponding ELM JSON files in the _localRepsitory_ folder.

To add other CQL Hooks, add a configuration file for them in the _localHooks_ folder, and add their ELM JSON to the _localRepository_ folder, as described in the above section.

# Running the CQL Execution Service

To run the server, simply invoke `yarn start`.
```
$ yarn start
```

_**NOTE**: This service operates on HTTP only.  This means that information between the client and the server is **not** encrypted.  Under this configuration, calls to the CQL Services that contain real patient data should originate from the same host and avoid going over the network._

# Test the CQL Services

## The Home Page

If the service is running correctly, you should be able to load its home page in a browser by visiting: [http://localhost:3000](http://localhost:3000) (or replacing _localhost_ with the server name).  This will list out the loaded CQL libraries.

## Commandline Client

You can also execute a commandline client to ensure the API is working correctly.  This will post messages to the endpoints and show the responses.

### Posting to the CQL Exec Service

The following command posts a synthetic patient to the Statin Use library:

```
$ node client exec-post
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

### Discovering CQL Hooks Services

The following command issues the "discover" call to the CDS Hooks API:

```
$ node client hooks-discover
```

If successful, you should see something like this:

```
--------------- START --------------
STATUS: 200 OK
--------------- HEADERS ------------
x-powered-by : Express
access-control-allow-origin : *
access-control-allow-methods : GET, POST, OPTIONS
access-control-allow-credentials : true
access-control-allow-headers : Content-Type, Authorization
access-control-expose-headers : Origin, Accept, Content-Location, Location, X-Requested-With
content-type : application/json; charset=utf-8
content-length : 833
etag : W/"341-9R9eLlD5D7t/Vfu5qc6ZbA"
date : Thu, 03 May 2018 20:59:23 GMT
connection : close
--------------- BODY ---------------
{
  "services": [
    {
      "hook": "patient-view",
      "title": "Statin Use for the Primary Prevention of CVD in Adults",
      "description": "Presents a United States Preventive Services Task Force (USPSTF) statin therapy recommendation for adults aged 40 to 75 years without a history of cardiovascular disease (CVD) who have 1 or more CVD risk factors (i.e., dyslipidemia, diabetes, hypertension, or smoking) and a calculated 10-year CVD event risk score of 7.5% or greater.",
      "id": "statin-use",
      "prefetch": {
        "Patient": "Patient/{{context.patientId}}",
        "Observation": "Observation?patient={{context.patientId}}",
        "Condition": "Condition?patient={{context.patientId}}",
        "Procedure": "Procedure?patient={{context.patientId}}",
        "MedicationStatement": "MedicationStatement?patient={{context.patientId}}",
        "MedicationOrder": "MedicationOrder?patient={{context.patientId}}"
      }
    }
  ]
}
--------------- DONE ---------------
```

### Calling a CQL Hooks Service

The following command calls the statin-use CDS Hook with a synthetic patient:

```
$ node client hooks-call
```

If successful, you should see something like this:

```
--------------- START --------------
STATUS: 200 OK
--------------- HEADERS ------------
x-powered-by : Express
access-control-allow-origin : *
access-control-allow-methods : GET, POST, OPTIONS
access-control-allow-credentials : true
access-control-allow-headers : Content-Type, Authorization
access-control-expose-headers : Origin, Accept, Content-Location, Location, X-Requested-With
content-type : application/json; charset=utf-8
content-length : 506
etag : W/"1fa-ObHeBzQNRmJak36DEXnvUg"
date : Thu, 03 May 2018 21:00:55 GMT
connection : close
--------------- BODY ---------------
{
  "cards": [
    {
      "summary": "Statin Use for the Primary Prevention of CVD in Adults",
      "indicator": "info",
      "detail": "Start low to moderate intensity lipid lowering therapy based on outcome of shared decision making between patient and provider",
      "source": {
        "label": "CDS Connect: Statin Use for the Primary Prevention of CVD in Adults",
        "url": "https://cds.ahrq.gov/cdsconnect/artifact/statin-use-primary-prevention-cvd-adults",
        "icon": "https://cds.ahrq.gov/themes/custom/cds_connect/images/cdsconnect-circle-logo.png"
      }
    }
  ]
}
--------------- DONE ---------------
```

### Test Client Arguments

For advanced usage, such as using non-default endpoints or specifying other messages, run one of these commands:

- `node client exec-post --help`
- `node client hooks-discover --help`
- `node client hooks-call --help`

```bat
> node client exec-post --help

  Usage: exec-post|ep [options]

  Post a JSON message to a library endpoint.  Options can be passed to
  specify the endpoint and message to post.  If not specified, the
  following defaults are used:
    --endpoint http://localhost:3000/api/library/USPSTF_Statin_Use_for_Primary_Prevention_of_CVD_in_Adults_FHIRv102/version/1.0.0
    --message test/fixtures/exec/unhealthy_patient.json

  Options:

    -h, --help            output usage information
    -e, --endpoint <url>  The endpoint to post the message to
    -m, --message <path>  The path containing the JSON message to post

> node client hooks-discover --help

  Usage: hooks-discover|hd [options]

  Get the CDS Hooks discovery endpoint.  Options can be passed to
  specify the endpoint.  If not specified, the following default is used:
    --endpoint http://localhost:3000/cds-services


  Options:

    -h, --help            output usage information
    -e, --endpoint <url>  The endpoint to post the message to

> node client hooks-call --help

  Usage: hooks-call|hc [options]

  Call a CDS Hook.  Options can be passed to specify the endpoint and message to post.
  If not specified, the following defaults are used:
    --endpoint http://localhost:3000/cds-services/statin-use
    --message test/fixtures/hooks/unhealthy_patient.json

  Options:

    -h, --help            output usage information
    -e, --endpoint <url>  The endpoint to post the message to
    -m, --message <path>  The path containing the JSON message to post
```



# Linting the Code

To encourage quality and consistency within the code base, all code should pass eslint without any warnings.  Many text editors can be configured to automatically flag eslint violations.  We also provide an npm script for running eslint on the project.  To run eslint, execute the following command:
```
$ yarn run lint
```