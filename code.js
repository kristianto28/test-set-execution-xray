function onOpen() {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu('Test Execution Xray')
      .addItem('Set Credential', 'setClientIDSecret')
      .addItem('Set Label', 'setTestLabel')
      .addItem('Update Test Execution Result', 'updateTestExecutionResult')
      .addItem('Insert Test to Test Set', 'insertTestToTestSet')
      .addItem('Set Tester Label', 'setTesterLabel')
      .addItem('Map Tester ID', 'mapTesterID')
      .addToUi();
  }
  
  function setClientIDSecret() {
    // Create dialog
    var ui = SpreadsheetApp.getUi();
    var result = ui.prompt(
      'Input your client_id',
      'Your previous client_id is ' + userProperties.getProperty('xray_client_id_value') + ', please input below if you want to change your client_id:',
      ui.ButtonSet.OK
    )
  
    // Process the user's response
    var button = result.getSelectedButton();
    var clientIDRes = result.getResponseText();
    if (clientIDRes != '') {
      userProperties.setProperty('xray_client_id_value', clientIDRes)
    }
  
    if (button == ui.Button.OK) {
      // User clicked 'OK', prompt another dialog to request client_secret
      var ui = SpreadsheetApp.getUi();
      var clientSecretResult = ui.prompt(
        'Input your client_secret',
        'Your previous client_secret is ' + userProperties.getProperty('xray_client_secret_value') + ', please input below if you want to change your client_secret:',
        ui.ButtonSet.OK
      )
  
      var clientSecretRes = clientSecretResult.getResponseText();
      if (clientSecretRes != '') {
        userProperties.setProperty('xray_client_secret_value', clientSecretRes)
      }
    }
  }
  
  function setTestLabel() {
    var range = SpreadsheetApp.getActiveRange();
    var data = range.getValues();
    var labelMap = {}
    labelArray.forEach(label => {
      labelMap[label] = data[0].indexOf(label);
    })
  
    // Update property labelMap
    userProperties.setProperty('labelMap', JSON.stringify(labelMap));
  
    Logger.log('set label completed.');
    Logger.log('Labels are ' + JSON.stringify(labelMap))
  }
  
  function setTesterLabel() {
    var range = SpreadsheetApp.getActiveRange();
    var data = range.getValues();
    var labels = data[0];
  
    var testerLabelMap = {};
    labels.forEach(label => {
      testerLabelMap[label] = labels.indexOf(label);
    })
  
    docsProperties.setProperty('testerLabelMap', JSON.stringify(testerLabelMap));
    Logger.log(`set tester label completed, the map: ${testerLabelMap}`);
  }
  
  function mapTesterID() {
    var range = SpreadsheetApp.getActiveRange();
    var data = range.getValues();
    var testerLabelMap = JSON.parse(docsProperties.getProperty('testerLabelMap'));
    var testerMap = {};
  
    data.forEach(tester => {
      var idxTesterName = testerLabelMap['tester_name']
      var idxTesterID = testerLabelMap['user_id']
      testerMap[tester[idxTesterName]] = tester[idxTesterID]
    });
    docsProperties.setProperty('testerMap', JSON.stringify(testerMap));
    Logger.log(`map tester name and id completed, the map: ${testerMap}`);
  }
  
  function updateTestExecutionResult() {
    var range = SpreadsheetApp.getActiveRange();
  
    var executionList = range.getValues();
    var currentRow = range.getRowIndex();
    var labelMap = JSON.parse(userProperties.getProperty('labelMap'));
    var testerMap = JSON.parse(docsProperties.getProperty('testerMap'));
  
    var token = generateAuthToken();
    if (token == null) {
      return
    }
  
    executionList.forEach(result => {
      var data = {
        'testExecutionKey': result[labelMap['test_execution_mandatory']],
        'testExecutionID': null,
        'testKey': result[labelMap['code']],
        'testID': null,
        'testRunID': null,
        'executionResult': result[labelMap['execution_result_mandatory']].toUpperCase(),
        'comment': result[labelMap['comment']],
        'tester': testerMap[result[labelMap['tester_mandatory']]],
        'executionDate': parseDatetime(result[labelMap['test_date_mandatory']]),
        'defectTickets': defectArrConvert(result[labelMap['defect_tickets']])
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
      var res = getTests(token, data.testKey);
      if (!res.success) {
        setErrorInformation(currentRow, labelMap['code'] + 1, 'got error on getTests: ' + res.error);
        return;
      }
      data.testID = res.message.issueId;
  
      /**
       * getTestExecutions block
       */
      res = getTestExecutions(token, data.testExecutionKey);
      if (!res.success) {
        setErrorInformation(currentRow, labelMap['test_execution_mandatory'] + 1, 'got error on getTestExecutions: ' + res.error);
        return;
      }
      data.testExecutionID = res.message.issueId;
  
      /**
       * getTestRun block
       */
      res = getTestRun(token, data.testID, data.testExecutionID);
      if (!res.success) {
        setErrorInformation(currentRow, labelMap['execution_result_mandatory'] + 1, 'got error on getTestRun: ' + res.error);
        return;
      }
      data.testRunID = res.message.id;
  
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
      res = updateTestRun(token, data.testRunID, data.comment, data.executionDate, data.executionDate, data.tester);
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
  
      // Add current row by one for each result
      currentRow++
    })
  }
  
  function insertTestToTestSet() {
    var range = SpreadsheetApp.getActiveRange();
  
    var testList = range.getValues();
    var currentRow = range.getRowIndex();
    var labelMap = JSON.parse(userProperties.getProperty('labelMap'));
  
    var token = generateAuthToken();
    if (token == null) {
      return
    }
  
    testList.forEach(result => {
      var data = {
        'testSetKey': result[labelMap['test_set']],
        'testSetID': null,
        'testKey': result[labelMap['code']],
        'testID': null,
      }
  
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
      var res = getTests(token, data.testKey);
      if (!res.success) {
        setErrorInformation(currentRow, labelMap['code'] + 1, 'got error on getTests: ' + res.error);
        return;
      }
      data.testID = res.message.issueId;
  
      /**
       * getTestSets block
       */
      var res = getTestSets(token, data.testSetKey);
      if (!res.success) {
        setErrorInformation(currentRow, labelMap['test_set'] + 1, 'got error on getTestSets: ' + res.error);
        return;
      }
      data.testSetID = res.message.issueId;
  
      /**
       * addTestsToTestSet block
       */
      var res = addTestsToTestSet(token, data.testSetID, [data.testID])
      if (!res.success) {
        setErrorInformation(currentRow, labelMap['test_set'] + 1, 'got error on addTestsToTestSet: ' + res.error);
        return;
      }
  
      // Add current row by one for each result
      currentRow++
    })
  }