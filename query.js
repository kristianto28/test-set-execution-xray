/**
 * Query getTests. It is used for retrieving issueId of the given test key that will be used for updating Test Run.
 */
var getTestsQuery = 'query getTests($jql: String, $limit: Int!){ getTests(jql: $jql, limit: $limit) { total results { issueId jira(fields: ["key"]) } } }'

/**
 * Query getTestExecutions. It is used for retrieving issueId of the given test execution key that will be used for updating Test Run.
 */
var getTestExecutionsQuery = 'query getTestExecutions($jql: String, $limit: Int!){ getTestExecutions(jql: $jql, limit: $limit) { total results { issueId jira(fields: ["key"]) } } }'

/**
 * Query getTestRun. It is used for retrieving issueId and status of the given test ID and test execution ID.
 */
var getTestRunQuery = 'query getTestRun($testIssueId:String, $testExecIssueId: String){ getTestRun(testIssueId: $testIssueId, testExecIssueId: $testExecIssueId) { id status { name } } }'

/**
 * Mutation updateTestRunStatus. It is used for updating the given test run ID status with value: PASSED, FAILED, EXECUTING, or TO DO.
 */
var updateTestRunStatusMutation = 'mutation updateTestRunStatus($id: String!, $status: String!){ updateTestRunStatus( id: $id, status: $status ) }'

/**
 * Mutation updateTestRun. It is used for updating the given test run ID details, such as comment, execution date, and executed by.
 */
var updateTestRunMutation = 'mutation ($id: String! $comment: String, $startedOn: String, $finishedOn: String, $executedById: String) { updateTestRun( id: $id, comment: $comment, startedOn: $startedOn, finishedOn: $finishedOn, executedById: $executedById ) { warnings } }'

/**
 * Mutation addDefectsToTestRun. It is used for linking any issues to the given test run ID.
 */
var addDefectsToTestRunMutation = 'mutation addDefectsToTestRun($id: String!, $issues: [String]!) { addDefectsToTestRun( id: $id, issues: $issues ) { addedDefects warnings } }'

/**
 * Query getTestSets. It is used for retrieving issueId of the given test set key that will be used for inserting test into the test set.
 */
var getTestSetsQuery = 'query getTestSets($jql: String, $limit: Int!){ getTestSets(jql: $jql, limit: $limit) { total results { issueId jira(fields: ["key"]) } } }'

/**
 * Mutation addTestsToTestSet. It is used for inserting existing test into test set.
 */
var addTestsToTestSetMutation = 'mutation addTestsToTestSet($issueId: String!, $testIssueIds: [String]!){ addTestsToTestSet( issueId: $issueId, testIssueIds: $testIssueIds ) { addedTests warning } }'

/**
 * Mutation addTestsToTestExecution. It is used for inserting existing test into test execution.
 */
var addTestsToTestExecutionMutation = 'mutation addTestsToTestExecution($issueId: String!, $testIssueIds: [String]!){ addTestsToTestExecution( issueId: $issueId, testIssueIds: $testIssueIds ) { addedTests warning } }'