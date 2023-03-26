/**
 * Generate new menu "Test Set & Execution Xray" when user opens the sheet
 * Test Set & Execution Xray
 * |- Set Credential
 * |- Test Set & Execution
 * |--- Set Label for Upload
 * |--- Get Test Run ID
 * |--- Update Test Execution Result
 * |--- Insert Test to Test Execution
 * |--- Insert Test to Test Set
 * |- Tester Configuration
 * |--- Set Tester Label
 * |--- Map Tester ID
 * |- Auto Update Test Execution
 * |--- Set Auto Update Label
 * |--- Map Auto Update Data
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Test Set & Execution Xray')
    .addItem('Set Credential', 'setClientIDSecret')
    .addSubMenu(ui.createMenu('Test Set & Execution')
      .addItem('Set Label for Upload', 'setTestLabel')
      .addItem('Get Test Run ID', 'getTestRunID')
      .addItem('Update Test Execution Result', 'manualUpdateTestExecutionResult')
      .addItem('Insert Test to Test Execution', 'insertTestToTestExecution')
      .addItem('Insert Test to Test Set', 'insertTestToTestSet')
    )
    .addSubMenu(ui.createMenu('Tester Configuration')
      .addItem('Set Tester Label', 'setTesterLabel')
      .addItem('Map Tester ID', 'mapTesterID')
    )
    .addSubMenu(ui.createMenu('Auto Update Test Execution')
      .addItem('Set Auto Update Label', 'setAutoUploadLabel')
      .addItem('Map Auto Update Data', 'mapAutoUploadData')
    )
    .addToUi();
}

/**
 * Retrieve client_id and client_secret from user and save it into userProperties
 * If the user already set client_id and client_secret from Xray Uploader library, they do not need to set it again because it shares the same properties
 */
function setClientIDSecret() {
  // Create the dialog
  var ui = SpreadsheetApp.getUi();
  var result = ui.prompt(
    'Input your client_id',
    'Your previous client_id is ' + userProperties.getProperty('xray_client_id_value') + ', please input below if you want to change your client_id:',
    ui.ButtonSet.OK
  );

  // Process the user's input
  var button = result.getSelectedButton();
  var clientIDRes = result.getResponseText();

  // If clientID is given, then save it into userProperties
  if (clientIDRes != '') {
    userProperties.setProperty('xray_client_id_value', clientIDRes);
  }

  if (button == ui.Button.OK) {
    // User clicked 'OK', prompt another dialog to request client_secret
    var clientSecretResult = ui.prompt(
      'Input your client_secret',
      'Your previous client_secret is ' + userProperties.getProperty('xray_client_secret_value') + ', please input below if you want to change your client_secret:',
      ui.ButtonSet.OK
    );

    var clientSecretRes = clientSecretResult.getResponseText();
    // if clientSecret is given, then save it into userProperties
    if (clientSecretRes != '') {
      userProperties.setProperty('xray_client_secret_value', clientSecretRes);
    }
  }
}

/**
 * Map the uploader label and its column index
 * Then, the map data is stored into userProperties
 */
function setTestLabel() {
  var range = SpreadsheetApp.getActiveRange();
  var labelMap = setTestLabelHelper(range);

  // Store labelMap into userProperties and log the data
  userProperties.setProperty('labelMap', JSON.stringify(labelMap));
  Logger.log(`set label completed, map: ${JSON.stringify(labelMap)}`);
}

/**
 * Map the tester label and its column index
 * The map data is stored into docsProperties
 */
function setTesterLabel() {
  var range = SpreadsheetApp.getActiveRange();
  var data = range.getValues();
  var testerLabelMap = {};
  labelTesterArray.forEach(label => {
    var idx = data[0].indexOf(label);

    // Check if the label is mandatory and index is - 1, then prompt alert and stop the looping
    if (label.includes("mandatory") && idx == -1) {
      SpreadsheetApp.getUi().alert("Please input the mandatory field");
      return;
    }

    testerLabelMap[label] = idx;
  })

  // Store testerLabelMap into docsProperties and log the data
  docsProperties.setProperty('testerLabelMap', JSON.stringify(testerLabelMap));
  Logger.log(`set tester label completed, map: ${JSON.stringify(testerLabelMap)}`);
}

/**
 * Map the tester name and account ID
 * The map data is stored into docsProperties
 */
function mapTesterID() {
  var range = SpreadsheetApp.getActiveRange();
  var data = range.getValues();
  var testerLabelMap = JSON.parse(docsProperties.getProperty('testerLabelMap'));
  var testerMap = {};

  data.forEach(tester => {
    // Get index of tester name column
    var idxTesterName = testerLabelMap['tester_name_mandatory']

    // Get index of tester ID column
    var idxTesterID = testerLabelMap['user_id_mandatory']

    // Store the data to the map, tester name as the key, and tester ID as the value
    testerMap[tester[idxTesterName]] = tester[idxTesterID]
  });

  // Store testerMap into docsProperties and log the data
  docsProperties.setProperty('testerMap', JSON.stringify(testerMap));
  Logger.log(`map tester name and id completed, map: ${JSON.stringify(testerMap)}`);
}

/**
 * Map the auto uploader label and its column index for further purpose
 * The map is stored into docsProperties
 */
function setAutoUploadLabel() {
  var range = SpreadsheetApp.getActiveRange();
  var data = range.getValues();
  var autoUploadLabelMap = {};
  labelAutoUploadArray.forEach(label => {
    var idx = data[0].indexOf(label);

    // Check if the label is mandatory and index is - 1, then prompt alert and stop the looping
    if (label.includes("mandatory") && idx == -1) {
      SpreadsheetApp.getUi().alert("Please input the mandatory field");
      return;
    }

    autoUploadLabelMap[label] = idx;
  });

  // Store autoUploadLabelMap into documentProperties and log the data
  docsProperties.setProperty('autoUploadLabelMap', JSON.stringify(autoUploadLabelMap));
  Logger.log(`set auto upload label completed, map: ${JSON.stringify(autoUploadLabelMap)}`);
}

/**
 * Map the sheet name, label row, and test case row for auto uploading the data
 * The key of the map is the sheet name. The value is the object of label row and test case row
 * The map is stored into docsProperties
 */
function mapAutoUploadData() {
  var range = SpreadsheetApp.getActiveRange();
  var currentRow = range.getRowIndex() - 1; // Get the first current row index
  var data = range.getValues();
  var autoUploadLabelMap = JSON.parse(docsProperties.getProperty('autoUploadLabelMap'));
  var uploadDataMap = {}

  data.forEach(sheetData => {
    // Increase currentRow counter by one
    currentRow++;

    // Get column index of sheet name
    var idxSheetName = autoUploadLabelMap['sheet_name_mandatory'];

    // Get label range index of sheet name
    var idxLabelRange = autoUploadLabelMap['range_of_label_mandatory'];

    // Get test case range index of sheet name
    var idxTestCaseRange = autoUploadLabelMap['range_of_test_case_mandatory'];

    // Check if the sheet is available or not. If not available, then marked as an error
    var sheet = checkSheets(sheetData[idxSheetName]);
    if (sheet == null) {
      setErrorInformation(currentRow, idxSheetName + 1, 'sheet is not available');
    } else {
      // Store the data into the map
      uploadDataMap[sheetData[idxSheetName]] = {
        'labelRange': sheetData[idxLabelRange],
        'testCaseRange': sheetData[idxTestCaseRange]
      };
    }
  });

  // Store uploadDataMap into docsProperties
  docsProperties.setProperty('uploadDataMap', JSON.stringify(uploadDataMap));
  Logger.log(`map auto upload sheet data completed, map: ${JSON.stringify(uploadDataMap)}`);
}

/**
 * Update the test execution result of the selected range manually
 */
function manualUpdateTestExecutionResult() {
  // Get test case from active range
  var testCaseRange = SpreadsheetApp.getActiveRange();

  // Get labelMap from userProperties
  var labelMap = JSON.parse(userProperties.getProperty('labelMap'));

  // Call updateTestExecutionResult function
  updateTestExecutionResult(testCaseRange, labelMap);
}

/**
 * Update the test execution result automatically using Triggers
 * The sheet data will be taken from the map of auto upload data
 */
function autoUpdateTestExecutionResult() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var uploadDataMap = JSON.parse(docsProperties.getProperty('uploadDataMap'));

  // Loop over uploadDataMap data
  for (var [key, val] of Object.entries(uploadDataMap)) {
    // Generate labelNotation to get label row
    var labelNotation = `${key}!${val.labelRange}`;

    // Generate testCaseNotation to get test case row
    var testCaseNotation = `${key}!${val.testCaseRange}`;

    // Get label range
    var labelRange = sheet.getRange(labelNotation);

    // Get test case range
    var testCaseRange = sheet.getRange(testCaseNotation);

    // Map the label and its index
    var labelMap = setTestLabelHelper(labelRange);

    // Call updateTestExecutionResult function
    updateTestExecutionResult(testCaseRange, labelMap);
  }
}

/**
 * Get test run ID from the pair of test case ID and test execution ID
 * This is used to speed up the updater execution time because it ignores the steps to retrieve test case ID and test execution ID
 */
function getTestRunID() {
  var range = SpreadsheetApp.getActiveRange();
  var testList = range.getValues(); // get test list data
  var currentRow = range.getRowIndex() - 1; // Get the first current row index
  var updatedCount = 0; // Store updated count for user information on toaster
  var labelMap = JSON.parse(userProperties.getProperty('labelMap'));

  // Get user token
  var token = generateAuthToken();
  if (token == null) {
    return
  }

  // Loop for each result in testCaseRange
  testList.forEach(result => {
    var testExecutionKey = result[labelMap['test_execution_mandatory']] // Get test execution key
    var testKey = result[labelMap['code']] // Get test code key

    // Generate the data into an object. testExecutionID and testID are retrieved from cache (if not found, then the value will be null)
    var data = {
      'testExecutionKey': testExecutionKey,
      'testExecutionID': cache.get(testExecutionKey),
      'testKey': testKey,
      'testID': cache.get(testKey)
    }

    // Add current row and updatedCount by one for each result
    currentRow++;
    updatedCount++;

    /**
     * Checking mandatory column
     */
    // testKey value checking
    if (data.testKey == '') {
      setErrorInformation(currentRow, labelMap['code'] + 1, 'test key (code) cannot be empty');
      return;
    }

    // testExecutionKey value checking
    if (data.testExecutionKey == '') {
      setErrorInformation(currentRow, labelMap['test_execution_mandatory'] + 1, 'test execution key cannot be empty');
      return;
    }

    /**
     * getTests block
     */
    // Checking if testID is not found in cache, then retrieve it again from Xray
    if (data.testID == null) {
      var res = getTests(token, data.testKey);
      if (!res.success) {
        setErrorInformation(currentRow, labelMap['code'] + 1, 'got error on getTests: ' + res.error);
        return;
      }
      data.testID = res.message.issueId;

      // Put the testID inside the cache
      cache.put(testKey, data.testID);
    }

    /**
     * getTestExecutions block
     */
    // Checking if testExecutionID is not found in cache, then retrieve it again from Xray
    if (data.testExecutionID == null) {
      res = getTestExecutions(token, data.testExecutionKey);
      if (!res.success) {
        setErrorInformation(currentRow, labelMap['test_execution_mandatory'] + 1, 'got error on getTestExecutions: ' + res.error);
        return;
      }
      data.testExecutionID = res.message.issueId;

      // Put the testExecutionID inside the cache
      cache.put(testExecutionKey, data.testExecutionID);
    }

    /**
     * getTestRun block
     */
    // Retrieve testRunID from Xray
    res = getTestRun(token, data.testID, data.testExecutionID);
    if (!res.success) {
      setErrorInformation(currentRow, labelMap['test_run_id'] + 1, 'got error on getTestRun: ' + res.error);
      return;
    }

    // Fill the cell with testRunID
    setValueInCell(currentRow, labelMap['test_run_id'] + 1, res.message.id);

    // Show toaster information on the bottom-left side, showing the updated test key and updated percentage
    toastInformation(`Get test run ID of test case ${data.testKey} and test execution ${data.testExecutionKey} is completed! (${(updatedCount / testList.length * 100).toFixed(2)}%)`, 'Get Test Run ID Progress');
  });

}

/**
 * Update test execution result based on the selected test case range and the given label map (contains label name and its column index)
 */
function updateTestExecutionResult(testCaseRange, labelMap) {
  var executionList = testCaseRange.getValues(); // Get the value from the test case range
  var currentRow = testCaseRange.getRowIndex() - 1; // Get the first current row index
  var updatedCount = 0; // Store updated count for user information on toaster

  var testerMap = JSON.parse(docsProperties.getProperty('testerMap')); // get testerMap from docsProperties

  // Get user token
  var token = generateAuthToken();
  if (token == null) {
    return
  }

  // Loop for each result in executionList
  executionList.forEach(result => {
    var testExecutionKey = result[labelMap['test_execution_mandatory']] // Get test execution key
    var testKey = result[labelMap['code']] // Get test code key

    // Generate the data as an object. testExecutionID and testID are taken from cache. If not found, then it will return as null
    var data = {
      'testExecutionKey': testExecutionKey,
      'testExecutionID': cache.get(testExecutionKey),
      'testKey': testKey,
      'testID': cache.get(testKey),
      'testRunID': result[labelMap['test_run_id']],
      'executionResult': result[labelMap['execution_result_mandatory']].toUpperCase(),
      'comment': result[labelMap['comment']],
      'tester': testerMap[result[labelMap['tester_mandatory']]],
      'executionDate': parseDatetime(result[labelMap['test_date_mandatory']]),
      'executionFinishedDate': '',
      'defectTickets': defectArrConvert(result[labelMap['defect_tickets']])
    }

    // Add current row and updatedCount by one for each result
    currentRow++;
    updatedCount++;

    // if the current execution result is included in skippedExecutionResult (TO DO or NOT TESTED), then return and continue to the next test data
    if (skippedExecutionResult.includes(data.executionResult)) {
      toastInformation(`Test key ${data.testKey} is skipped. (${(updatedCount / executionList.length * 100).toFixed(2)}%)`, 'Update Test Execution Result Progress');
      return;
    }

    /**
     * Checking mandatory column
     */
    // testKey value checking
    if (data.testKey == '') {
      setErrorInformation(currentRow, labelMap['code'] + 1, 'test key (code) cannot be empty');
      return;
    }

    // testExecutionKey value checking
    if (data.testExecutionKey == '') {
      setErrorInformation(currentRow, labelMap['test_execution_mandatory'] + 1, 'test execution key cannot be empty');
      return;
    }

    // executionResult value checking
    if (data.executionResult == '') {
      setErrorInformation(currentRow, labelMap['execution_result_mandatory'] + 1, 'test execution result cannot be empty');
      return;
    } else if (!executionResult.includes(data.executionResult)) {
      setErrorInformation(currentRow, labelMap['execution_result_mandatory'] + 1, 'the given test execution result is not recognized. Please input from the following options: ' + executionResult.toString());
      return;
    }

    // executionDate value checking
    if (data.executionDate == '') {
      setErrorInformation(currentRow, labelMap['test_date_mandatory'] + 1, 'execution date cannot be empty');
      return
    }

    // tester value checking
    if (data.tester == '') {
      setErrorInformation(currentRow, labelMap['tester_mandatory'] + 1, 'tester cannot be empty');
      return
    }

    /**
     * getTests block
     */
    // Checking if testRunID is empty, then retrieve the testID data
    if (data.testRunID == '') {
      // Checking if testID is not found in cache, then retrieve it again from Xray
      if (data.testID == null) {
        var res = getTests(token, data.testKey);
        if (!res.success) {
          setErrorInformation(currentRow, labelMap['code'] + 1, 'got error on getTests: ' + res.error);
          return;
        }
        data.testID = res.message.issueId;

        // Put the testID inside the cache
        cache.put(testKey, data.testID);
      }
    }

    /**
     * getTestExecutions block
     */
    // Checking if testRunID is empty, then retrieve the testID data
    if (data.testRunID == '') {
      // Checking if testExecutionID is not found in cache, then retrieve it again from Xray
      if (data.testExecutionID == null) {
        res = getTestExecutions(token, data.testExecutionKey);
        if (!res.success) {
          setErrorInformation(currentRow, labelMap['test_execution_mandatory'] + 1, 'got error on getTestExecutions: ' + res.error);
          return;
        }
        data.testExecutionID = res.message.issueId;

        // Put the testExecutionID inside the cache
        cache.put(testExecutionKey, data.testExecutionID);
      }
    }

    /**
     * getTestRun block
     */
    // Checking if testRunID is empty in the data, then retrieve it again from Xray and set the value in the cell
    if (data.testRunID == '') {
      res = getTestRun(token, data.testID, data.testExecutionID);
      if (!res.success) {
        setErrorInformation(currentRow, labelMap['execution_result_mandatory'] + 1, 'got error on getTestRun: ' + res.error);
        return;
      }
      data.testRunID = res.message.id;

      // Set testRunID inside the cell
      setValueInCell(currentRow, labelMap['test_run_id'] + 1, data.testRunID);
    }

    /**
     * updateTestRunStatus block
     */
    res = updateTestRunStatus(token, data.testRunID, data.executionResult);
    if (!res.success) {
      setErrorInformation(currentRow, labelMap['execution_result_mandatory'] + 1, 'got error on updateTestRunStatus: ' + res.error);
      return;
    } else {
      Logger.log(res.message);
    }

    /**
     * updateTestRun block
     */
    // If executionResult is EXECUTING, then set executionFinishedDate to empty string, else set with executionDate (will be same as execution start date)
    data.executionFinishedDate = (data.executionResult == 'EXECUTING') ? '' : data.executionDate
    res = updateTestRun(token, data.testRunID, data.comment, data.executionDate, data.executionFinishedDate, data.tester);
    if (!res.success) {
      setErrorInformation(currentRow, labelMap['execution_result_mandatory'] + 1, 'got error on updateTestRun: ' + res.error);
      return;
    } else {
      Logger.log(res.message);
    }

    /**
     * addDefectsToTestRun, only if defectTickets is provided
     */
    if (data.defectTickets != '') {
      res = addDefectsToTestRun(token, data.testRunID, data.defectTickets);
      if (!res.success) {
        setErrorInformation(currentRow, labelMap['defect_tickets'] + 1, 'got error on addDefectsToTestRun: ' + res.error);
      } else {
        Logger.log(res.message);
      }
    }

    // Show toaster information on the bottom-left side, showing the updated test key and updated percentage
    toastInformation(`Update test execution result for test key ${data.testKey} is completed! (${(updatedCount / executionList.length * 100).toFixed(2)}%)`, 'Update Test Execution Result Progress');
  });
}

/**
 * insertTestToTestSet is the main function to insert the Test into the Test Set
 */
function insertTestToTestSet() {
  var range = SpreadsheetApp.getActiveRange();
  var testList = range.getValues(); // get test list data
  var currentRow = range.getRowIndex() - 1; // Get the first current row index
  var updatedCount = 0; // Store updated count for user information on toaster
  var labelMap = JSON.parse(userProperties.getProperty('labelMap'));

  // Get user token
  var token = generateAuthToken();
  if (token == null) {
    return
  }

  // Loop for each result in testList
  testList.forEach(result => {
    var testSetKey = result[labelMap['test_set']]; // Get test set key
    var testKey = result[labelMap['code']]; // Get test code key

    // Generate the data as an object. Get testSetID and testID from cache. Other fields are taken from the result variable
    var data = {
      'testSetKey': testSetKey,
      'testSetID': cache.get(testSetKey),
      'testKey': testKey,
      'testID': cache.get(testKey),
    };

    // Add current row and updatedCount by one for each result
    currentRow++;
    updatedCount++;

    /**
     * Checking mandatory column
     */
    // testKey value checking
    if (data.testKey == '') {
      setErrorInformation(currentRow, labelMap['code'] + 1, 'test key (code) cannot be empty');
      return;
    }

    // testSetKey value checking
    if (data.testSetKey == '') {
      setErrorInformation(currentRow, labelMap['test_set'] + 1, 'test set key cannot be empty');
      return;
    }

    /**
     * getTests block
     */
    // Checking if testID is not found in cache, then retrieve it again from Xray
    if (data.testID == null) {
      var res = getTests(token, data.testKey);
      if (!res.success) {
        setErrorInformation(currentRow, labelMap['code'] + 1, 'got error on getTests: ' + res.error);
        return;
      }
      data.testID = res.message.issueId;

      // Put the testID inside the cache
      cache.put(testKey, data.testID);
    }

    /**
     * getTestSets block
     */
    // Checking if testSetID is not found in cache, then retrieve it again from Xray
    if (data.testSetID == null) {
      var res = getTestSets(token, data.testSetKey);
      if (!res.success) {
        setErrorInformation(currentRow, labelMap['test_set'] + 1, 'got error on getTestSets: ' + res.error);
        return;
      }
      data.testSetID = res.message.issueId;

      // Put the testSetID inside the cache
      cache.put(testSetKey, data.testSetID);
    }

    /**
     * addTestsToTestSet block
     */
    var res = addTestsToTestSet(token, data.testSetID, [data.testID])
    if (!res.success) {
      setErrorInformation(currentRow, labelMap['test_set'] + 1, 'got error on addTestsToTestSet: ' + res.error);
      return;
    } else {
      Logger.log(res.message)
    }

    // Show toaster information on the bottom-left side, showing the updated test key and updated percentage
    toastInformation(`Insert test case ${data.testKey} into test set ${data.testSetKey} is completed! (${(updatedCount / testList.length * 100).toFixed(2)}%)`, 'Insert Test Case to Test Set Progress');
  })
}

/**
 * insertTestToTestExecution is the main function to insert the Test into the Test Execution
 */
function insertTestToTestExecution() {
  var range = SpreadsheetApp.getActiveRange();
  var testList = range.getValues(); // get test list data
  var currentRow = range.getRowIndex() - 1; // Get the first current row index
  var updatedCount = 0; // Store updated count for user information on toaster
  var labelMap = JSON.parse(userProperties.getProperty('labelMap'));

  // Get user token
  var token = generateAuthToken();
  if (token == null) {
    return
  }

  // Loop for each result in testList
  testList.forEach(result => {
    var testExecutionKey = result[labelMap['test_execution_mandatory']]; // Get test execution key
    var testKey = result[labelMap['code']]; // Get test code key

    // Generate the data as an object. Get testExecutionID and testID from cache. Other fields are taken from the result variable
    var data = {
      'testExecutionKey': testExecutionKey,
      'testExecutionID': cache.get(testExecutionKey),
      'testKey': testKey,
      'testID': cache.get(testKey),
    };

    // Add current row and updatedCount by one for each result
    currentRow++;
    updatedCount++;

    /**
     * Checking mandatory column
     */
    // testKey value checking
    if (data.testKey == '') {
      setErrorInformation(currentRow, labelMap['code'] + 1, 'test key (code) cannot be empty');
      return;
    }

    // testExecutionKey value checking
    if (data.testExecutionKey == '') {
      setErrorInformation(currentRow, labelMap['test_execution_mandatory'] + 1, 'test set key cannot be empty');
      return;
    }

    /**
     * getTests block
     */
    // Checking if testID is not found in cache, then retrieve it again from Xray
    if (data.testID == null) {
      var res = getTests(token, data.testKey);
      if (!res.success) {
        setErrorInformation(currentRow, labelMap['code'] + 1, 'got error on getTests: ' + res.error);
        return;
      }
      data.testID = res.message.issueId;

      // Put the testID inside the cache
      cache.put(testKey, data.testID);
    }

    /**
     * getTestExecutions block
     */
    // Checking if testExecutionID is not found in cache, then retrieve it again from Xray
    if (data.testExecutionID == null) {
      res = getTestExecutions(token, data.testExecutionKey);
      if (!res.success) {
        setErrorInformation(currentRow, labelMap['test_execution_mandatory'] + 1, 'got error on getTestExecutions: ' + res.error);
        return;
      }
      data.testExecutionID = res.message.issueId;

      // Put the testExecutionID inside the cache
      cache.put(testExecutionKey, data.testExecutionID);
    }

    /**
     * addTestsToTestExecution block
     */
    var res = addTestsToTestExecution(token, data.testExecutionID, [data.testID])
    Logger.log(res)
    if (!res.success) {
      setErrorInformation(currentRow, labelMap['test_execution_mandatory'] + 1, 'got error on addTestsToTestExecution: ' + res.error);
      return;
    } else {
      Logger.log(res.message)
    }

    // Show toaster information on the bottom-left side, showing the updated test key and updated percentage
    toastInformation(`Insert test case ${data.testKey} into test execution ${data.testExecutionKey} is completed! (${(updatedCount / testList.length * 100).toFixed(2)}%)`, 'Insert Test Case to Test Execution Progress');
  })
}