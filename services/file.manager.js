/**
 * services/file.manager
 *
 * This is a file for all custom functions that manipulate the file system
 */
var fs = require('fs'),
  path = require("path");

module.exports = {

  /**
   * Get the names of files in a folder
   *
   * @param options dictionary of parameters that can include:
   *              absolutePath The path to the folder starting from the app root
   *              filterPattern A regular expression to determine which of the files to grab
   * @return Array of file names
   */
  getFileNames: function (options) {

    // make sure the relative path is there
    if (!options || !options.absolutePath) {
      return null;
    }

    // get all the file names first
    var folderPath = this.getFullPath(options.absolutePath),
      fileNames = fs.readdirSync(folderPath);

    // if no pattern or * then return the array as is
    if (!options.filterPattern || options.filterPattern === '*') {
      return fileNames;
    }

    var filteredFileNames = [],
      regex = new RegExp(options.filterPattern);
    for (var i = 0; i < fileNames.length; i++) {
      if (regex.test(fileNames[i])) {
        filteredFileNames.push(fileNames[i]);
      }
    }

    return filteredFileNames;
  },

  /**
   * Get the absolute path based on the path relative from the root
   *
   * @param relativePathFromAppRoot
   */
  getFullPath: function (relativePathFromAppRoot) {

    // we start off going back one dir since we are in the /services dir
    var fullPath = path.join(__dirname, '..');

    // if the value passed in is an array, loop through the array
    if (Object.prototype.toString.call(relativePathFromAppRoot) === '[object Array]') {

      for (var i = 0; i < relativePathFromAppRoot.length; i++) {
        fullPath = path.join(fullPath, relativePathFromAppRoot[i]);
      }
    }
    // else assume its a string and just append it
    else {
      fullPath = path.join(fullPath, relativePathFromAppRoot);
    }

    return fullPath;
  },

  /**
   * Convenience function to load a file using a relative path from the app root
   * @param relativePathFromAppRoot
   * @return The module.exports in the target file
   */
  loadFile: function (relativePathFromAppRoot) {
    var fullPath = this.getFullPath(relativePathFromAppRoot);
    return require(fullPath);
  },

  /**
   * Convenience function to load a file only if exists without throwing FileNotFound error
   * @param relativePathFromAppRoot
   * @return The module.exports in the target file or null
   */
  loadFileIfExists: function (relativePathFromAppRoot) {
    var fullPath = this.getFullPath(relativePathFromAppRoot);

    if (fs.existsSync(fullPath)) {
      return require(fullPath);
    } else {
      return null;
    }
  }
};