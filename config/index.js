/**
 * Simple convenience module to get the right configuration
 */
var environment = process.env.NODE_ENV || 'dev';
module.exports = require('./config.' + environment);
