/**
 * This module defines the functions that make JSON calls to the Box.com REST API endpoints,
 * and exposes those functions as methods of the module. So to make a JSON call to an endpoint,
 * simply call the corresponding method like so:
 *
 *     BoxEndpoints.getFolderItems( includeAuthHeader, callback );
 *     BoxEndpoints.getFolderInfo( includeAuthHeader, callback );
 *     BoxEndpoints.postNewFolder( includeAuthHeader, callback );
 *     BoxEndpoints.putFolderInfo( includeAuthHeader, callback );
 *     BoxEndpoints.deleteFolder( includeAuthHeader, callback );
 *
 * Each function makes its JSON call using jQuery's $.ajax() method, passing the specified callback
 * as the "complete" handler, to be called both upon success and error. (Note: 400- and 500-level
 * HTTP status codes cause jQuery to call the "error" handler, and NOT the "success" handler, but
 * the "complete" handler will be called regardless of the status code.) For more info, please see:
 * http://api.jquery.com/jQuery.ajax/#jQuery-ajax-settings (scroll down to the "complete" setting).
 * The "includeAuthHeader" argument should be a boolean value that specifies whether or not to
 * include the Authorization header in the JSON call.
 */
var BoxEndpoints = ( function ($) {

  // This function makes an AJAX request to the getFolderItems endpoint. For more info, see:
  // http://developers.box.com/docs/#folders-retrieve-a-folders-items
  function getFolderItems(includeAuthHeader, callback) {
    // The request parameters, which will be converted into a query string by jQuery
    // and appended to the end of the URL
    var requestParameters = {
      "fields": "name,created_at",
      "limit": "5",
      "offset": "10"
    };

    // Make the AJAX request
    $.ajax({
      type: "GET",
      url: "https://api.box.com/2.0/folders/12345678/items",
      headers: includeAuthHeader ? { "Authorization": "Bearer AbcDefGhi" } : {},
      data: requestParameters,
      processData: true, // Convert the requestParameters data into a query string
      dataType: "json",
      complete: callback
    });
  }

  // This function makes an AJAX request to the getFolderInfo endpoint. For more info, see:
  // http://developers.box.com/docs/#folders-get-information-about-a-folder
  function getFolderInfo(includeAuthHeader, callback) {
    $.ajax({
      type: "GET",
      url: "https://api.box.com/2.0/folders/12345678",
      headers: includeAuthHeader ? { "Authorization": "Bearer AbcDefGhi" } : {},
      dataType: "json",
      complete: callback
    });
  }

  // This function makes an AJAX request to the postNewFolder endpoint. For more info, see:
  // http://developers.box.com/docs/#folders-create-a-new-folder
  function postNewFolder(includeAuthHeader, callback) {
    // The JSON string to be included in the body of the AJAX request
    var requestBodyJson = JSON.stringify({
      "name": "New Folder",
      "parent": { "id": "0" }
    });

    // Make the AJAX request
    $.ajax({
      type: "POST",
      url: "https://api.box.com/2.0/folders",
      headers: includeAuthHeader ? { "Authorization": "Bearer AbcDefGhi" } : {},
      contentType: "application/json",
      data: requestBodyJson,
      processData: false, // Don't convert the requestBodyJson data into a query string
      dataType: "json",
      complete: callback
    });
  }

  // This function makes an AJAX request to the putFolderInfo endpoint. For more info, see:
  // http://developers.box.com/docs/#folders-update-information-about-a-folder
  function putFolderInfo(includeAuthHeader, callback) {
    // The JSON string to be included in the body of the AJAX request
    var requestBodyJson = JSON.stringify({ "name": "New Folder Name!" });

    // Make the AJAX request
    $.ajax({
      type: "PUT",
      url: "https://api.box.com/2.0/folders/12345678",
      headers: includeAuthHeader ? { "Authorization": "Bearer AbcDefGhi" } : {},
      contentType: "application/json",
      data: requestBodyJson,
      processData: false, // Don't convert the requestBodyJson data into a query string
      dataType: "json",
      complete: callback
    });
  }

  // This function makes an AJAX request to the deleteFolder endpoint. For more info, see:
  // http://developers.box.com/docs/#folders-delete-a-folder
  function deleteFolder(includeAuthHeader, callback) {
    // The request parameters, which will be converted into a query string by jQuery
    // and appended to the end of the URL
    var requestParameters = { "recursive": "true" };

    // Make the AJAX request
    $.ajax({
      type: "DELETE",
      url: "https://api.box.com/2.0/folders/12345678",
      headers: includeAuthHeader ? { "Authorization": "Bearer AbcDefGhi" } : {},
      data: requestParameters,
      processData: true, // Convert the requestParameters data into a query string
      dataType: "json",
      complete: callback
    });
  }

  // Expose the functions to the "outside world" as module methods
  return {
    getFolderItems: getFolderItems,
    getFolderInfo: getFolderInfo,
    postNewFolder: postNewFolder,
    putFolderInfo: putFolderInfo,
    deleteFolder: deleteFolder
  };

}(jQuery) );
