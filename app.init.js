/**
 * Initialization and configuration of the web server
 */
var
  config = require('./config'),
  log = require('./services/logger'),
  exHbs = require('express3-handlebars'),
  express = require('express'),
  path = require('path'),
  staticFileRoot = process.env['STATIC_ROOT'] || '/';

module.exports = {

  /**
   * We will use the express handlebars template engine for the server
   * @param server
   */
  configureTemplateEngine: function (server) {
    server.engine('hbs', exHbs({
      defaultLayout: 'site-layout',
      extname: '.hbs',
      helpers: {

        //TODO: add cache busting here
        asset: function (filePath) {
          return staticFileRoot + filePath;
        }
      }
    }));
  },

  /**
   * Configure middleware
   * @param server Express server instance
   */
  configureMiddleware: function (server) {
    server.configure(function () {
      server.set('port', config.serverPort);         // PORT environment variable should be set in prod
      server.set('view engine', 'hbs');              // point to our handlebars implementation
      server.use(express.logger('dev'));             // will need to change this in production
      server.use(express.bodyParser());
      server.use(express.methodOverride());

      server.use(express.static(path.join(__dirname, 'public')));
      server.use('/cdn', express.static(__dirname + '/cdn'));
      server.use(server.router);
    });
  },

  /**
   * Handle any uncaught error in the app
   * @param server
   */
  configureErrorHandler: function (server) {
    server.on('uncaughtException', function (req, res, route, error) {
      log.error('Error: ', require('util').inspect(error));

      //TODO: likely want to do something a little more sophisticated than this
      res.send(error);
    });

    // in development we want express to handle errors
    server.configure('development', function () {
      server.use(express.errorHandler());
    });
  }
};
