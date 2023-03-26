/**
 * Highlight the given cell by the given color hex code
 */
function setBackgroundHighlightCell(row, column, color) {
  var sheet = SpreadsheetApp.getActiveSheet();
  var cell = sheet.getRange(row, column);
  cell.setBackground(color);
}

/**
 * Set note on the given cell
 */
function setNoteOnCell(row, column, note) {
  var sheet = SpreadsheetApp.getActiveSheet();
  var cell = sheet.getRange(row, column);
  cell.setNote(note);
}

/**
 * Set value in the given cell
 */
function setValueInCell(row, column, value) {
  var sheet = SpreadsheetApp.getActiveSheet();
  var cell = sheet.getRange(row, column);
  cell.setValue(value);
}

/**
 * Log error, mark the background cell color, and set the note on cell to show the log to the user
 */
function setErrorInformation(row, column, error) {
  Logger.log(error);
  setBackgroundHighlightCell(row, column, errorBgColor);
  setNoteOnCell(row, column, error);
}

/**
 * Parse the datetime in the sheet into Xray accepted input parameter format
 * Return the parsed datetime with format yyyy-MM-ddThh:mm:ssZ
 */
function parseDatetime(datetimeStr) {
  var datetime = new Date(datetimeStr);
  var year = datetime.getFullYear();
  var month = String(datetime.getMonth() + 1).padStart(2, '0');
  var date = String(datetime.getDate()).padStart(2, '0');
  var hour = String(datetime.getHours()).padStart(2, '0');
  var minute = String(datetime.getMinutes()).padStart(2, '0');
  var second = String(datetime.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${date}T${hour}:${minute}:${second}Z`
}

/**
 * Converting the given defects string into array format
 * Example of defectStr: MTCM-12345,MTCM-67890 
 * Return the converted defect array, for example: ['MTCM-12345', 'MTCM-67890']
 */
function defectArrConvert(defectStr) {
  defectStr = defectStr.replace(/ /g, '');
  defectArr = defectStr.split(',');
  return defectArr;
}

/**
 * Give the information to the user by using toast UI on the bottom-right of the window
 */
function toastInformation(message, title) {
  var ui = SpreadsheetApp.getActiveSpreadsheet();
  ui.toast(message, title);
}

/**
 * Check whether the given sheet name is available in the Spreadsheet
 * Return null if the given name is not available
 */
function checkSheets(sheetName) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(sheetName);
  return sheet;
}

/**
 * Map the updater label with the index on the sheet
 */
function setTestLabelHelper(range) {
  var data = range.getValues();
  var labelMap = {}
  labelArray.forEach(label => {
    var idx = data[0].indexOf(label);

    // Check if the label is mandatory and index is -1, then prompt alert and stop the looping
    if (label.includes("mandatory") && idx == -1) {
      SpreadsheetApp.getUi().alert("Please input the mandatory field");
      return null;
    }

    labelMap[label] = idx;
  })
  
  return labelMap;
}