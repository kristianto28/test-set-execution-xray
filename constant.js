// Xray endpoint
const xrayUrl = 'https://xray.cloud.getxray.app/api/v2';

// Xray GraphGQL endpoint
const gqlUrl = `${xrayUrl}/graphql`;

// Xray authenticate endpoint
const authUrl = `${xrayUrl}/authenticate`;

// Background color for error cell
const errorBgColor = '#FFB6B3';

// Background color for succeed cell
const succeedBgColor = '#BDE7BD';

// Execution result expected array
var executionResult = ['PASSED', 'FAILED', 'EXECUTING', 'TO DO', 'NOT TESTED'];

// Skipped execution result is used for checking purpose. TO DO and NOT TESTED test case will be skipped during data update
var skippedExecutionResult = ['TO DO', 'NOT TESTED']