# CQL Execution Service

The CQL Execution Service is an Express-based RESTful service for executing CQL.

This project was initialized using the [Express application generator](https://expressjs.com/en/starter/generator.html) (from which it gets its project structure and dependencies).

# Installing on Windows Server 2012

This service will be piloted on Windows Server 2012.  Installation instructions are [here](docs/windows_2012_install.md).

# Setting Up the Environment

To use this project, you should perform the following steps:

1. Install [Node.js](https://nodejs.org/en/download/)
2. Install [Yarn](https://yarnpkg.com/en/docs/install)
3. Execute the following from this project's root directory: `yarn`

# Configuration

## Setting NLM Credentials for VSAC Downloads

To support dynamic downloads of value sets from VSAC, VSAC credentials must be supplied.  These are provided by setting `UMLS_USER_NAME` and `UMLS_PASSWORD` environment variables.

## Ignoring VSAC Errors

If there are errors downloading value sets, the execution service will abort the execution request.  To change this behavior so that VSAC errors are ignored set the `IGNORE_VSAC_ERRORS` environment variable to `true`.

_NOTE: This should only be done during development since unresolved value sets may affect CDS results!_

## Overriding the Web Application Port

To override the port, set your system's `PORT` environment variable to the desired port.

# Running the Web Application

To run the server on Mac/Linux:
```
$ DEBUG=cql-exec-service:* npm start
```

To run the server on Windows:
```
> set DEBUG=cql-exec-service:* & npm start
```

_NOTE: Setting DEBUG is optional, but is recommended in the Express documentation._

Access the application at [http://localhost:3000/](http://localhost:3000/).

# Linting the Code

To encourage quality and consistency within the code base, all code should pass eslint without any warnings.  Many text editors can be configured to automatically flag eslint violations.  We also provide an npm script for running eslint on the project.  To run eslint, execute the following command:
```
$ yarn run lint
```