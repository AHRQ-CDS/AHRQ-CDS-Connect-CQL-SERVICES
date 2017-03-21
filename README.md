# CQL Execution Service

The CQL Execution Service is an Express-based RESTful service for executing CQL.

This project was initialized using the [Express application generator](https://expressjs.com/en/starter/generator.html) (from which it gets its project structure and dependencies).

# Setting Up the Environment

To use this project, you should perform the following steps:

1. Install [Node.js](https://nodejs.org/en/download/)
2. Install [Yarn](https://yarnpkg.com/en/docs/install)
3. Execute the following from this project's root directory: `yarn`

# Running the Web Application

To run the server on Mac/Linux:
```
$ DEBUG=myapp:* npm start
```

To run the server on Windows:
```
> set DEBUG=myapp:* & npm start
```

_NOTE: Setting DEBUG is likely not necessary, but is recommended in the Express documentation._

Access the application at [http://localhost:3000/](http://localhost:3000/).

# Overriding the Web Application Port

To override the port, set your system's `PORT` environment variable to the desired port.

# Linting the Code

To encourage quality and consistency within the code base, all code should pass eslint without any warnings.  Many text editors can be configured to automatically flag eslint violations.  We also provide an npm script for running eslint on the project.  To run eslint, execute the following command:
```
$ yarn run lint
```