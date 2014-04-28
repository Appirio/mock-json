/**
 * Load routes for the app
 *
 */

var
  config = require('../config'),
  fs = require('fs'),
  UglifyJS = require("uglify-js"),
  AWS = require('aws-sdk');

AWS.config.loadFromPath('./aws.credentials.json');

var apiNames = [];
for (var name in config.apiFilesPath) {
  apiNames.push(name);
}

module.exports = function (server) {
  (function () {
    //create Amazon Bucket
    var s3 = new AWS.S3();
    s3.setEndpoint(config.amazonEndpoint);

    s3.createBucket({Bucket: config.amazonBucket}, function (data) {
      console.dir(data);
    });
  })();

  //index page
  server.get('/', function (req, res) {
    res.render('home', {
      page: {
        head: {
          title: "MockJSON",
          description: "MockJSON"
        },
        apiNames: apiNames
      }
    });
  });

  //build result
  server.post('/', function (req, res) {
    var
      fullURL = "https://" + config.amazonEndpoint + '/' + config.amazonBucket,

      content = [],
      minify = req.body['minify'] === 'on',
      download = req.body['deployment_type'] === 'download',
      apiFilesList = config.mainFiles(),
      includedPlugins = [],
      linkToDownLoad;

    apiNames.forEach(function (api) {
      if (req.body[api] === 'on') {
        includedPlugins.push(api);
        apiFilesList.push(config.apiFilesPath[api]);
      }
    });
    apiFilesList.push(config.initFile);

    var
      dirKey = includedPlugins.join("---"),
      dir = 'cdn/' + dirKey,
      buildFilePath = dir + '/mock-json-build.js',
      buildMinFilePath = dir + '/mock-json-build.min.js';

    // Does the file already exist on aws

    apiFilesList.forEach(function (file) {
      content.push(fs.readFileSync(file));
      content.push('/*--------*/;');
    });
    content = content.join('\r\n');


    linkToDownLoad = buildFilePath;
    if (minify) {
      var result = UglifyJS.minify(content, {fromString: true});
      content = result.code;
      linkToDownLoad = buildMinFilePath;
    }

    if (download) {
      res.attachment(minify ? 'mock-json-build.min.js' : 'mock-json-build.js');
      res.sendfile(linkToDownLoad);
      return;
    }
    var s3 = new AWS.S3();
    s3.setEndpoint(config.amazonEndpoint);


    var params = {
      Bucket: config.amazonBucket,
      Key: linkToDownLoad,
      'ACL': 'public-read',
      Body: content
    };

    s3.putObject(params, function (err, data) {
      if (err) {
        console.log(err)
      } else {
        console.log("Successfully uploaded data to " + linkToDownLoad);
        console.dir(data);

      }
      res.render('build', {
        page: {
          head: {
            title: "MockJSON: build result" + (minify ? ' (min)' : ''),
            description: 'MockJSON'
          },
          body: {
            link: fullURL + '/' + linkToDownLoad
          }
        }
      });
    });


  });
};
