/**
 * getTests function is used to get Test data from Xray (mainly the Test Xray ID)
 * input parameters: token (Xray token), and key of the test (for example: MTCM-123456)
 * return the data if the data is found, otherwise return error
 */
function getTests(token, key) {
  var reqVar = {
    "jql": `key="${key}"`,
    "limit": 1
  };

  var resData = responseBuilder();

  var headers = gqlReqHeaderBuilder(token);
  var body = gqlReqBodyBuilder(getTestsQuery, reqVar);
  var res = requestBuilder(gqlUrl, 'post', headers, body);
  var resBody = JSON.parse(res.getContentText());
  if (resBody.data.getTests.total == 0) {
    resData.error = `test with the given key ${key} is not found`;
  } else {
    resData.success = true;
    resData.message = resBody.data.getTests.results[0];
  };
  return resData;
}

/**
 * getTestSets function is used to get Test Set data from Xray (mainly the Test Set Xray ID)
 * input parameters: token (Xray token), and key of the test set (for example: MTCM-123456)
 * return the data if the data is found, otherwise return error
 */
function getTestSets(token, key) {
  var reqVar = {
    "jql": `key="${key}"`,
    "limit": 1
  };

  var resData = responseBuilder();

  var headers = gqlReqHeaderBuilder(token);
  var body = gqlReqBodyBuilder(getTestSetsQuery, reqVar);
  var res = requestBuilder(gqlUrl, 'post', headers, body);
  var resBody = JSON.parse(res.getContentText());
  if (resBody.data.getTestSets.total == 0) {
    resData.error = `test set with the given key ${key} is not found`;
  } else {
    resData.success = true;
    resData.message = resBody.data.getTestSets.results[0];
  };
  return resData;
}

/**
 * getTestExecutions function is used to get Test Execution data from Xray (mainly the Test Execution Xray ID)
 * input parameters: token (Xray token), and key of the test execution (for example: MTCM-123456)
 * return the data if the data is found, otherwise return error
 */
function getTestExecutions(token, key) {
  var reqVar = {
    "jql": `key=${key}`,
    "limit": 1
  }

  var resData = responseBuilder();

  var headers = gqlReqHeaderBuilder(token);
  var body = gqlReqBodyBuilder(getTestExecutionsQuery, reqVar);
  var res = requestBuilder(gqlUrl, 'post', headers, body);
  var resBody = JSON.parse(res.getContentText());
  if (resBody.data.getTestExecutions.total == 0) {
    resData.error = `test execution with the given key ${key} is not found`;
  } else {
    resData.success = true;
    resData.message = resBody.data.getTestExecutions.results[0];
  }
  return resData;
}

/**
 * getTestRun function is used to get Test Run data from Xray (the Test Run Xray ID)
 * input parameters: token (Xray token) and pair of testId and testExecutionId
 * return the data if the data is found, otherwise return error
 */
function getTestRun(token, testId, testExecutionId) {
  var reqVar = {
    "testIssueId": testId,
    "testExecIssueId": testExecutionId
  };

  var resData = responseBuilder();

  var headers = gqlReqHeaderBuilder(token);
  var body = gqlReqBodyBuilder(getTestRunQuery, reqVar);
  var res = requestBuilder(gqlUrl, 'post', headers, body);
  var resBody = JSON.parse(res.getContentText());
  if (resBody.data.getTestRun == null) {
    resData.error = `test run for the given test ID ${testId} and test execution ID ${testExecutionId} is not found`
  } else {
    resData.success = true;
    resData.message = resBody.data.getTestRun;
  }
  return resData;
}

/**
 * updateTestRunStatus function is used to update test run status to the given status (normally PASSED, FAILED, EXECUTING)
 * input parameters: token (Xray token), test run ID, and test run status
 * return the data if update is succeed, otherwise return error
 */
function updateTestRunStatus(token, testRunId, status) {
  var reqVar = {
    "id": testRunId,
    "status": status
  };

  var resData = responseBuilder();

  var headers = gqlReqHeaderBuilder(token);
  var body = gqlReqBodyBuilder(updateTestRunStatusMutation, reqVar);
  var res = requestBuilder(gqlUrl, 'post', headers, body);
  var resBody = JSON.parse(res.getContentText());
  if (resBody.data.updateTestRunStatus == null) {
    resData.error = `got error: ${JSON.stringify(resBody.errors)}`;
  } else {
    resData.success = true;
    resData.message = `test run status of ID ${testRunId} is successfully updated`;
  }
  return resData;
}

/**
 * updateTestRun function is used to update test run detail information such as comment, execution date, and tester information
 * input parameters: token (Xray token), test run ID, comment, testing start date, testing finished date, and tester (executed by) ID
 * return the data if update is succeed, otherwise return error
 */
function updateTestRun(token, testRunId, comment, startedOn, finishedOn, executedById) {
  var reqVar = {
    "id": testRunId,
    "comment": comment,
    "startedOn": startedOn,
    "finishedOn": finishedOn,
    "executedById": executedById
  };

  var resData = responseBuilder();

  var headers = gqlReqHeaderBuilder(token);
  var body = gqlReqBodyBuilder(updateTestRunMutation, reqVar);
  var res = requestBuilder(gqlUrl, 'post', headers, body);
  var resBody = JSON.parse(res.getContentText());
  if (resBody.data.updateTestRun == null) {
    resData.error = `got error: ${JSON.stringify(resBody.errors)}`;
  } else {
    resData.success = true;
    resData.message = `test run data of ID ${testRunId} is successfully updated`;
  }
  return resData;
}

/**
 * addDefectsToTestRun function is used to link the issues list into the given test run ID
 * input parameters: token (Xray token), test run ID, and issuesList (for example: ['MTCM-12345', 'MTCM-67890'])
 * return the data if update is succeed, otherwise return error
 */
function addDefectsToTestRun(token, testRunId, issuesList) {
  var reqVar = {
    "id": testRunId,
    "issues": issuesList
  };

  var resData = responseBuilder();

  var headers = gqlReqHeaderBuilder(token);
  var body = gqlReqBodyBuilder(addDefectsToTestRunMutation, reqVar);
  var res = requestBuilder(gqlUrl, 'post', headers, body);
  var resBody = JSON.parse(res.getContentText());
  if (resBody.data.addDefectsToTestRun == null) {
    resData.error = `got error: ${JSON.stringify(resBody.errors)}`
  } else {
    resData.success = true;
    resData.message = `success added defects to test run of ID ${testRunId}, issues list: ${issuesList}`
  }
  return resData;
}

/**
 * addTestsToTestSet function is used to insert the tests into the test set
 * input parameters: token (Xray token), test set ID, and tests ID list
 * return the data if tests are inserted into test set, otherwise return error
 */
function addTestsToTestSet(token, testSetId, testsIdList) {
  var reqVar = {
    "issueId": testSetId,
    "testIssueIds": testsIdList
  };

  var resData = responseBuilder();

  var headers = gqlReqHeaderBuilder(token);
  var body = gqlReqBodyBuilder(addTestsToTestSetMutation, reqVar);
  var res = requestBuilder(gqlUrl, 'post', headers, body);
  var resBody = JSON.parse(res.getContentText());
  if (resBody.data.addTestsToTestSet == null) {
    resData.error = `got error: ${JSON.stringify(resBody.errors)}`
  } else {
    resData.success = true;
    resData.message = `success added tests to test set of ID ${testSetId}, tests list: ${testsIdList}`
  }
  return resData;
}

/**
 * addTestsToTestExecution function is used to insert the tests into the test execution
 * input parameters: token (Xray token), test execution ID, and tests ID list
 * return the data if tests are inserted into test set, otherwise return error
 */
function addTestsToTestExecution(token, testExecutionId, testsIdList) {
  var reqVar = {
    "issueId": testExecutionId,
    "testIssueIds": testsIdList
  };

  var resData = responseBuilder();

  var headers = gqlReqHeaderBuilder(token);
  var body = gqlReqBodyBuilder(addTestsToTestExecutionMutation, reqVar);
  var res = requestBuilder(gqlUrl, 'post', headers, body);
  var resBody = JSON.parse(res.getContentText());
  Logger.log(resBody);
  if (resBody.data.addTestsToTestExecution == null) {
    resData.error = `got error: ${JSON.stringify(resBody.errors)}`
  } else {
    resData.success = true;
    resData.message = `success added tests to test execution of ID ${testExecutionId}, tests list: ${testsIdList}`
  }
  return resData;
}