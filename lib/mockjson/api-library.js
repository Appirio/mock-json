/**
 * This module defines the mock JSON API library. For usage instructions, please see the
 * accompanying "README.pdf" file (jump down to the section titled "Library Usage Instructions").
 * For usage examples, please see the "mock-json-api-for-box.js" file.
 */
var MockJsonApiLib = ( function (undefined) {
  'use strict';

  // An array of mock endpoint objects, each of which specifies the request method and URL that
  // the endpoint expects and a request handler to respond to matching AJAX requests
  var mockEndpoints = [];

  // The Sinon.js FakeServer used to intercept AJAX requests
  var sinonFakeServer = null;

  // Whether or not AJAX interception is currently enabled
  var isEnabled = false;

  // This function adds the specified array of mock endpoint objects to our private array.
  // This function is exposed to the "outside world" at the end of this module and can
  // therefore be called via MockJsonApiLib.addMockEndpoints().
  function addMockEndpoints(newMockEndpoints) {
    mockEndpoints = mockEndpoints.concat(newMockEndpoints);
  }

  // This function removes all previously-added mock endpoint objects from our private array.
  // This function is exposed to the "outside world" at the end of this module and can
  // therefore be called via MockJsonApiLib.removeAllMockEndpoints(). This function is mainly
  // used for unit-testing purposes, but may be called for other reasons.
  function removeAllMockEndpoints() {
    mockEndpoints.length = 0;
  }

  // This function enables the interception of AJAX requests by using a Sinon.js FakeServer.
  // This function is exposed to the "outside world" at the end of this module and can
  // therefore be called via MockJsonApiLib.enable().
  function enable() {
    // If AJAX interception is already enabled, there's nothing to do
    if (isEnabled) {
      return;
    }

    // Create the FakeServer, which will cause it to start intercepting AJAX requests.
    // For more info, please see: http://sinonjs.org/docs/#fakeServer
    sinonFakeServer = sinon.fakeServer.create();

    // Get the underlying FakeXMLHttpRequest object used by the FakeServer to add a filter
    // function, which will be called by the FakeServer to determine whether or not a
    // particular AJAX request should be intercepted and faked. For more info, please see:
    // http://sinonjs.org/docs/#filtered-requests
    // http://stackoverflow.com/questions/15072136/how-in-sinon-filter-requests
    sinonFakeServer.xhr.useFilters = true;
    sinonFakeServer.xhr.addFilter(requestFilter);

    // Set up the FakeServer to handle incoming AJAX requests (that have passed the filter)
    // by calling the specified dispatcher function, which will dispatch the request to the
    // appropriate mock endpoint's request handler. Setting "autoRespond" to true tells the
    // FakeServer to auto call the dispatcher function after every request, so we don't need
    // to manually call sinonFakeServer.respond() each time. For more info, please see:
    // http://sinonjs.org/docs/#fakeServer
//        sinonFakeServer.respondWith( requestDispatcher );
//        sinonFakeServer.autoRespond = true;

    // AJAX interception has been enabled
    isEnabled = true;
  }

  // This function disables the interception of AJAX requests and restores the functionality
  // of XMLHttpRequest and other AJAX functions. This function is exposed to the "outside world"
  // at the end of this module and can therefore be called via MockJsonApiLib.disable().
  function disable() {
    // If AJAX interception is not enabled, there's nothing to do
    if (!isEnabled) {
      return;
    }

    // Call the FakeServer to restore the original functionality of the AJAX functions.
    // For more info, please see: http://sinonjs.org/docs/#fakeServer
    sinonFakeServer.restore();
    sinonFakeServer = null;

    // AJAX interception has been disabled
    isEnabled = false;
  }

  // This function is called by the FakeServer to determine whether or not an incoming AJAX
  // request (with the specified method and URL) should be intercepted and faked.
  // For more info, please see: http://sinonjs.org/docs/#filtered-requests
  function requestFilter(requestMethod, requestUrl) {
    // Remove the query string (i.e., the "?" and everything after it) from the request URL
    requestUrl = requestUrl.split("?", 1)[ 0 ];

    // If the incoming AJAX request matches one of the mock endpoints added to the library,
    // then return false to tell the FakeServer to intercept the request and call the
    // requestDispatcher() function to handle the request
    for (var index = 0, endpoint; endpoint = mockEndpoints[index]; index++) {
      if (isRequestMatchesEndpoint(requestMethod, requestUrl, endpoint)) {
        // Get the FakeXMLHttpRequest object from the FakeServer. For more info, see:
        // http://sinonjs.org/ (scroll down to the "Fake server" section on that page).
        var fakeXhr = sinonFakeServer.requests[ sinonFakeServer.requests.length - 1 ];

        // At this point, the FakeXMLHttpRequest object hasn't been fully initialized yet
        // by the FakeServer (e.g., the "requestHeaders" and "requestBody" are missing),
        // so wait until it is fully initialized before calling the requestDispatcher()
        // to handle the request. The following is not documented by the Sinon.JS docs;
        // I just found this via trial-and-error with the Chrome debugger, but it works.
        fakeXhr.addEventListener("loadstart", function () {
          var fakeXhr = this;

          // Call the requestDispatcher() function after 10 milliseconds.
          // This solves the Angular.js console error "$digest already in progress".
          setTimeout(function () {
            requestDispatcher(fakeXhr);
          }, 10);
        });

        return false;
      }
    }

    // Otherwise, return true to tell the FakeServer to filter out the request, so the
    // request will be "allowed through" to its real destination and NOT intercepted/faked
    return true;
  }

  // This function is called by the FakeServer to handle incoming AJAX requests that have passed
  // the filter. The FakeServer passes in a FakeXMLHttpRequest object with these properties:
  // http://sinonjs.org/docs/#FakeXMLHttpRequest. This function dispatches the request to the
  // appropriate mock endpoint's request handler.
  function requestDispatcher(fakeXhr) {
    // Separate the request query string from the request URL. If the URL contains no query
    // string, then requestUrlComponents[1] (and requestQueryString) will be undefined.
    var requestUrlComponents = fakeXhr.url.split("?", 2);
    var requestUrl = requestUrlComponents[0];
    var requestQueryString = requestUrlComponents[1];

    // Construct the request object to be passed to the endpoint's request handler (if it's a
    // function instead of an object). The "fakeXhr" object is a little too bloated, so we
    // create a simpler request object with only the properties that we need.
    var request = {
      method: fakeXhr.method,
      url: requestUrl,
      params: ( requestQueryString === undefined ) ? {} :
        parseQueryString(requestQueryString),
      headers: fakeXhr.requestHeaders,  // this is an object
      body: fakeXhr.requestBody  // this is a string
    };

    // Construct the response object to be passed to the endpoint's request handler (if it's a
    // function instead of an object). Either way, the handler will overwrite all, some, or
    // none of these properties, so these are the default values for each property.
    var response = {
      status: 200,
      headers: {},
      body: null
    };

    // An endpoint's asyncInitializer function, which, if it exists, indicates that some init code
    // needs to be run and a mock response will be provided at a later time
    var asyncInitializer = null;

    // An endpoint's request handler, which may be a function or an object
    var endpointHandler = null;

    // Whether or not the request has been fully handled by the current endpoint's handler
    var isRequestHandled = false;

    var responseBodyString;

    // Find the mock endpoint(s) that match(es) the incoming AJAX request
    for (var index = 0, endpoint; endpoint = mockEndpoints[index]; index++) {
      if (isRequestMatchesEndpoint(request.method, request.url, endpoint)) {
        // Add in the params
        var parsedParams = parseParams(request.url, endpoint.url);
        if (parsedParams !== undefined) {
          request.params = request.params || {};
          for (var attr in parsedParams) {
            request.params[attr] = parsedParams[attr];
          }
        }

        // Cache the endpoint's asyncInitializer function
        asyncInitializer = endpoint.asyncInitializer;

        // Cache the endpoint's request handler
        endpointHandler = endpoint.handler;

        // If the endpoint defined an "asyncInitializer" function, it means that the endpoint needs
        // to make an async callout for data and will provide a mock response at a later time
        if (asyncInitializer !== undefined) {
          // Attach a callback function to the request object that can be called by the
          // endpoint whenever it is ready to provide a mock response
          request.handleRequest = ( function (endpointHandler) {
            return function () {
              // Call the endpoint's handler function. Note that in this case, the endpoint's handler
              // must be a function, not a string or an object as is allowed in normal cases.
              endpointHandler(request, response);

              // If one of the endpoint request handlers assigned a template object to the response body,
              // then use it to generate the mock JSON response body string using the "MockJSON"
              // template system. For more info, please see the "mock-json-template-module.js" file,
              // which contains a modified version of the "MockJSON" library that's used by this library.
              responseBodyString = responseBodyString || (( response.body === null ) ? "" :
                JSON.stringify(MockJsonTemplateModule.generateFromTemplate(response.body)));

              // Instruct the FakeServer to send out the response. For more info, please see:
              // http://sinonjs.org/docs/#responses
              fakeXhr.respond(response.status, response.headers, responseBodyString);
            };
          }(endpointHandler) );

          // Call the endpoint's asyncInitializer function, which will make the async callout
          // for data and will need to call request.handleRequest() when it is ready
          isRequestHandled = asyncInitializer(request);

          // Break out of the for loop
          break;
        } else {
          // The endpoint's request handler may be a function or an object
          switch (toType(endpointHandler)) {
            // Allow the handler to pass back json as a string
            case "string":
              responseBodyString = isRequestHandled = endpointHandler;
              break;
            // If the handler is a function, then call it, passing in the request and
            // response objects. The handler will modify the response object based on the
            // data in the request object. Afterwards, it will return true (or not return
            // anything at all, in which case the return value is undefined) to indicate
            // that the request has been fully handled; it will return false otherwise.
            case "function":
              isRequestHandled = endpointHandler(request, response);
              break; // break out of the switch, NOT the for loop
            // If the handler is an object, then copy over the specified properties from
            // that object to our response object. Some properties may not be specified,
            // in which case keep the existing values for those properties. If the handler
            // is an object, it is equivalent to a function that has no return statement.
            case "object":
              if ("status" in endpointHandler) {
                response.status = endpointHandler.status;
              }
              if ("headers" in endpointHandler) {
                response.headers = endpointHandler.headers;
              }
              if ("body" in endpointHandler) {
                response.body = endpointHandler.body;
              }
              isRequestHandled = undefined;
              break; // break out of the switch, NOT the for loop
            default:
              isRequestHandled = undefined;
          }
        }

        // If the request has been fully handled, then we can break out of the for loop.
        // Otherwise, we need to find another matching endpoint to continue/finish
        // handling the request. If another matching endpoint is not found, then the
        // response is sent as-is.
        if (isRequestHandled === undefined || isRequestHandled === true) {
          break;
        }
      }
    }

    // If the endpoint defined an "asyncInitializer" function, it means that the endpoint needs
    // to make an async callout for data and will provide a mock response at a later time.
    // Otherwise, the endpoint has provided a mock response now, so send it.
    if (asyncInitializer === undefined) {
      // If one of the endpoint request handlers assigned a template object to the response body,
      // then use it to generate the mock JSON response body string using the "MockJSON"
      // template system. For more info, please see the "mock-json-template-module.js" file,
      // which contains a modified version of the "MockJSON" library that's used by this library.
      responseBodyString = responseBodyString || (( response.body === null ) ? "" :
        JSON.stringify(MockJsonTemplateModule.generateFromTemplate(response.body)));

      // Instruct the FakeServer to send out the response. For more info, please see:
      // http://sinonjs.org/docs/#responses
      fakeXhr.respond(response.status, response.headers, responseBodyString);
    }
  }

  // This function checks whether or not the specified request method and URL match those
  // expected by the specified mock endpoint. The specified request URL should NOT contain a
  // query string; it should be removed from the URL before the URL is passed to this function.
  function isRequestMatchesEndpoint(requestMethod, requestUrl, endpoint) {
    // Check if the specified request method matches the one(s) expected by the endpoint.
    // If the endpoint's "method" property is "*", then it matches ANY method, so we don't
    // need to check. Otherwise, the endpoint's "method" property is a string containing one
    // value (e.g., "GET") or multiple pipe-separated values (e.g., "GET|POST"), so we need
    // to check whether or not the specified request method matches one of those values.
    if (endpoint.method !== "*") {
      // Suppose, for example, that the specified request method is "GET". Test whether or
      // not the endpoint's "method" property matches the following RegExp pattern:
      // (the beginning of the string OR something followed by a literal pipe character)
      // followed by "GET" followed by
      // (the end of the string OR a literal pipe character followed by something)
      var requestMethodRegExp = new RegExp(
        "(?:^|.*\\|)" + requestMethod + "(?:$|\\|.*)",
        "i" // RegExp flag to make the search case-insensitive
      );
      if (!requestMethodRegExp.test(endpoint.method)) {
        return false;
      }
    }

    // If the endpoint's "url" property is a RegExp object, then test whether or not the
    // specified request URL matches the "url" RegExp. Otherwise, the endpoint's "url" property
    // should be a string, so check against the pattern /path/:param/part to matching

    switch (toType(endpoint.url)) {
      case "regexp":
        if (!endpoint.url.test(requestUrl)) {
          return false;
        }
        break;
      case "string":
        var regexp = escapeRegexp(endpoint.url).replace(/:[^:\\\/]+/g, '[^/]+') + '(\\?|/\\?|$)';

        return RegExp(regexp).test(requestUrl);
        break;
      default:
        return false;
    }

    // If this point is reached, then the specified request matches the specified endpoint
    return true;
  }

  // This is a utility function that provides a robust way to get the type of an object.
  // This function returns the type of the specified object as a lowercase string
  // (e.g., "string", "number", "boolean", "array", "function", "object", "regexp").
  // This function was adapted from the following JavaScript blog post by Angus Croll:
  // http://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
  function toType(object) {
    return ({}).toString.call(object).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
  }

  function escapeRegexp(it) {
    return it.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  };

  // This is a utility function to parse a query string into an object of key-value pairs.
  // This function was adapted from the following StackOverflow answer:
  // http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values/2880929#2880929
  function parseQueryString(queryString) {
    var match,
      plus = /\+/g,
      search = /([^&=]+)=?([^&]*)/g,
      decode = function (s) {
        return decodeURIComponent(s.replace(plus, " "));
      },
      params = {};

    while (( match = search.exec(queryString) ) !== null) {
      params[ decode(match[1]) ] = decode(match[2]);
    }

    return params;
  }

  // Parse the parameters out of the url
  function parseParams(requestURL, templateURL) {
    if (toType(templateURL) == "regexp") {
      templateURL = templateURL.toString();
    }

    var params = {}, ref$;
    var paramNames = (ref$ = templateURL.match(/:[^:\\\/]+/g)) != null
      ? ref$
      : [];

    var paramValuesRegexp = escapeRegexp(templateURL).replace(/:[^:\\\/]+/g, '([^/?]+)');
    var paramValues = (ref$ = requestURL.match(RegExp(paramValuesRegexp))) != null
      ? ref$
      : [];

    for (var i$ = 0, len$ = paramNames.length; i$ < len$; ++i$) {
      var i = i$;
      var name = paramNames[i$];
      params[name.substr(1)] = paramValues[i + 1];
    }

    return params;
  }

  // Expose some of the functions to the "outside world" as module methods
  return {
    addMockEndpoints: addMockEndpoints,
    removeAllMockEndpoints: removeAllMockEndpoints,
    enable: enable,
    disable: disable
  };

}() );
