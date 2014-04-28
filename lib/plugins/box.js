/**
 * Add a custom keyword to the underlying "MockJSON" template system. For more info, please see the
 * "mock-json-template-module.js" file, which contains a modified version of the "MockJSON" library
 * that is used by the mock JSON API library. Also, please see the accompanying "README.pdf" file
 * (jump down to the section titled "Library Usage Instructions").
 */
MockJsonTemplateModule.data.FILE_TYPE = [ "file", "folder" ];


/**
 * Add mock Box.com API endpoints to the library. For more info, see the "mock-json-api-library.js"
 * file, which defines the core mock JSON API library module. Also, please see the accompanying
 * "README.pdf" file (jump down to the sub-section titled "Adding Mock Endpoints to the Library").
 */
MockJsonApiLib.addMockEndpoints([

  // Endpoint 0: Generic endpoint that matches ALL AJAX requests to Box.com folder API endpoints.
  // The purpose of this "catch-all" endpoint is to run code that is common to all endpoints.
  // Specifically, this endpoint's handler ensures that each incoming AJAX request contains an
  // "Authorization" header before allowing it through to a more-specific endpoint's handler.
  // Also, this endpoint's handler sets the response headers that are returned by all endpoints.
  // To achieve this goal, this endpoint's handler uses the library's "fall through" mechanism.
  // For more info, please see the accompanying "README.pdf" file (jump down to the sub-section
  // titled "Fall-Through Mechanism").
  {
    // Match any HTTP request method
    method: "*",

    // URL RegExp literal that matches "https://api.box.com/2.0/folders" or
    // "https://api.box.com/2.0/folders/" followed by anything
    url: /https\:\/\/api\.box\.com\/2\.0\/folders(?:\/.*)?/,

    // This function is called to handle incoming AJAX requests that match this endpoint
    handler: function (request, response) {
      // Set the response headers to be sent out in ANY case
      response.headers = { "Content-Type": "application/json" };

      // Check for the "Authorization" header in the request
      if ("Authorization" in request.headers) {
        // Return false to tell the library that the request has NOT been fully handled,
        // so the library will search for another matching endpoint (i.e., one of those
        // defined below) to continue/finish handling the request
        return false;
      } else {
        // Set the response status and the response body
        response.status = 401; // 401 = Unauthorized
        response.body = {
          "errorMessage": "The 'Authorization' request header was not found."
        };

        // Return true (or don't call return at all) to tell the library that the request
        // HAS been fully handled, so the library will NOT search for another matching
        // endpoint to continue/finish handling the request
        return true;
      }
    }
  },

  // Endpoint 1: Retrieve a Folder's Items.
  // http://developers.box.com/docs/#folders-retrieve-a-folders-items
  {
    // Match only "GET" requests
    method: "GET",

    // URL RegExp literal that matches "https://api.box.com/2.0/folders/" followed by
    // one or more digits (the folder ID number) followed by "/items"
    // THE "folderId" can then be used in the body by request.params.folderId
    url: "https://api.box.com/2.0/folders/:folderId/items",


    // This function is called to handle incoming AJAX requests that match this endpoint
    handler: function (request, response) {
      // Cache the request parameters object
      var params = request.params;

      // Parse the request parameters; if they don't exist, then use default values
      var offset = ( "offset" in params ) ? parseInt(params.offset, 10) : 0;
      var limit = ( "limit"  in params ) ? parseInt(params.limit, 10) : 20;

      // We don't set the response status, so the default value of 200 is used

      // We don't set the response headers here, but they WERE set in the "0th" "catch-all"
      // endpoint's handler to: { "Content-Type": "application/json" }

      // Set the response body to a template object that uses "MockJSON" annotations.
      // This template is based on the example JSON response from:
      // http://developers.box.com/docs/#folders-retrieve-a-folders-items
      response.body = {
        "total_count|1-100": 0,
        "offset": offset,
        "limit": limit,
        "order|1-1": [
          {
            "by": "type",
            "direction": "ASC"
          }
        ]
      };

      // Note: Apparently, "MockJSON" does NOT allow a template object to contain a "normal"
      // array. For example, the template object above contains an array with property key
      // "order|1-1". If we removed the "|1-1" suffix, leaving only "order" as the property
      // key, then "MockJSON" would produce an empty array there. The only solution is to
      // suffix the key with "|x-y", in which case "MockJSON" would produce an array with
      // between x and y instances of the first element. Note that this is a limitation of
      // the original "MockJSON" library, and is NOT a result of my modifications to it.
      // For more info, please see: http://experiments.mennovanslooten.nl/2010/mockjson/
      // (scroll down to the "Arrays" sub-section).

      // Add another property to the response body. We must use bracket notation here
      // because the property key is dynamically determined by the value of limit. Again,
      // here we use "MockJSON" annotations. For example, if limit is 10, then the key
      // becomes "entries|1-10" and the underlying "MockJSON" template system will generate
      // an array containing between 1 and 10 random instances of the specified object.
      // For more info, please see: http://experiments.mennovanslooten.nl/2010/mockjson/
      // (scroll down to the "Arrays" sub-section).
      response.body[ "entries|1-" + limit ] = [
        {
          "type": "@FILE_TYPE", // Custom keyword that was added at the top of this file
          "id|8-8": "@NUMBER",
          "sequence_id": "@NUMBER",
          "etag": "@NUMBER",
          "name": "@LOREM"
        }
      ];
    }
  },

  // Endpoint 2: Get Information About a Folder.
  // http://developers.box.com/docs/#folders-get-information-about-a-folder
  {
    // Match only "GET" requests
    method: "GET",

    // URL RegExp literal that matches "https://api.box.com/2.0/folders/" followed by
    // one or more digits (the folder ID number)
    url: "https://api.box.com/2.0/folders/:folderid",

    // If an endpoint's response is the same regardless of the request (i.e., if you don't
    // care about the request object), then you can use the following "object shorthand"
    // instead of specifying a handler function. For more info, please see the accompanying
    // "README.pdf" file (jump down to the sub-section titled "Handler Shorthand Notation").
    handler: {
      // We don't set the response status, so the default value of 200 is used

      // We don't set the response headers here, but they WERE set in the "0th" "catch-all"
      // endpoint's handler to: { "Content-Type": "application/json" }

      // Set the response body to a template object that uses "MockJSON" annotations.
      // This template is a truncated version of the REALLY LONG example JSON response from:
      // http://developers.box.com/docs/#folders-get-information-about-a-folder
      body: {
        "type": "folder",
        "id|8-8": "@NUMBER",
        "sequence_id": "@NUMBER",
        "etag": "@NUMBER",
        "name": "@LOREM",
        "created_at": "@DATE_YYYY-@DATE_MM-@DATE_DD T @TIME_HH:@TIME_MM:@TIME_SS-08:00",
        "modified_at": "@DATE_YYYY-@DATE_MM-@DATE_DD T @TIME_HH:@TIME_MM:@TIME_SS-08:00",
        "description": "@LOREM_IPSUM",
        "size|0-1000000": 0
      }

      // Note: According to http://developers.box.com/docs/#api-basics, the Box.com API
      // returns timestamps in ISO 8601 UTC format. For example, see the "created_at" and
      // "modified_at" properties above. Technically, there should be no spaces before or
      // after the "T" in the middle, but the "MockJSON" template system throws an error
      // when it encounters "@DATE_DDT", so there needs to be a space between the "MockJSON"
      // keyword "@DATE_DD" and the letter "T".
    }
  },

  // Endpoint 3: Create a New Folder.
  // http://developers.box.com/docs/#folders-create-a-new-folder
  {
    // Match only "POST" requests
    method: "POST",

    // URL string that matches "https://api.box.com/2.0/folders" EXACTLY and nothing else
    url: "https://api.box.com/2.0/folders",

    // This function is called to handle incoming AJAX requests that match this endpoint
    handler: function (request, response) {
      // Parse the request body JSON string into an object
      var requestBodyObject = JSON.parse(request.body);

      // Check whether or not a folder name was specified in the request body, and set the
      // response status and response body accordingly
      if ("name" in requestBodyObject) {
        response.status = 201; // 201 = Created
        response.body = {
          "message": "Folder '" + requestBodyObject.name + "' has been created!"
        };
      } else {
        response.status = 400; // 400 = Bad Request
        response.body = {
          "errorMessage": "The new folder's name was not found in the request body."
        };
      }

      // We don't set the response headers here, but they WERE set in the "0th" "catch-all"
      // endpoint's handler to: { "Content-Type": "application/json" }
    }
  },

  // Endpoint 4: Update Information About a Folder.
  // http://developers.box.com/docs/#folders-update-information-about-a-folder
  {
    // Match only "PUT" requests
    method: "PUT",

    // URL RegExp literal that matches "https://api.box.com/2.0/folders/" followed by
    // one or more digits (the folder ID number)
    url: "https://api.box.com/2.0/folders/:folderId",

    // If an endpoint's response is the same regardless of the request (i.e., if you don't
    // care about the request object), then you can use the following "object shorthand"
    // instead of specifying a handler function. For more info, please see the accompanying
    // "README.pdf" file (jump down to the sub-section titled "Handler Shorthand Notation").
    handler: {
      // We don't set the response status, so the default value of 200 is used

      // We don't set the response headers here, but they WERE set in the "0th" "catch-all"
      // endpoint's handler to: { "Content-Type": "application/json" }

      // Set the response body to a template object that uses "MockJSON" annotations
      body: {
        "message": "Folder @NUMBER@NUMBER@NUMBER@NUMBER@NUMBER@NUMBER@NUMBER@NUMBER has been updated!"
      }
    }
  },

  // Endpoint 5: Delete a Folder.
  // http://developers.box.com/docs/#folders-delete-a-folder
  {
    // Match only "DELETE" requests
    method: "DELETE",

    // URL RegExp literal that matches "https://api.box.com/2.0/folders/" followed by
    // one or more digits (the folder ID number)
    url: /https\:\/\/api\.box\.com\/2\.0\/folders\/[0-9]+/,

    // If an endpoint's response is the same regardless of the request (i.e., if you don't
    // care about the request object), then you can use the following "object shorthand"
    // instead of specifying a handler function. For more info, please see the accompanying
    // "README.pdf" file (jump down to the sub-section titled "Handler Shorthand Notation").
    handler: {
      // Set the response status
      status: 204 // 204 = No Content

      // We don't set the response headers here, but they WERE set in the "0th" "catch-all"
      // endpoint's handler to: { "Content-Type": "application/json" }

      // 204 responses have no response body
    }
  }

]);
