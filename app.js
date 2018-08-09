'use strict';

const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const helmet = require('helmet');

const index = require('./routes/index');
const apiLibrary = require('./routes/api/library');
const cdsServices = require('./routes/cds-services');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

if(app.get('env') !== 'test') {
  app.use(logger(':date[iso] :remote-addr ":method :url" :status :res[content-length]'));
}
app.use(helmet());
app.use(bodyParser.json({type: function (msg)  {
  return msg.headers['content-type'] && msg.headers['content-type'].startsWith('application/json');
}}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/api/library', apiLibrary);
app.use('/cds-services', cdsServices);

// error handler
app.use((err, req, res, next) => {
  // Log the error
  console.error((new Date()).toISOString(), `ERROR: ${err.message}\n  ${err.stack}`);

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
