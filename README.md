# CQL Services

## About

CQL Services is an Express.js application that provides RESTful services for executing CQL.  Currently two services are provided:

- CQL Exec: A custom RESTful API for invoking CQL and receiving back the calculated results as JSON
- CQL Hooks: A standards-based RESTful API that exposes configured CQL according to version 1.0 of the [CDS Hooks](https://cds-hooks.hl7.org/) standard

The CQL Exec API was used to pilot the [Statin Use for the Primary Prevention of CVD in Adults](https://cds.ahrq.gov/cdsconnect/artifact/statin-use-primary-prevention-cvd-adults-clinician-facing-cds-intervention) artifact in 2017.

The CQL Hooks API was used to pilot the following artifacts in 2019:
- [Statin Use for the Primary Prevention of CVD in Adults: Patient-Facing CDS Intervention](https://cds.ahrq.gov/cdsconnect/artifact/statin-use-primary-prevention-cvd-adults-patient-facing-cds-intervention)
- [Healthful Diet and Physical Activity for CVD Prevention in Adults With Cardiovascular Risk Factors](https://cds.ahrq.gov/cdsconnect/artifact/healthful-diet-and-physical-activity-cvd-prevention-adults-cardiovascular-risk)
- [Abnormal Blood Glucose and Type 2 Diabetes Mellitus: Part One, Screening](https://cds.ahrq.gov/cdsconnect/artifact/abnormal-blood-glucose-and-type-2-diabetes-mellitus-part-one-screening)
- [Abnormal Blood Glucose and Type 2 Diabetes Mellitus: Part Two, Counseling](https://cds.ahrq.gov/cdsconnect/artifact/abnormal-blood-glucose-and-type-2-diabetes-mellitus-part-two-counseling)
For more information, please see the 2019 [pilot report](https://cds.ahrq.gov/sites/default/files/cds/artifact/1056/CDS%20Connect_Year%203%20Pilot%20Report_Final.pdf).

Since these pilots, CQL Services has also been updated to support FHIR STU3 and FHIR R4.  The version of FHIR will automatically be detected from the CQL library.

These prototype services are part of the [CDS Connect](https://cds.ahrq.gov/cdsconnect) project, sponsored by the [Agency for Healthcare Research and Quality](https://www.ahrq.gov/) (AHRQ), and developed under contract with AHRQ by [MITRE's CAMH](https://www.mitre.org/centers/cms-alliances-to-modernize-healthcare/who-we-are) FFRDC.

## Contributions

For information about contributing to this project, please see [CONTRIBUTING](CONTRIBUTING.md).

## Development Details

This project was initialized using the [Express application generator](https://expressjs.com/en/starter/generator.html) (from which it gets its project structure and dependencies).

### Installing for Development

To use this project in a development environment, you should perform the following steps:

1. Install [Node.js LTS] (https://nodejs.org/en/download/)
2. Install [Yarn](https://yarnpkg.com/en/docs/install)
3. Execute the following from this project's root directory: `yarn`
    ```
    $ yarn
    ```

## Configuration

### Setting NLM Credentials for VSAC Downloads

The CQL Services require a free Unified Medical Language System (UMLS) account from the National Library of Medicine (NLM).  If you do not yet have an account, [sign up here](https://uts.nlm.nih.gov//license.html).

Once you have your NLM credentials, you must assign your API Key to the `UMLS_API_KEY` environment variable.  Your API Key may be found in your [UMLS Profile](https://uts.nlm.nih.gov//uts.html#profile).

Alternatively, you may set the `UMLS_USER_NAME` and `UMLS_PASSWORD` environment variables.  If all three environment variables are present, the `UMLS_API_KEY` will be used.

**NOTE:** As of January 1 2021, NLM will no longer accept username and password for authentication.  You MUST use an API Key to download value sets from VSAC after this date.

Mac/Linux:
```
$ export UMLS_API_KEY=myapikey
```

Alternative Mac/Linux (deprecated, expires Jan 1 2021):
```
$ export UMLS_USER_NAME=myusername
$ export UMLS_PASSWORD=mypassword
```

Windows:
```
> set UMLS_API_KEY=myapikey
```

Alternative Windows (deprecated, expires Jan 1 2021):
```
> set UMLS_USER_NAME=myusername
> set UMLS_PASSWORD=mypassword
```

If you do not properly set the above environment variables, the CQL Services will fail to download the required value sets from VSAC.

### Ignoring VSAC Errors

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

### Overriding the CQL Services Port

The default port for this web application is `3000`.  To override the port, set your system's `PORT` environment variable to the desired port.

Mac/Linux:
```
$ export PORT=9000
```

Windows:
```
> set PORT=9000
```

### Overriding the Maximum Request Size

By default, requests over 1 MB large will be rejected.  To override the max request size, set your system's `CQL_SERVICES_MAX_REQUEST_SIZE` environment variable to the desired value using one of the following units: `b`, `kb`, `mb`, and `gb`.

Mac/Linux:
```
$ export CQL_SERVICES_MAX_REQUEST_SIZE=2mb
```

Windows:
```
> set CQL_SERVICES_MAX_REQUEST_SIZE=2mb
```

## Adding CQL Libraries

This service is packaged with the [Statin Use for Primary Prevention of CVD in Adults](https://cds.ahrq.gov/cdsconnect/artifact/statin-use-primary-prevention-cvd-adults) and [CMS’s Million Hearts® Model Longitudinal ASCVD Risk Assessment Tool for Baseline 10-Year ASCVD Risk](https://cds.ahrq.gov/cdsconnect/artifact/cmss-million-heartsr-model-longitudinal-ascvd-risk-assessment-tool-baseline-10) CQL libraries.  You can find their ELM JSON files in subfolders of the _config/libraries_ folder.

To add other CQL libraries, you must first [translate them to ELM JSON](https://github.com/cqframework/clinical_quality_language/tree/master/Src/java).  You can then add their ELM JSON (and the ELM JSON of any dependencies) to the _config/libraries_ folder or any subfolder within it.

_NOTE: The CQL Services currently supports the FHIR 1.0.2, 3.0.0, 4.0.0, and 4.0.1 data models.  They will not work with CQL that uses any other data models._

## Adding CQL Hooks

This service is packaged with example [Statin Use for Primary Prevention of CVD in Adults](https://cds.ahrq.gov/cdsconnect/artifact/statin-use-primary-prevention-cvd-adults) and [CMS’s Million Hearts® Model Longitudinal ASCVD Risk Assessment Tool for Baseline 10-Year ASCVD Risk](https://cds.ahrq.gov/cdsconnect/artifact/cmss-million-heartsr-model-longitudinal-ascvd-risk-assessment-tool-baseline-10) CQL Hooks.  You can find the hook configs in the _config/hooks_ folder.  Note that they require the corresponding ELM JSON files in the _localRepsitory_ folder.

To add other CQL Hooks, add a configuration file for them in the _config/hooks_ folder, and add their ELM JSON to the _config/libraries_ folder, as described in the above section.

### CQL Hooks Config

CQL libraries are associated with CDS Hooks services via configuration files. CQL Hooks configuration files generally have the following properties:

- **id**: the unique id that identifies this service. This is used directly in the services discovery response.
- **hook**: the hook that should trigger this service. This is used directly in the services discovery response.
- **title**: the title of this service. This is used directly in the services discovery response.
- **description**: a short description of the service. This is used directly in the services discovery response.
- **extension**: an _optional_ object to support arbitrary [extensions](https://cds-hooks.org/specification/1.0/#extensions) in the service definition. This is used directly in the services discovery response.
- **_config**: a configuration object that indicates how cards are generated and the CQL library to use for this service.
  - **cards**: an array of objects describing specific cards to be returned and the conditions under which to return them.
    - **conditionExpression**: the name of an expression in the CQL that should be checked to determine if the card should be returned.  If the expression evaluates to `null`, `false`, `0`, or `''` for the patient, then the card will be supressed; otherwise it will be returned.  If the configuration does not specify a `conditionExpression`, then the card will always be returned.
    - **card**: details about the card to be returned if the `conditionExpression` is truthy (or if no `conditionExpression` is provided).
      - For details about what fields can go into cards, refer to the [CDS Hooks Card Attributes](http://cds-hooks.hl7.org/ballots/2018May/specification/1.0/#card-attributes) documentation.
      - Specify [extensions](https://cds-hooks.org/specification/1.0/#extensions) using the reserved `extension` property.
      - If the CQL has an expression named `Errors`, and if its result is non-empty, the card's `extension` object will contain an `errors` property whose value is the array of errors.
      - If the CQL has an expression named `Warnings`, and if its result is non-empty, the card's `extension` object will contain a `warnings` property whose value is the array of warnings.
      - The CQL Hooks service performs string interpolation on all card values -- allowing you to customize them with the  patient's CQL results.  For example, `${Recommendation}` will be replaced at run-time with the value of the `Recommendation` expression result from the CQL.
  - **cql**
    - **library**
      - **id**: the id of the CQL library to run when this hook is invoked.
      - **version**: the version of the CQL library to run when this hook is invoked.

_NOTE: If additional properties are specified in the top-level of the CQL Hooks config, these will be mirrored in the service discovery response.  Similarly, if additional properties are specified in the CQL Hooks config's `_config.cards.card` object, these will be mirrored in the card response. The CDS Hooks specification, however, suggests that all non-standard data should be exchanged via the [extension](https://cds-hooks.hl7.org/1.0/#extensions) mechanism._

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
        "version": "1.1.0"
      }
    }
  }
}
```

_**Note**: No checking is performed by CQL Services that any hook configurations are actually valid. It is up to the user to ensure hook configurations used with the service comply with the CDS Hooks specification._

### CQL Hooks Data Exchange

The CDS Hooks API allows two ways of getting patient data: via prefetch data sent with the service call or via direct access to the FHIR server.  When CQL is loaded for a CQL Hooks service, the CQL will be analyzed to determine what FHIR resources it needs, and the prefetch requirements will be dynamically generated into the services metadata.

If a CQL Hooks service is invoked without the required prefetch data, CQL Services will attempt to query the FHIR server (specified in the request) for the data.  If it fails to retrieve the data from the FHIR server, then an HTTP 412 (Precondition Failed) error will be returned.

_**Note**: This service does not attempt to decode and validate any JSON Web Tokens (JWT) sent along with any requests.  This means that all requests are implicitly trusted and that all calls to the CQL Services that contain real patient data should originate from the same host and avoid going over the network._

## Running CQL Services

To run the server, simply invoke `yarn start`.
```
$ yarn start
```

_**NOTE**: This service operates on HTTP only.  This means that information between the client and the server is **not** encrypted.  Under this configuration, calls to the CQL Services that contain real patient data should originate from the same host and avoid going over the network._

## CQL Services for Docker

CQL Services also includes a `Dockerfile` for building a [Docker](https://www.docker.com/) image that can be used for deploying CQL Services as a container.

To build the CQL Services Docker image:
```
$ docker build -t cql-services .
```

To ceate and run a `cql-services` container:
```
$ docker run --name cql-services -d -p "3000:3000" -e "UMLS_API_KEY=myKey" -e "CQL_SERVICES_MAX_REQUEST_SIZE=2mb" -v /data/cql-services/config:/usr/src/app/config cql-services:latest
```

Alternatively, you may pass UMLS user name and password credentials (deprecated, expires Jan 1 2021):
```
$ docker run --name cql-services -d -p "3000:3000" -e "UMLS_USER_NAME=myUser" -e "UMLS_PASSWORD=myPass" -e "CQL_SERVICES_MAX_REQUEST_SIZE=2mb" -v /data/cql-services/config:/usr/src/app/config cql-services:latest
```

* `docker run` creates and runs a new container based on the requested image.
* `--name cql-services` gives the container a name by which it can be referred to via other Docker commands.
* `-d` indicates that the container should run as a daemon (instead of blocking the current thread).
* `-p "3000:3000"` indicates that port 3000 of the container should be mapped to port 3000 of the host.  Without this, the service is not accesible outside the container.
* `-e "UMLS_API_KEY=apiKey"` passes the UMLS API Key as an environment variable.  This is required, and the preferred credential to download value sets for execution.
* `-e "UMLS_USER_NAME=myUser"` **DEPRECATED** passes the UMLS user name as an environment variable.  This is required to download value sets for execution.
* `-e "UMLS_PASSWORD=myPass"` **DEPRECATED** passes the UMLS password as an environment variable.  This is required to download value sets for execution.
* `-e "CQL_SERVICES_MAX_REQUEST_SIZE=2mb"` passes the max request size allowed as an environment variable.  This flag is optional and defaults to 1mb if not passed in.
* `-v /data/cql-services/config:/usr/src/app/config` maps the host's `/data/cql-services/config` folder as a read-only volume in the container.  This allows the CQL and Hooks configs to be configured on the host and persist across container upgrades.
* `cql-services:latest` indicates the image name (`cql-services`) and tag (`latest`) to run.

The following commands may also be helpful:
```
docker ps                 # list all running containers
docker ps -a              # list all containers (running or not)
docker stop cql-services  # stops the container named cql-services
docker start cql-services # starts the container named cql-services
docker rm cql-services    # removes the container named cql-services
```

## Test the CQL Services

### The Home Page

If the service is running correctly, you should be able to load its home page in a browser by visiting: [http://localhost:3000](http://localhost:3000) (or replacing _localhost_ with the server name).  This will list out the loaded CQL hooks and libraries.

### Commandline Client

You can also execute a commandline client to ensure the API is working correctly.  This will post messages to the endpoints and show the responses.

#### Posting to the CQL Exec Service

The following command posts a synthetic patient to the Statin Use library:

```
$ node client exec-post
```

If successful, you should see something like this:

```
--------------- START --------------
STATUS: 200 OK
--------------- HEADERS ------------
access-control-allow-origin : *
x-dns-prefetch-control : off
x-frame-options : SAMEORIGIN
strict-transport-security : max-age=15552000; includeSubDomains
x-download-options : noopen
x-content-type-options : nosniff
x-xss-protection : 1; mode=block
location : /api/library/USPSTF_Statin_Use_for_Primary_Prevention_of_CVD_in_Adults_FHIRv102/version/1.1.0
content-type : application/json; charset=utf-8
content-length : 769
etag : W/"301-U7SqQJffZDXLckKHLa24ZA"
date : Thu, 09 Aug 2018 19:45:19 GMT
connection : close
--------------- BODY ---------------
{
  "library": {
    "name": "USPSTF_Statin_Use_for_Primary_Prevention_of_CVD_in_Adults_FHIRv102",
    "version": "1.1.0"
  },
  "returnExpressions": [
    "Recommendation",
    "Rationale",
    "Errors"
  ],
  "timestamp": "2018-08-09T19:45:19.154Z",
  "patientID": "2-1",
  "results": {
    "Recommendation": "Start low to moderate intensity lipid lowering therapy based on outcome of shared decision making between patient and provider",
    "Rationale": "The USPSTF found adequate evidence that use of low- to moderate-dose statins reduces the probability of CVD events (MI or ischemic stroke) and mortality by at least a moderate amount in adults aged 40 to 75 years who have 1 or more CVD risk factors (dyslipidemia, diabetes, hypertension, or smoking) and a calculated 10-year CVD event risk of 10% or greater.",
    "Errors": null
  }
}
--------------- DONE ---------------
```

#### Discovering CQL Hooks Services

The following command issues the "discover" call to the CDS Hooks API:

```
$ node client hooks-discover
```

If successful, you should see something like this:

```
--------------- START --------------
STATUS: 200 OK
--------------- HEADERS ------------
access-control-allow-origin : *
x-dns-prefetch-control : off
x-frame-options : SAMEORIGIN
strict-transport-security : max-age=15552000; includeSubDomains
x-download-options : noopen
x-content-type-options : nosniff
x-xss-protection : 1; mode=block
access-control-allow-methods : GET, POST, OPTIONS
access-control-allow-credentials : true
access-control-allow-headers : Content-Type, Authorization
access-control-expose-headers : Origin, Accept, Content-Location, Location, X-Requested-With
content-type : application/json; charset=utf-8
content-length : 833
etag : W/"341-t6Nh4DreN5/Hv4V6+WqmKg"
date : Thu, 09 Aug 2018 19:46:40 GMT
connection : close
--------------- BODY ---------------
{
  "services": [
        {
      "id": "ascvd-risk",
      "hook": "patient-view",
      "title": "CMS’s Million Hearts® Model Longitudinal ASCVD Risk Assessment Tool for Baseline 10-Year ASCVD Risk",
      "description": "Provides the ability to calculate a baseline 10-Year ASCVD risk score to support primary prevention of ASCVD. It utilizes the 2013 ACC/AHA pooled cohort equation to calculate the risk of developing a first time \"hard\" ASCVD event, defined as: nonfatal myocardial infarction (MI), coronary heart disease (CHD) death, nonfatal stroke, or fatal stroke.",
      "prefetch": {
        "Patient": "Patient/{{context.patientId}}",
        "Observation": "Observation?patient={{context.patientId}}",
        "Condition": "Condition?patient={{context.patientId}}",
        "MedicationStatement": "MedicationStatement?patient={{context.patientId}}",
        "MedicationOrder": "MedicationOrder?patient={{context.patientId}}"
      }
    },
    {
      "id": "statin-use",
      "hook": "patient-view",
      "title": "Statin Use for the Primary Prevention of CVD in Adults",
      "description": "Presents a United States Preventive Services Task Force (USPSTF) statin therapy recommendation for adults aged 40 to 75 years without a history of cardiovascular disease (CVD) who have 1 or more CVD risk factors (i.e., dyslipidemia, diabetes, hypertension, or smoking) and a calculated 10-year CVD event risk score of 7.5% or greater.",
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

#### Calling a CQL Hooks Service

The following command calls the statin-use CDS Hook with a synthetic patient:

```
$ node client hooks-call
```

If successful, you should see something like this:

```
--------------- START --------------
STATUS: 200 OK
--------------- HEADERS ------------
access-control-allow-origin : *
x-dns-prefetch-control : off
x-frame-options : SAMEORIGIN
strict-transport-security : max-age=15552000; includeSubDomains
x-download-options : noopen
x-content-type-options : nosniff
x-xss-protection : 1; mode=block
access-control-allow-methods : GET, POST, OPTIONS
access-control-allow-credentials : true
access-control-allow-headers : Content-Type, Authorization
access-control-expose-headers : Origin, Accept, Content-Location, Location, X-Requested-With
content-type : application/json; charset=utf-8
content-length : 815
etag : W/"1a0-3Nbiql4WsXU2ekDSxxApOg"
date : Thu, 09 May 2019 21:02:49 GMT
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
        "url": "https://cds.ahrq.gov/cdsconnect/artifact/statin-use-primary-prevention-cvd-adults"
      },
      "extension": {
        "grade": "B",
        "rationale": "The USPSTF found adequate evidence that use of low- to moderate-dose statins reduces the probability of CVD events (MI or ischemic stroke) and mortality by at least a moderate amount in adults aged 40 to 75 years who have 1 or more CVD risk factors (dyslipidemia, diabetes, hypertension, or smoking) and a calculated 10-year CVD event risk of 10% or greater."
      }
    }
  ]
}
--------------- DONE ---------------
```

#### Test Client Arguments

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
    --endpoint http://localhost:3000/api/library/USPSTF_Statin_Use_for_Primary_Prevention_of_CVD_in_Adults_FHIRv102/version/1.1.0
    --message test/examples/exec/DSTU2/unhealthy_patient.json

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
    --message test/examples/hooks/DSTU2/unhealthy_patient.json

  Options:

    -h, --help            output usage information
    -e, --endpoint <url>  The endpoint to post the message to
    -m, --message <path>  The path containing the JSON message to post
```

### The CDS Hooks Sandbox

CDS Hooks provides a public sandbox for testing CDS Hooks services.  This sandbox can be used to test CQL Hooks services.

The general steps to test a CQL Hooks service in the CDS Hooks sandbox is as follows:

1. Browse to http://sandbox.cds-hooks.org/
2. In the top-right of the page, click the gear icon and choose "Add CDS Services"
3. In the resulting dialog box, type "http://localhost:3000/cds-services" (changing the hostname/port as appropriate)
4. Click "Save"
5. Choose your CQL Hooks service from the "Select a Service" dropdown menu
6. If the current patient triggers any of your card conditions, you should see your card
7. Refer the the [CDS Hooks sandbox documentation](https://github.com/cds-hooks/sandbox) for more information on using it

## Linting the Code

To encourage quality and consistency within the code base, all code should pass eslint without any warnings.  Many text editors can be configured to automatically flag eslint violations.  We also provide an npm script for running eslint on the project.  To run eslint, execute the following command:
```
$ yarn run lint
```