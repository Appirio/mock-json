/**
 * Module dependencies.
 */

var
  express = require('express'),
  http = require('http'),
  appInit = require('./app.init.js'),
  log = require('./services/logger'),
  app = express();

appInit.configureTemplateEngine(app);
appInit.configureMiddleware(app);
appInit.configureErrorHandler(app);

require('./routes')(app);

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
