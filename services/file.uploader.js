/**
 * services/file.uploader
 *
 * This is essentially a client for Cloudinary that we use to load images
 */
var formidable = require('formidable');
var cloudinary = require('cloudinary');
var uuid = require('node-uuid');
var Q = require('q');
var config = require('../config');
var log = require('./logger');

module.exports = {

  /**
   * We don't want to save files on the file system, so this method will take an input
   * stream and upload it to Cloudinary
   * @param req The input POST request
   */
  createFromStream: function (req) {

    // our deferred object that will return a promise
    var deferred = Q.defer();

    // Configure the parameters for uploading to cloudinary
    cloudinary.config({
      cloud_name: config.cloudinaryCloudName,
      api_key: config.cloudinaryApiKey,
      api_secret: config.cloudinaryApiSecret
    });

    // Parse incoming request
    var form = new formidable.IncomingForm();
    form.parse(req);

    // if any errors, reject the deferred
    form.on('error', function (error) {
      deferred.reject(error);
    });

    // Upload the file to cloudinary
    form.on('file', function (name, file) {
      cloudinary.uploader.upload(file.path, function (result) {
        deferred.resolve(result);
      });
    });

    form.on('end', function () {
      log.info('got to end');
    });

    // return the promise to the caller
    return deferred.promise;
  }
};