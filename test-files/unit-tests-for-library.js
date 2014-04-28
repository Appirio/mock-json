/**
 * Create a module to group the following 2 tests together. This module tests the MockJsonApiLib
 * methods disable() and removeAllMockEndpoints(). The methods enable() and addMockEndpoints()
 * will be tested implicitly in the second module further down below.
 */
QUnit.module("Library Method Tests");

/**
 * Test the MockJsonApiLib.disable() method. If AJAX interception is disabled, then the mock
 * endpoint's handler function should never be invoked, and the AJAX callback function should
 * receive an error. Therefore, we expect only 1 assertion to be executed: the one in the AJAX
 * callback function.
 */
QUnit.test("MockJsonApiLib.disable()", function (assert) {
  QUnit.expect(1);
  QUnit.stop();

  var testMethod = "GET";
  var testUrl = "test";

  MockJsonApiLib.addMockEndpoints([
    {
      method: testMethod,
      url: testUrl,
      handler: function (request, response) {
        assert.ok(false, "This assertion should never be executed.");
      }
    }
  ]);

  MockJsonApiLib.enable();

  MockJsonApiLib.disable();

  Utils.makeJsonCall(testMethod, testUrl, null, null, null,
    function (jqXHR, textStatus) {
      assert.strictEqual(textStatus, "error", "This JSON call should receive an error.");
      QUnit.start();
    }
  );
});

/**
 * Test the MockJsonApiLib.removeAllMockEndpoints() method. If all mock endpoints are removed, then
 * the endpoint's handler function should never be invoked, and the AJAX callback function should
 * receive an error. Therefore, we expect only 1 assertion to be executed: the one in the AJAX
 * callback function.
 */
QUnit.test("MockJsonApiLib.removeAllMockEndpoints()", function (assert) {
  QUnit.expect(1);
  QUnit.stop();

  var testMethod = "GET";
  var testUrl = "test";

  MockJsonApiLib.addMockEndpoints([
    {
      method: testMethod,
      url: testUrl,
      handler: function (request, response) {
        assert.ok(false, "This assertion should never be executed.");
      }
    }
  ]);

  MockJsonApiLib.enable();

  MockJsonApiLib.removeAllMockEndpoints();

  Utils.makeJsonCall(testMethod, testUrl, null, null, null,
    function (jqXHR, textStatus) {
      assert.strictEqual(textStatus, "error", "This JSON call should receive an error.");
      QUnit.start();
    }
  );
});


/**
 * Create a module to group the following 8 tests together. This module tests the ability of
 * mock endpoints to match incoming AJAX requests, receive request properties, and send response
 * properties correctly. Before each test, enable AJAX interception by the library. After each
 * test, disable AJAX interception and remove all endpoints added to the library during the test.
 */
QUnit.module("Endpoint Tests", {
  setup: function () {
    MockJsonApiLib.enable();
  },
  teardown: function () {
    MockJsonApiLib.disable();
    MockJsonApiLib.removeAllMockEndpoints();
  }
});

/**
 * If an endpoint specifies "*" as its "method", then the endpoint should match all requests to
 * its URL, regardless of the request method. Therefore, we expect the endpoint's handler function
 * (and the assertion it contains) to run 4 times, once for each JSON call made.
 */
QUnit.test('Endpoint Method "*"', function (assert) {
  QUnit.expect(4);
  QUnit.stop(4);

  var testUrl = "test";

  MockJsonApiLib.addMockEndpoints([
    {
      method: "*",
      url: testUrl,
      handler: function (request, response) {
        assert.ok(true, 'Endpoint method "*" should match all request methods.');
        QUnit.start();
      }
    }
  ]);

  Utils.makeJsonCall("GET", testUrl);
  Utils.makeJsonCall("POST", testUrl);
  Utils.makeJsonCall("PUT", testUrl);
  Utils.makeJsonCall("DELETE", testUrl);
});

/**
 * If an endpoint specifies a single value as its "method", then the endpoint should only match
 * requests to its URL that use that method. Therefore, we expect the endpoint's handler function
 * (and the assertion it contains) to run only 1 time: in response to the "GET" JSON call.
 */
QUnit.test("Single Endpoint Method", function (assert) {
  QUnit.expect(1);
  QUnit.stop();

  var testUrl = "test";

  MockJsonApiLib.addMockEndpoints([
    {
      method: "GET",
      url: testUrl,
      handler: function (request, response) {
        assert.strictEqual(request.method, "GET",
          'Endpoint method "GET" should match only GET requests.'
        );
        QUnit.start();
      }
    }
  ]);

  Utils.makeJsonCall("GET", testUrl);
  Utils.makeJsonCall("POST", testUrl);
  Utils.makeJsonCall("PUT", testUrl);
  Utils.makeJsonCall("DELETE", testUrl);
});

/**
 * If an endpoint specifies multiple pipe-separated values as its "method", then the endpoint
 * should only match requests to its URL that use one of those methods. Therefore, we expect the
 * endpoint's handler function (and the assertion it contains) to run only 3 times: in response to
 * the "GET", "POST", and "PUT" JSON calls (and NOT in response to the "DELETE" JSON call).
 */
QUnit.test("Multiple Endpoint Methods", function (assert) {
  QUnit.expect(3);
  QUnit.stop(3);

  var testUrl = "test";

  MockJsonApiLib.addMockEndpoints([
    {
      method: "GET|POST|PUT",
      url: testUrl,
      handler: function (request, response) {
        var method = request.method;
        assert.ok(method === "GET" || method === "POST" || method === "PUT",
          'Endpoint method "GET|POST|PUT" should match GET, POST, and PUT requests only.'
        );
        QUnit.start();
      }
    }
  ]);

  Utils.makeJsonCall("GET", testUrl);
  Utils.makeJsonCall("POST", testUrl);
  Utils.makeJsonCall("PUT", testUrl);
  Utils.makeJsonCall("DELETE", testUrl);
});

/**
 * If an endpoint specifies a URL string as its "url", then the endpoint should only match requests
 * to that exact URL and allow for mathcing against :param. Therefore, we expect the endpoint's
 * handler function (and the assertion it contains) to run only 2 times.
 */
QUnit.test("Endpoint URL String", function (assert) {
  QUnit.expect(2);
  QUnit.stop(2);

  var testUrl = "test";

  MockJsonApiLib.addMockEndpoints([
    {
      method: "GET|POST",
      url: testUrl,
      handler: function (request, response) {
        assert.strictEqual(request.url, testUrl,
          'Endpoint URL "test" should match only requests to the exact URL "test".'
        );
        QUnit.start();
      }
    }
  ]);

  Utils.makeJsonCall("GET", testUrl);
  Utils.makeJsonCall("POST", testUrl);
  Utils.makeJsonCall("POST", testUrl + "/123");
});

/**
 * If an endpoint specifies a URL string as its "url", then the endpoint should only match requests
 * to that exact URL and allow for mathcing against :param. Therefore, we expect the endpoint's
 * handler function (and the assertion it contains) to run only 2 times.
 */
QUnit.test("Endpoint URL String with Param", function (assert) {
  QUnit.expect(3);
  QUnit.stop(3);

  var testUrl = "test/:id";

  MockJsonApiLib.addMockEndpoints([
    {
      method: "GET|POST",
      url: testUrl,
      handler: function (request, response) {
        assert.ok((request.url == "test/123" || request.url == "http://test/123"),
          'Endpoint URL "' + request.url + '" should match only requests to the  URL "test/{id}".'
        );
        QUnit.start();
      }
    }
  ]);

  Utils.makeJsonCall("GET", "test");
  Utils.makeJsonCall("GET", "test/123/end");
  Utils.makeJsonCall("GET", "http://test/123");
  Utils.makeJsonCall("GET", "http://test/123/end");
  Utils.makeJsonCall("GET", "test/123");
  Utils.makeJsonCall("GET", "test/123?name=hi");
});

/**
 * If an endpoint specifies a URL RegExp as its "url", then the endpoint should only match requests
 * to URLs that match the regular expression. Therefore, we expect the endpoint's handler function
 * (and the assertion it contains) to run only 2 times.
 */
QUnit.test("Endpoint URL RegExp", function (assert) {
  QUnit.expect(2);
  QUnit.stop(2);

  var testMethod = "GET";
  var testUrl = /test\/[0-9]{8}/;

  MockJsonApiLib.addMockEndpoints([
    {
      method: testMethod,
      url: testUrl,
      handler: function (request, response) {
        assert.ok(testUrl.test(request.url),
          'Endpoint URL ' + testUrl.toString() + ' should match only requests to ' +
            'URLs that contain "test" followed by exactly 8 digits.'
        );
        QUnit.start();
      }
    }
  ]);

  Utils.makeJsonCall(testMethod, "test/12345678");
  Utils.makeJsonCall(testMethod, "test/28631754/abc");
  Utils.makeJsonCall(testMethod, "test/216435");
  Utils.makeJsonCall(testMethod, "test/1234abcd");
});

/**
 * Test whether or not the request method, URL, parameters, headers, and body in a JSON call
 * are passed correctly to an endpoint's handler function. If the JSON call doesn't specify any
 * parameters, then inside the endpoint's handler function, request.params should be {}. If the
 * JSON call doesn't specify any headers, then request.headers should be {}. (Note, however, that
 * jQuery automatically inserts its own headers into the request before sending it.) Finally, if
 * the JSON call doesn't specify any body, then request.body should be null.
 */
QUnit.test("Endpoint Handler Function - Request Properties", function (assert) {
  QUnit.expect(10);
  QUnit.stop(2);

  var testHeaders = {
    "Authorization": "AbcDefGhi123456789"
  };
  var testParams = {
    "foo": "Hello, World!",
    "bar": "Special chars like ~!@#$%^&*()-+_={}[]|\\:;\"'<>,./? and spaces should be " +
      "encoded and decoded properly, so this should work..."
  };
  var testBody = {
    "id": "1234567890",
    "name": "abcdefghij"
  };

  MockJsonApiLib.addMockEndpoints([
    {
      method: "GET",
      url: "test1",
      handler: function (request, response) {
        assert.strictEqual(request.method, "GET");
        assert.strictEqual(request.url, "test1");
        assert.strictEqual(request.headers[ "Authorization" ], testHeaders[ "Authorization" ]);
        assert.deepEqual(request.params, testParams);
        assert.strictEqual(request.body, null);
        QUnit.start();
      }
    },
    {
      method: "POST",
      url: "test2",
      handler: function (request, response) {
        assert.strictEqual(request.method, "POST");
        assert.strictEqual(request.url, "test2");

        // The JSON call didn't specify any request headers explicitly, but jQuery
        // automatically inserts its own headers (like "X-Requested-With: XMLHttpRequest")
        // into the request before sending it, so request.headers won't be an empty object.
        // For more info, see: http://api.jquery.com/jQuery.ajax/#jQuery-ajax-settings
        // (scroll down to the "headers" setting).
        assert.notStrictEqual(request.headers, null);
        assert.deepEqual(request.params, {});
        assert.deepEqual(JSON.parse(request.body), testBody);
        QUnit.start();
      }
    }
  ]);

  Utils.makeJsonCall("GET", "test1", testHeaders, testParams, true);
  Utils.makeJsonCall("POST", "test2", null, testBody, false);
});

/**
 * Test whether or not the response status, headers, and body set by an endpoint's handler function
 * are passed correctly to the AJAX callback function. If the handler doesn't specify a status,
 * then the default value of 200 should be returned. If the handler doesn't specify any headers,
 * then the default value of {} should be returned. Finally, if the handler doesn't specify any
 * body, then the default value of "" should be returned.
 */
QUnit.test("Endpoint Handler Function - Response Properties", function (assert) {
  QUnit.expect(12);
  QUnit.stop(4);

  var testMethod = "GET";

  var testStatus = 201;
  var testHeaders = {
    "Server": "Test123"
  };
  var testBody = {
    "id": "1234567890",
    "name": "abcdefghij"
  };

  MockJsonApiLib.addMockEndpoints([
    {
      method: testMethod,
      url: "test1",
      handler: function (request, response) {
      }
    },
    {
      method: testMethod,
      url: "test2",
      handler: function (request, response) {
        response.status = testStatus;
      }
    },
    {
      method: testMethod,
      url: "test3",
      handler: function (request, response) {
        response.headers = testHeaders;
      }
    },
    {
      method: testMethod,
      url: "test4",
      handler: function (request, response) {
        response.body = testBody;
      }
    }
  ]);

  Utils.makeJsonCall(testMethod, "test1", null, null, null,
    function (jqXHR, textStatus) {
      assert.strictEqual(jqXHR.status, 200);
      assert.strictEqual(jqXHR.getAllResponseHeaders(), "");
      assert.strictEqual(jqXHR.responseText, "");
      QUnit.start();
    }
  );

  Utils.makeJsonCall(testMethod, "test2", null, null, null,
    function (jqXHR, textStatus) {
      assert.strictEqual(jqXHR.status, testStatus);
      assert.strictEqual(jqXHR.getAllResponseHeaders(), "");
      assert.strictEqual(jqXHR.responseText, "");
      QUnit.start();
    }
  );

  Utils.makeJsonCall(testMethod, "test3", null, null, null,
    function (jqXHR, textStatus) {
      assert.strictEqual(jqXHR.status, 200);
      assert.strictEqual(jqXHR.getResponseHeader("Server"), testHeaders[ "Server" ]);
      assert.strictEqual(jqXHR.responseText, "");
      QUnit.start();
    }
  );

  Utils.makeJsonCall(testMethod, "test4", null, null, null,
    function (jqXHR, textStatus) {
      assert.strictEqual(jqXHR.status, 200);
      assert.strictEqual(jqXHR.getAllResponseHeaders(), "");
      assert.deepEqual(JSON.parse(jqXHR.responseText), testBody);
      QUnit.start();
    }
  );
});

/**
 * Test the parameters in the URL are available n the response.
 */
QUnit.test("Endpoint Parameter test", function (assert) {
  QUnit.expect(1);
  QUnit.stop(1);

  var testURL = "test/:id/mom"

  var testId = "123";

  MockJsonApiLib.addMockEndpoints([
    {
      method: "GET",
      url: testURL,
      handler: function (request, response) {
        assert.strictEqual(request.params.id, testId);
        QUnit.start();
      }
    }
  ]);

  Utils.makeJsonCall("GET", "test/123/mom");
});

/**
 * Test a string object
 */
QUnit.test("String handler", function (assert) {
  QUnit.expect(3);
  QUnit.stop(1);

  MockJsonApiLib.addMockEndpoints([
    {
      method: "GET",
      url: "test",
      handler: '{"message": "Folder 04620324 has been updated!"}'
    }
  ]);

  Utils.makeJsonCall("GET", "test", null, null, null,
    function (jqXHR, textStatus) {
      assert.strictEqual(jqXHR.status, 200);
      assert.strictEqual(jqXHR.getAllResponseHeaders(), "");
      assert.strictEqual(jqXHR.responseText, '{"message": "Folder 04620324 has been updated!"}');
      QUnit.start();
    }
  );
});

/**
 * Test the "handler shorthand notation", which allows you to assign a response object instead of
 * a function as an endpoint's handler if it provides the same response regardless of the request.
 * Test whether or not the response status, headers, and body set by an endpoint's handler OBJECT
 * are passed correctly to the AJAX callback function. If the handler doesn't specify a status,
 * then the default value of 200 should be returned. If the handler doesn't specify any headers,
 * then the default value of {} should be returned. Finally, if the handler doesn't specify any
 * body, then the default value of "" should be returned.
 */
QUnit.test("Endpoint Handler Object Shorthand", function (assert) {
  QUnit.expect(12);
  QUnit.stop(4);

  var testMethod = "GET";

  var testStatus = 201;
  var testHeaders = {
    "Server": "Test123"
  };
  var testBody = {
    "id": "1234567890",
    "name": "abcdefghij"
  };

  MockJsonApiLib.addMockEndpoints([
    {
      method: testMethod,
      url: "test1",
      handler: {
      }
    },
    {
      method: testMethod,
      url: "test2",
      handler: {
        status: testStatus
      }
    },
    {
      method: testMethod,
      url: "test3",
      handler: {
        headers: testHeaders
      }
    },
    {
      method: testMethod,
      url: "test4",
      handler: {
        body: testBody
      }
    }
  ]);

  Utils.makeJsonCall(testMethod, "test1", null, null, null,
    function (jqXHR, textStatus) {
      assert.strictEqual(jqXHR.status, 200);
      assert.strictEqual(jqXHR.getAllResponseHeaders(), "");
      assert.strictEqual(jqXHR.responseText, "");
      QUnit.start();
    }
  );

  Utils.makeJsonCall(testMethod, "test2", null, null, null,
    function (jqXHR, textStatus) {
      assert.strictEqual(jqXHR.status, testStatus);
      assert.strictEqual(jqXHR.getAllResponseHeaders(), "");
      assert.strictEqual(jqXHR.responseText, "");
      QUnit.start();
    }
  );

  Utils.makeJsonCall(testMethod, "test3", null, null, null,
    function (jqXHR, textStatus) {
      assert.strictEqual(jqXHR.status, 200);
      assert.strictEqual(jqXHR.getResponseHeader("Server"), testHeaders[ "Server" ]);
      assert.strictEqual(jqXHR.responseText, "");
      QUnit.start();
    }
  );

  Utils.makeJsonCall(testMethod, "test4", null, null, null,
    function (jqXHR, textStatus) {
      assert.strictEqual(jqXHR.status, 200);
      assert.strictEqual(jqXHR.getAllResponseHeaders(), "");
      assert.deepEqual(JSON.parse(jqXHR.responseText), testBody);
      QUnit.start();
    }
  );
});
