'use strict';

// See: http://pm2.keymetrics.io/docs/usage/application-declaration/
module.exports = {
  apps : [
    {
      name      : 'cql-es',
      script    : 'bin/www',
      env: {
        NODE_ENV: 'production',
        UMLS_USER_NAME: 'umls_user_name',
        UMLS_PASSWORD: 'umls_password'
      }
    }
  ]
};
