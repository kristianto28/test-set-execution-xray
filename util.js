function setBackgroundHighlightCell(row, column, color) {
    var sheet = SpreadsheetApp.getActiveSheet();
    var cell = sheet.getRange(row, column);
    cell.setBackground(color);
  }
  
  function setNoteOnCell(row, column, note) {
    var sheet = SpreadsheetApp.getActiveSheet();
    var cell = sheet.getRange(row, column);
    cell.setNote(note);
  }
  
  function setErrorInformation(row, column, error) {
    Logger.log(error);
    setBackgroundHighlightCell(row, column, errorBgColor);
    setNoteOnCell(row, column, error);
  }
  
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
  
  function defectArrConvert(defectStr) {
    defectStr = defectStr.replace(/ /g, '');
    defectArr = defectStr.split(',');
    return defectArr;
  }