/**
 * gqlReqHeaderBuilder function is used to generate request header. It receives token as parameter
 * return object of generated headers
 */
function gqlReqHeaderBuilder(token) {
    var headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    return headers;
  }
  
  /**
   * gqlReqBodyBuilder function is used to generate request body. It receives GQL query and GQL variables object
   * return object of generated body
   */
  function gqlReqBodyBuilder(query, variables) {
    var body = JSON.stringify({
      query: query,
      variables: variables
    });
    return body;
  }
  
  /**
   * requestBuilder function is used to fetch into the given url by the given request options
   * It receives url, method, headers, and payload. Then, sending the request using UrlFetchApp.fetch function
   * return the object of response
   */
  function requestBuilder(url, method, headers, payload) {
    var reqOpts = {
      'method': method,
      'headers': headers,
      'payload': payload
    };
    
    var res = UrlFetchApp.fetch(url, reqOpts);
    return res;
  }
  
  /**
   * responseBuilder function is used to generalised all responses in this library
   * It returns the response object: success (boolean), message of the response, and error of the response
   */
  function responseBuilder() {
    var responseData = {
      'success': false,
      'message': null,
      'error': null
    }
    return responseData;
  }