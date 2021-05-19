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
    },
    out_file: 'logs/cql-services.log',
    error_file: 'logs/cql-services.log',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm Z'
  }]
};
