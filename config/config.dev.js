/**
 * Config values for the app
 */
module.exports = {
  serverPort: process.env.PORT || 3000,
  mainFiles: function () {
    return [
      'lib/sinon/sinon-server-1.7.1.js',
      'lib/sinon/sinon-ie-1.7.1.js',
      'lib/mockjson/template-module.js',
      'lib/mockjson/api-library.js'
    ];
  },
  apiFilesPath: {
    Box: 'lib/plugins/box.js',
    SalesForce: 'lib/plugins/salesforce.js',
    Twitter: 'lib/plugins/twitter.js'
  },
  initFile: 'lib/mockjson/init.js',
  amazonBucket: 'appirio-mockjson',
  amazonEndpoint: 's3.amazonaws.com'
};