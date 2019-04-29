FROM keymetrics/pm2:8-alpine

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

# First copy over the yarn files and install dependencies (multi-stage build optimization)
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY ./package.json .
COPY ./yarn.lock .
RUN yarn install --production

# Now copy over the remaining relevant files
COPY ./bin /usr/src/app/bin
COPY ./lib /usr/src/app/lib
COPY ./config /usr/src/app/config
COPY ./public /usr/src/app/public
COPY ./routes /usr/src/app/routes
COPY ./views /usr/src/app/views
COPY ./app.js /usr/src/app/app.js
COPY ./CODE-OF-CONDUCT.md /usr/src/app/CODE-OF-CONDUCT.md
COPY ./CONTRIBUTING.md /usr/src/app/CONTRIBUTING.md
COPY ./cql-es.config.js /usr/src/app/cql-es.config.js
COPY ./LICENSE /usr/src/app/LICENSE
COPY ./README.md /usr/src/app/README.md
RUN mkdir -p /usr/src/app/localCodeService/vsac_cache
RUN chown node /usr/src/app/localCodeService/vsac_cache

# Clean up a bit to save space
RUN yarn cache clean

# Expose the server port
EXPOSE 3000

# Run using the node user (otherwise runs as root, which is security risk)
USER node

WORKDIR /usr/src/app
CMD [ "pm2-runtime", "start", "cql-es.config.js", "--env", "production" ]