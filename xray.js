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