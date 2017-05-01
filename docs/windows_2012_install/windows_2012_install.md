# CDS Connect CQL Execution Service on Windows Server 2012

Installing the CDS Connect CQL Execution Service on Windows Server 2012 requires the following steps, detailed below:

* Install Node.js 6.10.x
* Install Yarn
* Install CQL Execution Service
* Install PM2
* Restart the CDS Connect CQL-ES Service
* Test

_**NOTE**: The current service operates on HTTP only.  This means that information between the client and the server is **not** encrypted, and anyone with access to the network can easily intercept data.  For this reason, only **test** data (no PII or PHI) should be used with this service.  A future version will support encrypted communication over HTTPS._

# Install

## Install Node.js 6.10.x

The CQL Execution Service is a [Node.js](https://nodejs.org/) application, so it requires the Node.js runtime environment.

To install Node.js, first visit [https://nodejs.org/en/download/](https://nodejs.org/en/download/) and download the LTS Windows Installer (currently at v6.10.2).

![Download Node.js](download_nodejs.png "Download Node.js")

Once the installer is downloaded, run the installer, always leaving the default options selected.

## Install Yarn

The CQL Execution Service uses a dependency management tool called [Yarn](https://yarnpkg.com/) to dynamically download dependency libraries.

To install the Yarn dependency management tool, visit [https://yarnpkg.com/lang/en/docs/install/](https://yarnpkg.com/lang/en/docs/install/), select the "Windows" tab, and click the "Download Installer" button.

![Download Yarn](download_yarn.png "Download Yarn")

Once the installer is downloaded, run the installer, always leaving the default options selected.

## Install CQL Execution Service

Installing the custom CQL Execution Service code requires extracting the cql-exec-service.zip file and performing a command to install its dependencies.  These steps are detailed below.

### Extract zip to C:\Pilot

The custom CQL Execution Service code is packaged in a cql-exec-service.zip file.  This file needs to be extracted into a new _C:\Pilot_ folder on the file system.

First, create the _C:\Pilot_ folder by opening the File Explorer, navigating to the _C:_ drive, selecting the _Home_ tab, and choosing "New folder".  Name the folder _Pilot_.

![Create C:\Pilot folder](create_pilot_folder.png "Create C:\Pilot folder")

Then navigate to the cql-exec-service.zip file to extract it to _C:\Pilot_.

![Extract cql-exec-service.zip](extract_cql_exec_service.png "Extract cql-exec-service.zip")

**Important**: Edit the location to be _C:\Pilot_ before clicking the _Extract_ button.

![Extract cql-exec-service.zip (Part 2)](extract_cql_exec_service_2.png "Extract cql-exec-service.zip (Part 2)")

### Install the CQL Execution Service Dependencies

The CQL Execution Service dependencies are installed by running a Yarn command in the Node.js command prompt.  First, launch the "Node.js commmand prompt" application from the start menu.

![Launch Node.js command prompt](launch_nodejs_command_prompt.png "Launch Node.js command prompt")

The command prompt is essentially a specially configure DOS environment:

![Node.js command prompt](nodejs_command_prompt.png "Node.js command prompt")

Then execute the commands:
```bat
> cd "C:\Pilot\cql-exec-service"
> yarn
```

If it is successful, you should see output similar to the following:
```
yarn install v0.21.3
[1/4] Resolving packages...
[2/4] Fetching packages...
[3/4] Linking dependencies...
[4/4] Building fresh packages...
Done in 61.25s.
```

## Install PM2

The CQL Execution Service uses [PM2](http://pm2.keymetrics.io/) as a process manager to ensure that the service runs on startup and recovers gracefully if the service crashes due to some unexpected issue.

### PM2 Program

PM2 can also be installed via the Node.js command prompt.  From the Node.js command prompt, execute the command:
```bat
> npm install pm2 -g
```

Some optional aspects of PM2 are not available on Windows.  As a result, you will likely see these two warnings (which are _expected_):
```
npm WARN optional SKIPPING OPTIONAL DEPENDENCY: fsevents@^1.0.0 (node_modules\pm2\node_modules\chokidar\node_modules\fsevents):
npm WARN notsup SKIPPING OPTIONAL DEPENDENCY: Unsupported platform for fsevents@1.1.1: wanted {"os":"darwin","arch":"any"} (current: {"os":"win32","arch":"x64"})
```

### PM2 Service

The PM2 Windows Service ensures that the application runs at startup and can be controlled via the Windows Service Manager.  To install the PM2 Windows Service, execute the following commands:
```bat
> mkdir "C:\Pilot\PM2"
> npm install pm2-windows-service -g
> pm2-service-install -n "CDS Connect CQL-ES"
```

The second command above will prompt you with several questions:

* ? Perform environment setup (recommended)? (Y/n) **Y**
* ? Set PM2_HOME? (Y/n)? **Y**
* ? PM2\_HOME value (this path should be accessible to the service user and should not contain any "user-context" variables \[e.g. %APPDATA%\]): () **C:\Pilot\PM2**
* ? Set PM2\_SERVICE\_SCRIPTS (the list of start-up scripts for pm2)? (Y/n) **Y**
* ? Set the list of startup scripts/files (semi-colon separated json config files or js files) () **C:\Pilot\cql-exec-service\cql-es.config.js**
* ? Set PM2\_SERVICE\_PM2\_DIR (the location of the global pm2 to use with the service)? \[recommended\] (Y/n) **Y**
* ? Specify the directory containing the pm2 version to be used by the service (C:\USERS\${Your\_Username}\APPDATA\ROAMING\NPM\node\_modules\pm2\index.js) **_\<hit enter key\>_**

After completing the setup, the service will be created.

# Restart the CDS Connect CQL-ES Service

Although the PM2 service installation indicates that the service has been started, this is often not actually the case.  To ensure the service is running, restart it from the Node.js command prompt:

```
> net stop "CDS Connect CQL-ES"
> net start "CDS Connect CQL-ES"
```

# Test

## The Home Page

If the service is running correctly, you should be able to load its home page in a browser by visiting: [http://localhost:3000](http://localhost:3000) (or replacing _localhost_ with the server name).

![CQL Execution Home Page](home_page.png "CQL Execution Home Page")

## The Test Client

From the Node.js command prompt, you can also execute a test client to ensure the API is working correctly.  This will post a message with synthetic data to the endpoint and show the response.

```bat
> node client post
```

If successful, you should see something like this:
```
--------------- START --------------
STATUS: 200 OK
--------------- HEADERS ------------
x-powered-by : Express
location : /api/library/ACCAHA_BaseASCVDRiskCalculator_FHIRv102/version/1/expression/PatientBaselineRisk
content-type : application/json; charset=utf-8
content-length : 197
etag : W/"c5-Sh2rTVJkZJjrb9nNplcOQQ"
date : Thu, 06 Apr 2017 15:02:11 GMT
connection : close
--------------- BODY ---------------
{
  "library": {
    "name": "ACCAHA_BaseASCVDRiskCalculator_FHIRv102",
    "version": "1"
  },
  "timestamp": "2017-04-06T15:02:11.043Z",
  "patientID": "2-1",
  "expression": "PatientBaselineRisk",
  "result": 0.32444153019908417
}
--------------- DONE ---------------
```

### Test Client Arguments

By default, the test client posts a synthetic records to the baseline risk endpoint, specifying that only the _PatientBaselineRisk_ expression should be returned.  These defaults can be overridden using commandline arguments.  For usage, run the command: `node client post --help`.

```bat
> node client post --help

  Usage: post|p [options]

  Post a JSON message to a library endpoint.  Options can be passed to
  specify the endpoint and message to post.  If not specified, the
  following defaults are used:
    --endpoint http://localhost:3000/api/library/ACCAHA_BaseASCVDRiskCalculator_FHIRv102/version/1/expression/PatientBaselineRisk
    --message test/fixtures/unhealthy_patient.json

  Options:

    -h, --help            output usage information
    -e, --endpoint <url>  The endpoint to post the message to
    -m, --message <path>  The path containing the JSON message to post
```

As an example, you can try posting a different file as the message:

```bat
node client post -m test\fixtures\healthy_patient.json
```

If successful, , you should see something like this (note the different _result_):
```
--------------- START --------------
STATUS: 200 OK
--------------- HEADERS ------------
x-powered-by : Express
location : /api/library/ACCAHA_BaseASCVDRiskCalculator_FHIRv102/version/1/expression/PatientBaselineRisk
content-type : application/json; charset=utf-8
content-length : 198
etag : W/"c6-0Vu3GQGwGdi1f089BqQ2WQ"
date : Thu, 06 Apr 2017 17:31:46 GMT
connection : close
--------------- BODY ---------------
{
  "library": {
    "name": "ACCAHA_BaseASCVDRiskCalculator_FHIRv102",
    "version": "1"
  },
  "timestamp": "2017-04-06T17:31:46.671Z",
  "patientID": "1-1",
  "expression": "PatientBaselineRisk",
  "result": 0.013991614443272016
}
--------------- DONE ---------------
```