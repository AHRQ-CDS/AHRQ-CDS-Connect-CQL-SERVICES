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

## Overriding the CQL Services Port

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

## CQL Hooks Config

CQL libraries are associated with CDS Hooks services via configuration files. CQL Hooks configuration files generally have the following properties:

- **id**: the unique id that identifies this service. This is used directly in the services discovery response.
- **hook**: the hook that should trigger this service. This is used directly in the services discovery response.
- **title**: the title of this service. This is used directly in the services discovery response.
- **description**: a short description of the service. This is used directly in the services discovery response.
- **_config**: a configuration object that indicates how cards are generated and the CQL library to use for this service.
  - **cards**: an array of objects describing specific cards to be returned and the conditions under which to return them.
    - **conditionExpression**: the name of an expression in the CQL that should be checked to determine if the card should be returned.  If the expression evaluates to `null`, `false`, `0`, or `''` for the patient, then the card will be supressed; otherwise it will be returned.  If the configuration does not specify a `conditionExpression`, then the card will always be returned.
    - **card**: details about the card to be returned if the `conditionExpression` is truthy (or if no `conditionExpression` is provided).
      - For details about what fields can go into cards, refer to the [CDS Hooks Card Attributes](http://cds-hooks.hl7.org/ballots/2018May/specification/1.0/#card-attributes) documentation.
      - The CQL Hooks service performs string interpolation on all card values -- allowing you to customize them with the  patient's CQL results.  For example, `${Recommendation}` will be replaced at run-time with the value of the `Recommendation` expression result from the CQL.
      - Currently, if the CQL has an `Errors` expression, and it is not empty, the errors will be appended to the card's `detail`.  In future versions of CQL Hooks, this will likely be more configurable.
  - **cql**
    - **library**
      - **id**: the id of the CQL library to run when this hook is invoked.
      - **version**: the version of the CQL library to run when this hook is invoked.

The following is an example of the hook configuration for the Statin Use artifact:

```json
{
  "id": "statin-use",
  "hook": "patient-view",
  "title": "Statin Use for the Primary Prevention of CVD in Adults",
  "description": "Presents a United States Preventive Services Task Force (USPSTF) statin therapy recommendation for adults aged 40 to 75 years without a history of cardiovascular disease (CVD) who have 1 or more CVD risk factors (i.e., dyslipidemia, diabetes, hypertension, or smoking) and a calculated 10-year CVD event risk score of 7.5% or greater.",
  "_config": {
    "cards": [{
      "conditionExpression": "InPopulation",
      "card": {
        "summary": "Statin Use for the Primary Prevention of CVD in Adults",
        "indicator": "info",
        "detail": "${Recommendation}",
        "source": {
          "label": "CDS Connect: Statin Use for the Primary Prevention of CVD in Adults",
          "url": "https://cds.ahrq.gov/cdsconnect/artifact/statin-use-primary-prevention-cvd-adults",
          "icon": "https://cds.ahrq.gov/themes/custom/cds_connect/images/cdsconnect-circle-logo.png"
        }
      }
    }],
    "cql": {
      "library": {
        "id": "USPSTF_Statin_Use_for_Primary_Prevention_of_CVD_in_Adults_FHIRv102",
        "version": "1.0.0"
      }
    }
  }
}
```

## CQL Hooks Data Exchange

The CDS Hooks API allows two ways of getting patient data: via prefetch data sent with the service call or via direct access to the FHIR server.  CQL Hooks only supports the "prefetch" method.  When CQL is loaded for a CQL Hooks service, the CQL will be analyzed to determine what FHIR resources it needs, and the prefetch requirements will be dynamically generated into the services metadata.

If a CQL Hooks service is invoked without the required prefetch data, an HTTP 412 (Precondition Failed) error will be returned.

# Running CQL Services

To run the server, simply invoke `yarn start`.
```
$ yarn start
```

_**NOTE**: This service operates on HTTP only.  This means that information between the client and the server is **not** encrypted.  Under this configuration, calls to the CQL Services that contain real patient data should originate from the same host and avoid going over the network._

# Test the CQL Services

## The Home Page

If the service is running correctly, you should be able to load its home page in a browser by visiting: [http://localhost:3000](http://localhost:3000) (or replacing _localhost_ with the server name).  This will list out the loaded CQL hooks and libraries.

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

## The CDS Hooks Sandbox

CDS Hooks provides a public sandbox for testing CDS Hooks services.  This sandbox can be used to test CQL Hooks services.

The general steps to test a CQL Hooks service in the CDS Hooks sandbox is as follows:

1. Browse to http://sandbox.cds-hooks.org/
2. In the top-right of the page, click the gear icon and choose "Add CDS Services"
3. In the resulting dialog box, type "http://localhost:3000/cds-services" (changing the hostname/port as appropriate)
4. Click "Save"
5. Choose your CQL Hooks service from the "Select a Service" dropdown menu
6. If the current patient triggers any of your card conditions, you should see your card
7. Refer the the [CDS Hooks sandbox documentation](https://github.com/cds-hooks/sandbox) for more information on using it

# Linting the Code

To encourage quality and consistency within the code base, all code should pass eslint without any warnings.  Many text editors can be configured to automatically flag eslint violations.  We also provide an npm script for running eslint on the project.  To run eslint, execute the following command:
```
$ yarn run lint
```