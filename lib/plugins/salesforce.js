/**
 * Add a custom keyword to the underlying "MockJSON" template system. For more info, please see the
 * "mock-json-template-module.js" file, which contains a modified version of the "MockJSON" library
 * that is used by the mock JSON API library. Also, please see the accompanying "README.pdf" file
 * (jump down to the section titled "Library Usage Instructions").
 */
MockJsonTemplateModule.data.FILE_TYPE = [ "file", "folder" ];

var waitingTillReturn = false;

MockJsonTemplateModule.firebaseLoc = '';

//Define a bunch of util methods for parsing query strings, etc
var MockJsonUtilsForSFDC = {
  //pass in the request object, returns the full query string
  'getQueryString': function (theRequest) {
    var queryStr;
    var strWithQuery;
    var nearlyQueryStr;
    if (theRequest.params.q) {
      strWithQuery = theRequest.params.q;
      nearlyQueryStr = strWithQuery.split("?")[ 1 ];
    }
    else {
      strWithQuery = theRequest.body;
      nearlyQueryStr = strWithQuery.split("&")[ 1 ];
    }

    //chop the q=

    if (nearlyQueryStr && nearlyQueryStr.indexOf('q=') == 0) {
      queryStr = nearlyQueryStr.substr(2); //.toLowerCase();
    }
    else {
      queryStr = strWithQuery;
    }
    return queryStr;
  },
  'parseObjectNameFromBodyQueryStr': function (bodyQueryStr) {
    // /v27.0/sobjects/cmc_presales_loe__c/ca931620-56ec-acaf-12a4-c279ade9abc1
    var splitter = bodyQueryStr.split("/");
    return splitter[3];

  },
  'parseIdFromBodyQueryStr': function (bodyQueryStr) {
    // /v27.0/sobjects/cmc_presales_loe__c/ca931620-56ec-acaf-12a4-c279ade9abc1
    var splitter = bodyQueryStr.split("/");
    return splitter[4];
  },
  //pass in the query string, return the Where part of the string
  'getWhereClauseString': function (queryStr) {
    var whereClause;
    var queryStrUpper = queryStr.toUpperCase();
    var whereIndex = queryStrUpper.lastIndexOf('WHERE');
    if (whereIndex > -1) {
      whereClause = queryStr.substring(whereIndex + 6); //remove WHERE_
    }
    return whereClause;
  },

  //TODO fix this for more than 1 where clause
  //pass in the where string, return an object with Where clause via (key,value) pairs
  'getWhereClauseObject': function (whereStr) {
    var whereObject;
    if (whereStr != null) {
      whereObject = {};

      var whereArray = whereStr.replace("AND", "=").split("=");
      var length = whereArray.length;
      var fieldName = null;
      for (var i = 0; i < length; i = i + 2) {
        fieldName = whereArray[i].trim();
        fieldValue = whereArray[i + 1].trim();

        //chop the quotes off of strings
        if (fieldValue && fieldValue.indexOf('\'') == 0) {
          fieldValue = fieldValue.split('\'')[1];
        }

        whereObject[fieldName] = fieldValue;
      }
    }
    return whereObject;
  },
  'getFromClauseString': function (queryStr) {
    var fromClause;
    var queryStrUpper = queryStr.toUpperCase();
    var fromIndex = queryStrUpper.lastIndexOf('FROM');
    if (fromIndex > -1) {
      var subFrom = queryStr.substr(fromIndex);
      fromClause = subFrom.split(" ")[1];
    }
    return fromClause;
  },
  'getResponseBody': function (unformatted) {
    var ret = unformatted;
    if (ret.indexOf('b=') == 0) {
      ret = unformatted.substr(2);
    }
    ret = ret.split('&')[0];

    return ret;
  },
  'objectsReturned': function (request, queryObj) {

    var newLoc = MockJsonTemplateModule.firebaseLoc + '/' + queryObj.objectName + '/';
    var objectDataRef = new Firebase(newLoc);
    objectDataRef.on('value', function (dataSnapshot) {
      var objsToRet = [];
      var rawData = dataSnapshot.exportVal();

      //data has an Object full of child objects sorted by ID (NON SFDC)
      //loop through all the IDs(key) and put the object (value) in an array
      if (rawData) {

        var keys = Object.keys(rawData);
        for (var i = 0; i < keys.length; i++) {

          //apply where filters
          if (queryObj.where) {
            var neededMatches = Object.keys(queryObj.where).length; //find out how many WHERE clauses there are to match
            var curMatches = 0;
            for (var param in queryObj.where) {
              var matches = rawData[keys[i]][param];
              if (matches == queryObj.where[param]) {
                curMatches++;   //track number of matches
              }
              if (curMatches == neededMatches) {
                objsToRet.push(rawData[keys[i]]); //only add the object matched if all where clauses apply
                continue;
              }
            }
          }
          else {
            objsToRet.push(rawData[keys[i]]);
          }
        }

        MockJsonUtilsForSFDC.allFirebaseObjects = objsToRet;
      }

      // This will cause the Mock JSON API Library to call the endpoint's handler function
      // to provide a mock response, which will be sent by the library
      request.handleRequest();
    });
  },
  'getUniqueId': function () {
    var delimiter = "-";

    function s4() {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }

    return [s4() + s4(), s4(), s4(), s4(), s4() + s4() + s4()].join(delimiter);

  }

};


/**
 * Add mock SFDC API endpoints to the library. For more info, see the "mock-json-api-library.js"
 * file, which defines the core mock JSON API library module. Also, please see the accompanying
 * "README.pdf" file (jump down to the sub-section titled "Adding Mock Endpoints to the Library").
 */
MockJsonApiLib.addMockEndpoints([


  {
    // Match only "GET" requests
    method: "GET",
    url: "/api/va1/sfproxy",

    // Specify an initializer function, which indicates to the library that the endpoint needs
    // to make an async callout for data and will provide a mock response at a later time.
    // The library will call this initializer function and delay calling the handler function.
    // Make the async callout here, and call request.handleRequest() when ready, which will
    // cause the library to call the handler function to finish handling the request.

    initializer: function (request) {

      //get the query string
      var queryStr = MockJsonUtilsForSFDC.getQueryString(request);
      queryStr = decodeURIComponent(queryStr).replace(/\+/g, ' ');

      //create a queryObj
      var queryObj = {};
      queryObj.originalStr = queryStr;

      //determine if we are doing a soql query or a rest url call
      var queryStrUpper = queryStr.toUpperCase();
      if (queryStrUpper.indexOf("SELECT") > -1) {
        queryObj.soql = true;
      }

      if (queryObj.soql) {
        //get the where clause data
        var whereClause = MockJsonUtilsForSFDC.getWhereClauseString(queryStr);
        queryObj.where = MockJsonUtilsForSFDC.getWhereClauseObject(whereClause);
        queryObj.objectName = MockJsonUtilsForSFDC.getFromClauseString(queryStr);
      }
      else {      		// attachment rest call - not a query
        var whereObject = {};
        queryObj.objectName = MockJsonUtilsForSFDC.parseObjectNameFromBodyQueryStr(queryStr);
        whereObject.Id = MockJsonUtilsForSFDC.parseIdFromBodyQueryStr(queryStr);
        queryObj.where = whereObject;
      }

      //console.log("queryObj", queryObj);

      request.objectName = queryObj.objectName;
      request.whereObject = queryObj.where;
      request.soql = queryObj.soql;


      //query for response based on query FROM clause
      MockJsonUtilsForSFDC.objectsReturned(request, queryObj);
    },

    // This function is called to handle incoming AJAX requests that match this endpoint
    handler: function (request, response) {

      response.body = {
        records: MockJsonUtilsForSFDC.allFirebaseObjects
      };

      //only for an attachment body request
      if (!request.soql && request.objectName == "Attachment") {	// return only the attachment body
        response.body = JSON.parse(MockJsonUtilsForSFDC.allFirebaseObjects[0].Body);
      }

    }
  },
  {
    // Match only "PUT" requests
    method: "PUT",
    url: "/api/va1/sfproxy",

    initializer: function (request) {

      //get the record id from the body
      var queryStr = MockJsonUtilsForSFDC.getQueryString(request);
      var objectName = MockJsonUtilsForSFDC.parseObjectNameFromBodyQueryStr(queryStr);
      var recordId = MockJsonUtilsForSFDC.parseIdFromBodyQueryStr(queryStr);

      //filter out the crap from the body for conversion to object
      var respBody = MockJsonUtilsForSFDC.getResponseBody(request.body);

      //convert to object
      responseObject = JSON.parse(decodeURIComponent(respBody));
      if (objectName == "Attachment") {
        responseObject.Body = window.atob(responseObject.Body);
      }

      //store the record by it's generated ID in Firebase
      var newLoc = MockJsonTemplateModule.firebaseLoc + '/' + objectName + '/' + recordId + '/';
      var objectDataRef = new Firebase(newLoc);
      MockJsonUtilsForSFDC.firebaseResponse = objectDataRef.update(responseObject);

      request.handleRequest();
    },

    // This function is called to handle incoming AJAX requests that match this endpoint
    handler: function (request, response) {

      //this is an update... nothing to really do...
      //TODO handle errors from Firebase or bad requests??
    }
  },
  {
    // Match only "POST" requests
    method: "POST",
    url: "/api/va1/sfproxy",

    initializer: function (request) {

      //get the ObjectName id from the body
      var queryStr = MockJsonUtilsForSFDC.getQueryString(request);
      var objectName = MockJsonUtilsForSFDC.parseObjectNameFromBodyQueryStr(queryStr);

      //filter out the crap from the body for conversion to object
      var respBody = MockJsonUtilsForSFDC.getResponseBody(request.body);

      //convert to object
      responseObject = JSON.parse(decodeURIComponent(respBody));
      if (objectName == "Attachment") {
        responseObject.Body = window.atob(responseObject.Body);
      }

      //generate a unique Id, this will replace the SFDC id usually used
      responseObject.Id = MockJsonUtilsForSFDC.getUniqueId();
      MockJsonUtilsForSFDC.firebaseResponseId = responseObject.Id;

      //store the record by it's generated ID in Firebase
      var newLoc = MockJsonTemplateModule.firebaseLoc + '/' + objectName + '/' + MockJsonUtilsForSFDC.firebaseResponseId + '/';
      var objectDataRef = new Firebase(newLoc);
      MockJsonUtilsForSFDC.firebaseResponse = objectDataRef.set(responseObject);

      request.handleRequest();
    },

    handler: function (request, response) {

      //generate a response with the ID
      response.body = {
        id: MockJsonUtilsForSFDC.firebaseResponseId
      };

    }
  }

]);
