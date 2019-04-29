'use strict';

// See: https://pm2.io/doc/en/runtime/guide/ecosystem-file
module.exports = {
  apps : [{
    name      : 'cql-es',
    script    : 'bin/www',
    env: {
      NODE_ENV: 'development',
    },
    env_production: {
      NODE_ENV: 'production',
    }
  }]
};
