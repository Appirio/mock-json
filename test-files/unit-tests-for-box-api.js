/**
 * Create a module to group the following 6 tests together. This module explicitly tests the
 * implementation of the mock Box.com API endpoints in the "mock-json-api-for-box.js" file, and
 * thereby implicitly tests the core library implementation in the "mock-json-api-library.js" file.
 * Before each test, enable AJAX interception. After each test, disable AJAX interception.
 *
 * The mock Box.com API endpoints are defined in the "mock-json-api-for-box.js" file, where they
 * are added the library. Meanwhile, the BoxEndpoints module (which makes the AJAX requests to the
 * Box.com API endpoints) is defined in the "json-calls-to-box-api.js" file. Finally, the Utils
 * module (which contains utility functions) is defined in the "unit-test-utilities.js" file.
 */
QUnit.module("Mock Box.com API Endpoint Tests", {
  setup: function () {
    MockJsonApiLib.enable();
  },
  teardown: function () {
    MockJsonApiLib.disable();
  }
});

/**
 * If an AJAX request is made that contains no "Authorization" header, then "Endpoint 0" should
 * "catch" the request and provide an error response. For more info, please see the
 * "mock-json-api-for-box.js" and "json-calls-to-box-api.js" files.
 */
QUnit.test('Endpoint 0: "Catch-All" Generic Endpoint', function (assert) {
  // We expect 15 assertions to be run: We make 5 AJAX requests, each of which will call the
  // callback function, which will run 3 assertions
  QUnit.expect(15);

  // Tell QUnit to stop and wait until QUnit.start() is called 5 times, one for each AJAX
  // request. This is necessary for testing asynchronous callbacks with QUnit.
  QUnit.stop(5);

  // Make the AJAX requests to the Box.com API endpoints, omitting the "Authorization" header
  BoxEndpoints.getFolderItems(false, callback);
  BoxEndpoints.getFolderInfo(false, callback);
  BoxEndpoints.postNewFolder(false, callback);
  BoxEndpoints.putFolderInfo(false, callback);
  BoxEndpoints.deleteFolder(false, callback);

  // Make sure that the response is the error response sent by "Endpoint 0"
  function callback(jqXHR, textStatus) {
    assert.strictEqual(jqXHR.status, 401);
    assert.strictEqual(jqXHR.getResponseHeader("Content-Type"), "application/json");
    assert.deepEqual(JSON.parse(jqXHR.responseText),
      { "errorMessage": "The 'Authorization' request header was not found." }
    );
    QUnit.start();
  }
});

/**
 * If an AJAX request made to "Endpoint 1" contains an "Authorization" header, then "Endpoint 1"
 * should be called to handle the request and provide the response. For more info, please see the
 * "mock-json-api-for-box.js" and "json-calls-to-box-api.js" files.
 */
QUnit.test("Endpoint 1: Retrieve a Folder's Items", function (assert) {
  // We expect 12 assertions to be run
  QUnit.expect(12);

  // Tell QUnit to stop and wait until we call QUnit.start(). This is necessary for testing
  // asynchronous callbacks with QUnit.
  QUnit.stop();

  // Make the AJAX request to "Endpoint 1", including an "Authorization" header, and make sure
  // the response is the one sent by "Endpoint 1" (see "mock-json-api-for-box.js" for more info)
  BoxEndpoints.getFolderItems(true, function (jqXHR, textStatus) {
    assert.strictEqual(jqXHR.status, 200);
    assert.strictEqual(jqXHR.getResponseHeader("Content-Type"), "application/json");

    var responseBodyObject = JSON.parse(jqXHR.responseText);

    assert.ok(Utils.isNumberBetween(responseBodyObject.total_count, 1, 100));
    assert.strictEqual(responseBodyObject.offset, 10);
    assert.strictEqual(responseBodyObject.limit, 5);
    assert.deepEqual(responseBodyObject.order, [
      { "by": "type", "direction": "ASC" }
    ]);

    var folderEntriesArray = responseBodyObject.entries;
    var folderEntryObject0 = folderEntriesArray[0];

    assert.ok(Utils.isNumberBetween(folderEntriesArray.length, 1, 5));
    assert.ok(Utils.isInArray(folderEntryObject0.type, MockJsonTemplateModule.data.FILE_TYPE));
    assert.ok(/^[0-9]{8}$/.test(folderEntryObject0.id));
    assert.ok(/^[0-9]$/.test(folderEntryObject0.sequence_id));
    assert.ok(/^[0-9]$/.test(folderEntryObject0.etag));
    assert.ok(/^[a-zA-Z]+$/.test(folderEntryObject0.name));

    QUnit.start();
  });
});

/**
 * If an AJAX request made to "Endpoint 2" contains an "Authorization" header, then "Endpoint 2"
 * should be called to handle the request and provide the response. For more info, please see the
 * "mock-json-api-for-box.js" and "json-calls-to-box-api.js" files.
 */
QUnit.test("Endpoint 2: Get Information About a Folder", function (assert) {
  // We expect 11 assertions to be run
  QUnit.expect(11);

  // Tell QUnit to stop and wait until we call QUnit.start(). This is necessary for testing
  // asynchronous callbacks with QUnit.
  QUnit.stop();

  // Make the AJAX request to "Endpoint 2", including an "Authorization" header, and make sure
  // the response is the one sent by "Endpoint 2" (see "mock-json-api-for-box.js" for more info)
  BoxEndpoints.getFolderInfo(true, function (jqXHR, textStatus) {
    assert.strictEqual(jqXHR.status, 200);
    assert.strictEqual(jqXHR.getResponseHeader("Content-Type"), "application/json");

    var responseBodyObject = JSON.parse(jqXHR.responseText);

    assert.strictEqual(responseBodyObject.type, "folder");
    assert.ok(/^[0-9]{8}$/.test(responseBodyObject.id));
    assert.ok(/^[0-9]$/.test(responseBodyObject.sequence_id));
    assert.ok(/^[0-9]$/.test(responseBodyObject.etag));
    assert.ok(/^[a-zA-Z]+$/.test(responseBodyObject.name));

    var iso8601UtcDateTimeRegExp = /^\d\d\d\d\-\d\d\-\d\d\sT\s\d\d\:\d\d\:\d\d\-08\:00$/;

    assert.ok(iso8601UtcDateTimeRegExp.test(responseBodyObject.created_at));
    assert.ok(iso8601UtcDateTimeRegExp.test(responseBodyObject.modified_at));
    assert.ok(/^.+$/.test(responseBodyObject.description));
    assert.ok(Utils.isNumberBetween(responseBodyObject.size, 0, 1000000));

    QUnit.start();
  });
});

/**
 * If an AJAX request made to "Endpoint 3" contains an "Authorization" header, then "Endpoint 3"
 * should be called to handle the request and provide the response. For more info, please see the
 * "mock-json-api-for-box.js" and "json-calls-to-box-api.js" files.
 */
QUnit.test("Endpoint 3: Create a New Folder", function (assert) {
  // We expect 3 assertions to be run
  QUnit.expect(3);

  // Tell QUnit to stop and wait until we call QUnit.start(). This is necessary for testing
  // asynchronous callbacks with QUnit.
  QUnit.stop();

  // Make the AJAX request to "Endpoint 3", including an "Authorization" header, and make sure
  // the response is the one sent by "Endpoint 3" (see "mock-json-api-for-box.js" for more info)
  BoxEndpoints.postNewFolder(true, function (jqXHR, textStatus) {
    assert.strictEqual(jqXHR.status, 201);
    assert.strictEqual(jqXHR.getResponseHeader("Content-Type"), "application/json");
    assert.deepEqual(JSON.parse(jqXHR.responseText),
      { "message": "Folder 'New Folder' has been created!" }
    );
    QUnit.start();
  });
});

/**
 * If an AJAX request made to "Endpoint 4" contains an "Authorization" header, then "Endpoint 4"
 * should be called to handle the request and provide the response. For more info, please see the
 * "mock-json-api-for-box.js" and "json-calls-to-box-api.js" files.
 */
QUnit.test("Endpoint 4: Update Information About a Folder", function (assert) {
  // We expect 3 assertions to be run
  QUnit.expect(3);

  // Tell QUnit to stop and wait until we call QUnit.start(). This is necessary for testing
  // asynchronous callbacks with QUnit.
  QUnit.stop();

  // Make the AJAX request to "Endpoint 4", including an "Authorization" header, and make sure
  // the response is the one sent by "Endpoint 4" (see "mock-json-api-for-box.js" for more info)
  BoxEndpoints.putFolderInfo(true, function (jqXHR, textStatus) {
    assert.strictEqual(jqXHR.status, 200);
    assert.strictEqual(jqXHR.getResponseHeader("Content-Type"), "application/json");

    var responseBodyObject = JSON.parse(jqXHR.responseText);
    assert.ok(/^Folder\s[0-9]{8}\shas\sbeen\supdated\!/.test(responseBodyObject.message));

    QUnit.start();
  });
});

/**
 * If an AJAX request made to "Endpoint 5" contains an "Authorization" header, then "Endpoint 5"
 * should be called to handle the request and provide the response. For more info, please see the
 * "mock-json-api-for-box.js" and "json-calls-to-box-api.js" files.
 */
QUnit.test("Endpoint 5: Delete a Folder", function (assert) {
  // We expect 3 assertions to be run
  QUnit.expect(3);

  // Tell QUnit to stop and wait until we call QUnit.start(). This is necessary for testing
  // asynchronous callbacks with QUnit.
  QUnit.stop();

  // Make the AJAX request to "Endpoint 5", including an "Authorization" header, and make sure
  // the response is the one sent by "Endpoint 5" (see "mock-json-api-for-box.js" for more info)
  BoxEndpoints.deleteFolder(true, function (jqXHR, textStatus) {
    assert.strictEqual(jqXHR.status, 204);
    assert.strictEqual(jqXHR.getResponseHeader("Content-Type"), "application/json");
    assert.strictEqual(jqXHR.responseText, "");
    QUnit.start();
  });
});
