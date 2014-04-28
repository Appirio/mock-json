/**
 * services/array/utils
 *
 * Utility functions for array manipulation
 */
module.exports = {

  // create a new array with split values
  getSplitValues: function (arr, splitDeliminator) {

    var newArr = [], val;
    for (var i = 0; i < arr.length; i++) {
      val = arr[i].split(splitDeliminator)[0];
      newArr.push(val);
    }

    return newArr;
  },

  /**
   * Remove values from target array that exist in matching array
   *
   * @param targetArray Array that will have values removed
   * @param matchingArray
   */
  removeMatchingValues: function (targetArray, matchingArray) {
    var i, idx;

    for (i = 0; i < matchingArray.length; i++) {
      idx = targetArray.indexOf(matchingArray[i]);
      if (idx > -1) {
        targetArray.splice(idx, 1);
      }
    }

  }
};
