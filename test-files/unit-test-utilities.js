/**
 * Create an object to encapsulate the utility functions to be used by the unit-test code.
 */
var Utils = {};

/**
 * This is a utility function for making AJAX requests (JSON calls) using jQuery's $.ajax() method.
 * The method and url parameters are required; the rest are optional and may be omitted. Therefore,
 * you can call:
 *
 *     Utils.makeJsonCall( "GET", "http://www.example.com" );
 *     Utils.makeJsonCall( "GET", "http://www.example.com", headers );
 *     Utils.makeJsonCall( "GET", "http://www.example.com", headers, data, true );
 *     Utils.makeJsonCall( "GET", "http://www.example.com", headers, data, true, callback );
 *
 * However, the optional parameters CANNOT be skipped, so to specify a callback without any headers
 * or data, you must fill in the "gaps" with null as follows:
 *
 *     Utils.makeJsonCall( "GET", "http://www.example.com", null, null, null, callback );
 *
 * @param method - a required string specifying the HTTP request method.
 * @param url - a required string specifying the HTTP request URL.
 * @param headers - an object containing string-string key-value pairs specifying the HTTP request
 *                  headers; pass in undefined or null to make the JSON call without any headers.
 * @param data - if convertDataIntoQueryString is true, then this is an object containing string-
 *               string key-value pairs to be converted into a query string and appended to the
 *               end of the URL; otherwise, this is an object to be converted into a JSON string
 *               and included as the HTTP request body; pass in undefined or null to make the JSON
 *               call without any data, in which case convertDataIntoQueryString is ignored.
 * @param convertDataIntoQueryString - true to convert the data object into a query string and
 *                                     append it to the end of the URL, false to convert the data
 *                                     object into a JSON string and include it as the HTTP request
 *                                     body; ignored if data is undefined or null.
 * @param callback - a callback function to be called upon completion of the AJAX request; this
 *                   function is passed to the jQuery $.ajax() method as the "complete" handler,
 *                   to be called both upon success and error; (note: 400-level and 500-level HTTP
 *                   status codes cause jQuery to call the "error" handler, and NOT the "success"
 *                   handler, but the "complete" handler will be called regardless of the status);
 *                   for more info, see: http://api.jquery.com/jQuery.ajax/#jQuery-ajax-settings
 *                   (scroll down to the "complete" setting); this callback may be omitted.
 */
Utils.makeJsonCall = function (method, url, headers, data, convertDataIntoQueryString, callback) {
  // Initialize the $.ajax() settings object
  var ajaxSettings = {
    type: method,
    url: url,
    dataType: "json"
  };

  // Add the headers to the settings object if they were specified
  if (typeof headers !== "undefined" && headers !== null) {
    ajaxSettings.headers = headers;
  }

  // If the data object was specified, then check the convertDataIntoQueryString parameter.
  // If it's true, then tell jQuery to convert the data object into a query string. Otherwise,
  // convert the data object into a JSON string and set it as the request body.
  if (typeof data !== "undefined" && data !== null) {
    if (convertDataIntoQueryString) {
      ajaxSettings.data = data;
      ajaxSettings.processData = true;
    } else {
      ajaxSettings.contentType = "application/json";
      ajaxSettings.data = JSON.stringify(data);
      ajaxSettings.processData = false;
    }
  }

  // Add the callback to the settings object as the "complete" handler if it was specified
  if (typeof callback !== "undefined" && callback !== null) {
    ajaxSettings.complete = callback;
  }

  // Send the AJAX request
  $.ajax(ajaxSettings);
};

/**
 * This is a utility function for checking whether an element is in an array, up to the ===
 * (strict-equal) operator.
 */
Utils.isInArray = function (element, array) {
  for (var index = 0; index < array.length; index++) {
    if (array[ index ] === element) {
      return true;
    }
  }
  return false;
};

/**
 * This is a utility function for checking whether a number is between min and max, inclusive.
 */
Utils.isNumberBetween = function (number, min, max) {
  return min <= number && number <= max;
};
