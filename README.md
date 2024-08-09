# CQL Services

## About

CQL Services is an Express.js application that provides RESTful services for executing CQL.  Currently two services are provided:

- CQL Exec: A custom RESTful API for invoking CQL and receiving back the calculated results as JSON
- CQL Hooks: A standards-based RESTful API that exposes configured CQL according to version 2.0 of the [CDS Hooks](https://cds-hooks.hl7.org/) standard

The CQL Exec API was used to pilot the [Statin Use for the Primary Prevention of CVD in Adults](https://cds.ahrq.gov/cdsconnect/artifact/statin-use-primary-prevention-cvd-adults-clinician-facing-cds-intervention) artifact in 2017.

The CQL Hooks API was used to pilot the following artifacts in 2019:
- [Statin Use for the Primary Prevention of CVD in Adults: Patient-Facing CDS Intervention](https://cds.ahrq.gov/cdsconnect/artifact/statin-use-primary-prevention-cvd-adults-patient-facing-cds-intervention)
- [Healthful Diet and Physical Activity for CVD Prevention in Adults With Cardiovascular Risk Factors](https://cds.ahrq.gov/cdsconnect/artifact/healthful-diet-and-physical-activity-cvd-prevention-adults-cardiovascular-risk)
- [Abnormal Blood Glucose and Type 2 Diabetes Mellitus: Part One, Screening](https://cds.ahrq.gov/cdsconnect/artifact/abnormal-blood-glucose-and-type-2-diabetes-mellitus-part-one-screening)
- [Abnormal Blood Glucose and Type 2 Diabetes Mellitus: Part Two, Counseling](https://cds.ahrq.gov/cdsconnect/artifact/abnormal-blood-glucose-and-type-2-diabetes-mellitus-part-two-counseling)
For more information, please see the 2019 [pilot report](https://cds.ahrq.gov/sites/default/files/cds/artifact/1056/CDS%20Connect_Year%203%20Pilot%20Report_Final.pdf).

Since these pilots, CQL Services has also been updated to support FHIR STU3 and FHIR R4.  The version of FHIR will automatically be detected from the CQL library.

These prototype services are part of the [CDS Connect](https://cds.ahrq.gov/cdsconnect) project, sponsored by the [Agency for Healthcare Research and Quality](https://www.ahrq.gov/) (AHRQ), and developed under contract with AHRQ by MITRE's [Health FFRDC](https://www.mitre.org/our-impact/rd-centers/health-ffrdc).

## Contributions

For information about contributing to this project, please see [CONTRIBUTING](CONTRIBUTING.md).

## Development Details

This project was initialized using the [Express application generator](https://expressjs.com/en/starter/generator.html) (from which it gets its project structure and dependencies).

### Installing for Development

To use this project in a development environment, you should perform the following steps:

1. Install [Node.js LTS] (https://nodejs.org/en/download/)
2. Execute the following from this project's root directory:
    ```sh
    $ npm install
    ```

## Configuration

### Setting NLM Credentials for VSAC Downloads

The CQL Services require a free Unified Medical Language System (UMLS) account from the National Library of Medicine (NLM).  If you do not yet have an account, [sign up here](https://uts.nlm.nih.gov//license.html).

Once you have your NLM credentials, you must assign your API Key to the `UMLS_API_KEY` environment variable.  Your API Key may be found in your [UMLS Profile](https://uts.nlm.nih.gov//uts.html#profile).

Mac/Linux:
```sh
$ export UMLS_API_KEY=myapikey
```

Windows:
```bat
> set UMLS_API_KEY=myapikey
```

If you do not properly set the above environment variable, the CQL Services will fail to download the required value sets from VSAC.

### Ignoring VSAC Errors

If there are errors downloading value sets, the services will abort the execution request.  To change this behavior so that VSAC errors are ignored set the `IGNORE_VSAC_ERRORS` environment variable to `true`.

Mac/Linux:
```sh
$ export IGNORE_VSAC_ERRORS=true
```

Windows:
```bat
> set IGNORE_VSAC_ERRORS=true
```

_NOTE: This should only be done during development since unresolved value sets may affect CDS results!_

### Overriding the CQL Services Port

The default port for this web application is `3000`.  To override the port, set your system's `PORT` environment variable to the desired port.

Mac/Linux:
```sh
$ export PORT=9000
```

Windows:
```bat
> set PORT=9000
```

### Overriding the Maximum Request Size

By default, requests over 1 MB large will be rejected.  To override the max request size, set your system's `CQL_SERVICES_MAX_REQUEST_SIZE` environment variable to the desired value using one of the following units: `b`, `kb`, `mb`, and `gb`.

Mac/Linux:
```sh
$ export CQL_SERVICES_MAX_REQUEST_SIZE=2mb
```

Windows:
```bat
> set CQL_SERVICES_MAX_REQUEST_SIZE=2mb
```

### Card Logging

Implementers can turn on card logging to log all CDS Hooks cards that were delivered by the service. This feature also logs any [feedback](https://cds-hooks.hl7.org/2.0/#feedback) received for each card. Since cards and feedback may contain sensitive data, CQL Services does not store or display cards or feedback by default. Implementers should use the `CARD_LOGGING` environmental variable to turn on card logging so that cards and feedback are stored to disk or displayed on the console.

To save cards and feedback as individual JSON files in a folder, set your system's `CARD_LOGGING` environment variable to `file:` , followed by a valid path to a folder (e.g., `file:/users/bob/hooks/cardlogs`). If the path is relative, it will be evaluated relative to the root folder of the CQL Services project. If the path does not exist or is not a valid folder, an error will be emitted and cards and feedback will not be saved.

Mac/Linux:
```sh
$ export CARD_LOGGING=file:/path/to/folder
```

Windows:
```bat
> set CARD_LOGGING=file:C:\path\to\folder
```

To log cards and feedback to the console _instead_ of saving them to a folder, set your system's `CARD_LOGGING` environment variable to `console`.

Mac/Linux:
```sh
$ export CARD_LOGGING=console
```

Windows:
```bat
> set CARD_LOGGING=console
```

To disable logging of cards and feedback, do not set the `CARD_LOGGING` environmental variable at all,  or set it to `off`.

Mac/Linux:
```sh
$ export CARD_LOGGING=off
```

Windows:
```bat
> set CARD_LOGGING=off
```

## Adding CQL Libraries

This service is packaged with a simple Condition and Medication Count library as well as the [Statin Use for Primary Prevention of CVD in Adults](https://cds.ahrq.gov/cdsconnect/artifact/statin-use-primary-prevention-cvd-adults-clinician-facing-cds-intervention) CQL library.  You can find their ELM JSON files in subfolders of the _config/libraries_ folder.

To add other CQL libraries, you must first [translate them to ELM JSON](https://github.com/cqframework/clinical_quality_language/tree/master/Src/java).  You can then add their ELM JSON (and the ELM JSON of any dependencies) to the _config/libraries_ folder or any subfolder within it.

_NOTE: The CQL Services currently supports the FHIR 1.0.2, 3.0.0, 4.0.0, and 4.0.1 data models.  They will not work with CQL that uses any other data models._

## Adding CQL Hooks

This service is packaged with an example Condition and Medication Count CQL Hook as well as an example [Statin Use for Primary Prevention of CVD in Adults](https://cds.ahrq.gov/cdsconnect/artifact/statin-use-primary-prevention-cvd-adults-clinician-facing-cds-intervention) CQL Hook.  You can find the hook configs in the _config/hooks_ folder.  Note that they require the corresponding ELM JSON files in the _localRepsitory_ folder.

To add other CQL Hooks, add a configuration file for them in the _config/hooks_ folder, and add their ELM JSON to the _config/libraries_ folder, as described in the above section.

### CQL Hooks Config

CQL libraries are associated with CDS Hooks services via configuration files. CQL Hooks configuration files generally have the following properties:

- **id**: the unique id that identifies this service. This is used directly in the services discovery response.
- **hook**: the hook that should trigger this service. This is used directly in the services discovery response.
- **title**: the title of this service. This is used directly in the services discovery response.
- **description**: a short description of the service. This is used directly in the services discovery response.
- **usageRequirements**: an _optional_ description of any preconditions for the use of the service. This is used directly in the services discovery response.
- **prefetch**: an _optional_ object to support adding, overriding, or removing prefetch keys in the generated [prefetch template](https://cds-hooks.hl7.org/2.0/#prefetch-template). If a specified key does not exist in the prefetch template generated from the CQL, it will be added. If a specified key matches a key in the generated prefetch template, then if the specified value for that key is a non-empty string, it will override the generated prefetch value for that key. If the specified value for a key is `null` or an empty string (`""`), then that prefetch key will be _removed_ from the prefetch template. Any keys in the generated prefetch template that are _not_ in the `prefetch` configuration object will remain in the prefetch template as-is.
- **extension**: an _optional_ object to support arbitrary [extensions](https://cds-hooks.hl7.org/2.0/#extensions) in the service definition. This is used directly in the services discovery response.
- **_config**: a configuration object that indicates how cards are generated and the CQL library to use for this service.
  - **cards**: an array of objects describing specific cards to be returned and the conditions under which to return them.
    - **conditionExpression**: the name of an expression in the CQL that should be checked to determine if the card should be returned.  If the expression evaluates to `null`, `false`, `0`, or `''` for the patient, then the card will be suppressed; otherwise it will be returned.  If the configuration does not specify a `conditionExpression`, then the card will always be returned.
    - **card**: details about the card to be returned if the `conditionExpression` is truthy (or if no `conditionExpression` is provided).
      - For details about what fields can go into cards, refer to the [CDS Hooks Card Attributes](https://cds-hooks.hl7.org/2.0/#card-attributes) documentation.
      - Specify [extensions](https://cds-hooks.hl7.org/2.0/#extensions) using the reserved `extension` property.
      - The CQL Hooks service performs string interpolation on all card values -- allowing you to customize them with the  patient's CQL results.  For example, `${Recommendation}` will be replaced at run-time with the value of the `Recommendation` expression result from the CQL.
      - CQL Hooks will automatically generate card uuid values and suggestion uuid values unless the configuration provides them already.
  - **systemActions**: an array of objects describing specific system actions to be returned and the conditions under which to return them.
    - **conditionExpression**: the name of an expression in the CQL that should be checked to determine if the system action should be returned.  If the expression evaluates to `null`, `false`, `0`, or `''` for the patient, then the system action will be suppressed; otherwise it will be returned.  If the configuration does not specify a `conditionExpression`, then the system action will always be returned.
    - **action**: details about the system action to be returned if the `conditionExpression` is truthy (or if no `conditionExpression` is provided).
      - For details about what fields can go into system actions, refer to the CDS Hooks [System Action](https://cds-hooks.hl7.org/2.0/#system-action) and [Action](https://cds-hooks.hl7.org/2.0/#action) documentation.
      - Specify [extensions](https://cds-hooks.hl7.org/2.0/#extensions) using the reserved `extension` property.
      - The CQL Hooks service performs string interpolation on all system action values -- allowing you to customize them with the  patient's CQL results.
  - **cql**
    - **library**
      - **id**: the id of the CQL library to run when this hook is invoked.
      - **version**: the version of the CQL library to run when this hook is invoked.

_NOTE: If additional properties are specified in the top-level of the CQL Hooks config, these will be mirrored in the service discovery response.  Similarly, if additional properties are specified in the CQL Hooks config's `_config.cards.card` object, these will be mirrored in the card response. The CDS Hooks specification, however, suggests that all non-standard data should be exchanged via the [extension](https://cds-hooks.hl7.org/2.0/#extensions) mechanism._

The following is an example of the hook configuration for the Statin Use artifact:

```json
{
  "id": "statin-use",
  "hook": "patient-view",
  "title": "Statin Use for the Primary Prevention of CVD in Adults",
  "description": "Presents a United States Preventive Services Task Force (USPSTF) statin therapy recommendation for adults aged 40 to 75 years without a history of cardiovascular disease (CVD) who have 1 or more CVD risk factors (i.e., dyslipidemia, diabetes, hypertension, or smoking) and a calculated 10-year CVD event risk score of 7.5% or greater.",
  "usageRequirements": "NOTE: This service requires a pre-calculated CVD 10-year risk score stored as an Observation w/ code: LOINC 79423-0",
  "prefetch": {
    "Medication": null
  },
  "_config": {
    "cards": [{
      "conditionExpression": "InPopulation",
      "card": {
        "summary": "Statin Use for the Primary Prevention of CVD in Adults",
        "indicator": "info",
        "detail": "${Recommendation}",
        "source": {
          "label": "CDS Connect: Statin Use for the Primary Prevention of CVD in Adults",
          "url": "https://cds.ahrq.gov/cdsconnect/artifact/statin-use-primary-prevention-cvd-adults"
        },
        "extension": {
          "grade": "${RecommendationGrade}",
          "rationale": "${Rationale}"
        }
      }
    }],
    "cql": {
      "library": {
        "id": "USPSTFStatinUseForPrimaryPreventionOfCVDInAdultsFHIRv401",
        "version": "2.0.0"
      }
    }
  }
}
```

Note that a `prefetch` configuration is provided to _remove_ the `Medication` prefetch key from the generated prefetch template. This means that the CQL will run without any `Medication` resource data. In this specific case, this avoids an unfiltered query for all `Medication` resources, but also means that `MedicationRequest` resources must specify the medication using `medicationCodeableConcept` rather than `medicationReference`.

_**Note**: No checking is performed by CQL Services that any hook configurations are actually valid. It is up to the user to ensure hook configurations used with the service comply with the CDS Hooks specification. This allows for improved compatibility across past and future versions of CDS Hooks._

### Error and Warnings

CQL Hooks automatically injects the response with errors and warnings if the CQL defines `Errors` and/or `Warnings` expressions.
- If the CQL has an expression named `Errors`, and if its result is non-empty, the response's `extension` object will contain an `errors` property whose value is the array of errors.
- If the CQL has an expression named `Warnings`, and if its result is non-empty, the response's `extension` object will contain a `warnings` property whose value is the array of warnings.

_**Note**: Prior to CQL Services 4.0, CQL Services put errors and warnings extensions into each individual card. This meant that if there were multiple cards, the errors and warnings would be repeated in each one. In addition, if there were no cards, the errors and warnings would not be reported at all. For this reason, CQL Services 4.0 and above now returns errors and warnings as extensions on the base response object instead. This allows the errors and warnings to be reported regardless of card results and also eliminates duplication of error messages._

### CQL Hooks Data Exchange

The CDS Hooks API allows two ways of getting patient data: via prefetch data sent with the service call or via direct access to the FHIR server.  When CQL is loaded for a CQL Hooks service, the CQL will be analyzed to determine what FHIR resources it needs, and the prefetch requirements will be dynamically generated into the services metadata.

If a CQL Hooks service is invoked without the required prefetch data, CQL Services will attempt to query the FHIR server (specified in the request) for the data.  If it fails to retrieve the data from the FHIR server, then an HTTP 412 (Precondition Failed) error will be returned.

_**Note**: This service does not attempt to decode and validate any JSON Web Tokens (JWT) sent along with any requests.  This means that all requests are implicitly trusted and that all calls to the CQL Services that contain real patient data should originate from the same host and avoid going over the network._

## Running CQL Services

To run the server, simply invoke `npm start`.
```
$ npm start
```

_**NOTE**: This service operates on HTTP only.  This means that information between the client and the server is **not** encrypted.  Under this configuration, calls to the CQL Services that contain real patient data should originate from the same host and avoid going over the network._

## CQL Services for Docker

CQL Services also includes a `Dockerfile` for building a [Docker](https://www.docker.com/) image that can be used for deploying CQL Services as a container.

To build the CQL Services Docker image:
```sh
$ docker build -t cql-services .
```

To ceate and run a `cql-services` container:
```sh
$ docker run --name cql-services -d -p "3000:3000" -e "UMLS_API_KEY=myKey" -e "CQL_SERVICES_MAX_REQUEST_SIZE=2mb" -v /data/cql-services/config:/usr/src/app/config cql-services:latest
```

* `docker run` creates and runs a new container based on the requested image.
* `--name cql-services` gives the container a name by which it can be referred to via other Docker commands.
* `-d` indicates that the container should run as a daemon (instead of blocking the current thread).
* `-p "3000:3000"` indicates that port 3000 of the container should be mapped to port 3000 of the host.  Without this, the service is not accesible outside the container.
* `-e "UMLS_API_KEY=apiKey"` passes the UMLS API Key as an environment variable.  This is required, and the preferred credential to download value sets for execution.
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

```sh
$ node client exec-post
```

If successful, you should see something like this:

```
--------------- START --------------
STATUS: 200 OK
--------------- HEADERS ------------
access-control-allow-origin : *
content-security-policy : default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
cross-origin-opener-policy : same-origin
cross-origin-resource-policy : same-origin
origin-agent-cluster : ?1
referrer-policy : no-referrer
strict-transport-security : max-age=15552000; includeSubDomains
x-content-type-options : nosniff
x-dns-prefetch-control : off
x-download-options : noopen
x-frame-options : SAMEORIGIN
x-permitted-cross-domain-policies : none
x-xss-protection : 0
location : /api/library/USPSTFStatinUseForPrimaryPreventionOfCVDInAdultsFHIRv401/version/2.0.0
content-type : application/json; charset=utf-8
content-length : 757
etag : W/"2f5-OgN5EHu2xuo6m+GW52X2hI08580"
date : Fri, 17 May 2024 13:20:54 GMT
connection : close
--------------- BODY ---------------
{
  "library": {
    "name": "USPSTFStatinUseForPrimaryPreventionOfCVDInAdultsFHIRv401",
    "version": "2.0.0"
  },
  "returnExpressions": [
    "Recommendation",
    "Rationale",
    "Errors"
  ],
  "timestamp": "2024-05-17T13:20:54.126Z",
  "patientID": "1",
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

```sh
$ node client hooks-discover
```

If successful, you should see something like this:

```
--------------- START --------------
STATUS: 200 OK
--------------- HEADERS ------------
access-control-allow-origin : *
content-security-policy : default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
cross-origin-opener-policy : same-origin
cross-origin-resource-policy : same-origin
origin-agent-cluster : ?1
referrer-policy : no-referrer
strict-transport-security : max-age=15552000; includeSubDomains
x-content-type-options : nosniff
x-dns-prefetch-control : off
x-download-options : noopen
x-frame-options : SAMEORIGIN
x-permitted-cross-domain-policies : none
x-xss-protection : 0
access-control-allow-methods : GET, POST, OPTIONS
access-control-allow-credentials : true
access-control-allow-headers : Content-Type, Authorization
access-control-expose-headers : Origin, Accept, Content-Location, Location, X-Requested-With
content-type : application/json; charset=utf-8
content-length : 1574
etag : W/"626-3fmIL1Z7r/uOOoChRus6BebweT4"
date : Fri, 17 May 2024 13:21:52 GMT
connection : close
--------------- BODY ---------------
{
  "services": [
    {
      "id": "cond-med-count-r4",
      "hook": "patient-view",
      "title": "Condition and Medication Request Count",
      "description": "Counts the number of confirmed conditions and medication requests",
      "usageRequirements": "If prefetch data is not sent, a FHIR server should be available to support required queries",
      "prefetch": {
        "Patient": "Patient/{{context.patientId}}",
        "Condition": "Condition?patient={{context.patientId}}",
        "MedicationRequest": "MedicationRequest?patient={{context.patientId}}"
      }
    },
    {
      "id": "statin-use",
      "hook": "patient-view",
      "title": "Statin Use for the Primary Prevention of CVD in Adults",
      "description": "Presents a United States Preventive Services Task Force (USPSTF) statin therapy recommendation for adults aged 40 to 75 years without a history of cardiovascular disease (CVD) who have 1 or more CVD risk factors (i.e., dyslipidemia, diabetes, hypertension, or smoking) and a calculated 10-year CVD event risk score of 7.5% or greater.",
      "usageRequirements": "NOTE: This service requires a pre-calculated CVD 10-year risk score stored as an Observation w/ code: LOINC 79423-0",
      "prefetch": {
        "Patient": "Patient/{{context.patientId}}",
        "Observation": "Observation?patient={{context.patientId}}",
        "Condition": "Condition?patient={{context.patientId}}",
        "Procedure": "Procedure?patient={{context.patientId}}",
        "Encounter": "Encounter?patient={{context.patientId}}",
        "MedicationStatement": "MedicationStatement?patient={{context.patientId}}",
        "MedicationRequest": "MedicationRequest?patient={{context.patientId}}",
        "MedicationDispense": "MedicationDispense?patient={{context.patientId}}"
      }
    }
  ]
}
--------------- DONE ---------------
```

#### Calling a CQL Hooks Service

The following command calls the statin-use CDS Hook with a synthetic patient:

```sh
$ node client hooks-call
```

If successful, you should see something like this:

```
--------------- START --------------
STATUS: 200 OK
--------------- HEADERS ------------
access-control-allow-origin : *
content-security-policy : default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
cross-origin-opener-policy : same-origin
cross-origin-resource-policy : same-origin
origin-agent-cluster : ?1
referrer-policy : no-referrer
strict-transport-security : max-age=15552000; includeSubDomains
x-content-type-options : nosniff
x-dns-prefetch-control : off
x-download-options : noopen
x-frame-options : SAMEORIGIN
x-permitted-cross-domain-policies : none
x-xss-protection : 0
access-control-allow-methods : GET, POST, OPTIONS
access-control-allow-credentials : true
access-control-allow-headers : Content-Type, Authorization
access-control-expose-headers : Origin, Accept, Content-Location, Location, X-Requested-With
content-type : application/json; charset=utf-8
content-length : 815
etag : W/"32f-yEqi/NUi2DfkJvKQJGEPS0NM0dc"
date : Fri, 17 May 2024 13:22:21 GMT
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

#### Post Feedback on CDS Hooks Cards

The following command posts example card feedback to the statin-use CDS Hook:

```sh
$ node client hooks-feedback
```

If successful, you should see something like this:

```
--------------- START --------------
STATUS: 200 OK
--------------- HEADERS ------------
access-control-allow-origin : *
content-security-policy : default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
cross-origin-opener-policy : same-origin
cross-origin-resource-policy : same-origin
origin-agent-cluster : ?1
referrer-policy : no-referrer
strict-transport-security : max-age=15552000; includeSubDomains
x-content-type-options : nosniff
x-dns-prefetch-control : off
x-download-options : noopen
x-frame-options : SAMEORIGIN
x-permitted-cross-domain-policies : none
x-xss-protection : 0
access-control-allow-methods : GET, POST, OPTIONS
access-control-allow-credentials : true
access-control-allow-headers : Content-Type, Authorization
access-control-expose-headers : Origin, Accept, Content-Location, Location, X-Requested-With
content-type : text/plain; charset=utf-8
content-length : 2
etag : W/"2-nOO9QiTIwXgNtWtBJezz8kv3SLc"
date : Mon, 03 Jun 2024 12:06:09 GMT
connection : close
--------------- BODY ---------------
OK
--------------- DONE ---------------
```

#### Test Client Arguments

For advanced usage, such as using non-default endpoints or specifying other messages, run one of these commands:

- `node client exec-post --help`
- `node client hooks-discover --help`
- `node client hooks-call --help`
- `node client hooks-feedback --help`


```
$ node client exec-post --help
Usage: client exec-post|ep [options]

Post a JSON message to a library endpoint.  Options can be passed to
  specify the endpoint and message to post.  If not specified, the
  following defaults are used:
    --endpoint http://localhost:3000/api/library/USPSTFStatinUseForPrimaryPreventionOfCVDInAdultsFHIRv401/version/2.0.0
    --message test/examples/exec/R4/unhealthy_patient.json

Options:
  -e, --endpoint <url>  The endpoint to post the message to (default:
                        "http://localhost:3000/api/library/USPSTFStatinUseForPrimaryPreventionOfCVDInAdultsFHIRv401/version/2.0.0")
  -m, --message <path>  The path containing the JSON message to post (default:
                        "test/examples/exec/R4/unhealthy_patient.json")
  -h, --help            display help for command
```

```
$ node client hooks-discover --help
Usage: client hooks-discover|hd [options]

Get the CDS Hooks discovery endpoint.  Options can be passed to
  specify the endpoint.  If not specified, the following default is used:
    --endpoint http://localhost:3000/cds-services


Options:
  -e, --endpoint <url>  The endpoint to post the message to (default: "http://localhost:3000/cds-services")
  -h, --help            display help for command
```

```
$ node client hooks-call --help
Usage: client hooks-call|hc [options]

Call a CDS Hook.  Options can be passed to specify the endpoint and message to post.
  If not specified, the following defaults are used:
    --endpoint http://localhost:3000/cds-services/statin-use
    --message test/examples/hooks/R4/unhealthy_patient.json

Options:
  -e, --endpoint <url>  The endpoint to post the message to (default: "http://localhost:3000/cds-services/statin-use")
  -m, --message <path>  The path containing the JSON message to post (default:
                        "test/examples/hooks/R4/unhealthy_patient.json")
  -h, --help            display help for command
```

```
$ node client hooks-feedback --help
Usage: client hooks-feedback|hf [options]

Post feedback on CDS Hooks cards.  Options can be passed to specify the endpoint and message to post.
  If not specified, the following defaults are used:
    --endpoint http://localhost:3000/cds-services/statin-use/feedback
    --message test/examples/hooks/R4/feedback.json

Options:
  -e, --endpoint <url>  The endpoint to post the message to (default:
                        "http://localhost:3000/cds-services/statin-use/feedback")
  -m, --message <path>  The path containing the JSON message to post (default: "test/examples/hooks/R4/feedback.json")
  -h, --help            display help for command
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
$ npm run lint
```

## LICENSE

Copyright 2016-2023 Agency for Healthcare Research and Quality

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.