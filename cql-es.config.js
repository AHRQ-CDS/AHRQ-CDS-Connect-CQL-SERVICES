// See: http://pm2.keymetrics.io/docs/usage/application-declaration/
module.exports = {
  apps : [
    {
      name      : 'cql-es',
      script    : 'bin/www',
      env: {
        NODE_ENV: 'development'
      },
      env_production : {
        NODE_ENV: 'production'
      }
    }
  ]
};
