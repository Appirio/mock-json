$(document).ready(function () {

  // Enable AJAX interception. All AJAX requests made thereafter will be intercepted and mocked
  // if they match one of the mock endpoints added to the library. The MockJsonApiLib module is
  // defined in the "mock-json-api-library.js" file. Meanwhile, the mock Box.com endpoints are
  // added to the library in the "mock-json-api-for-box.js" file.
  MockJsonApiLib.enable();

  // Add a click handler to the "generate" button
  $("input[name='generate']").click(function () {
    // Clear the "responseStatus" span and the "responseBody" textarea
    $("#responseStatus").empty();
    $("#responseBody").empty();

    // Get the selected Box.com endpoint radio button's value
    var selectedEndpoint = $("input[name='endpoint']:checked").val();

    // The possible values of the "endpoint" radio buttons are:
    // getFolderItems, getFolderInfo, postNewFolder, putFolderInfo, deleteFolder
    // (which are exactly the names of the methods in the BoxEndpoints object)

    // Get whether or not to include an Authorization header in the JSON calls
    var includeAuthHeader = $("input[name='includeAuthHeader']").is(":checked");

    // Make a JSON call to the selected endpoint, passing in a callback function to be called
    // when the endpoint has sent a JSON response back. The BoxEndpoints module is defined in
    // the "json-calls-to-box-api.js" file.
    BoxEndpoints[ selectedEndpoint ](includeAuthHeader, callback);

    // The callback function is passed as the "complete" handler to jQuery's $.ajax() method,
    // so it expects two parameters as declared below. For more info, please see:
    // http://api.jquery.com/jQuery.ajax/#jQuery-ajax-settings (scroll down to the "complete"
    // setting). The callback is passed as the "complete" handler so that it will be called
    // both upon success and error (400-level and 500-level HTTP status codes cause jQuery to
    // call the "error" handler, and NOT the "success" handler, but the "complete" handler
    // will be called regardless of the status code). However, this means that we must parse
    // the JSON response ourselves (jQuery passes a parsed JSON response only to the "success"
    // handler). The callback displays the response status and displays the JSON response in
    // "pretty-printed" form using the ECMAScript-5 JSON.stringify() method. Note that we must
    // be careful NOT to pass an empty string to JSON.parse(), which will throw a SyntaxError.
    function callback(jqXHR, textStatus) {
      $("#responseStatus").text(jqXHR.status + " " + jqXHR.statusText);
      $("#responseBody").text(
        ( jqXHR.responseText === "" ) ? "" :
          JSON.stringify(JSON.parse(jqXHR.responseText), null, 2)
      );
    }
  });

});
