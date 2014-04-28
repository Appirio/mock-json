/**
 * Create an instance of the logger for the app
 */
var winston = require('winston');
var consoleTransport = new (winston.transports.Console)({ colorize: true, timestamp: true });
module.exports = new winston.Logger({ transports: [ consoleTransport ] });

