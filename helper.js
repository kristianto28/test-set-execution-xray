function gqlReqHeaderBuilder(token) {
    var headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    return headers;
  }
  
  function gqlReqBodyBuilder(query, variables) {
    var body = JSON.stringify({
      query: query,
      variables: variables
    });
    return body;
  }
  
  function requestBuilder(url, method, headers, payload) {
    var reqOpts = {
      'method': method,
      'headers': headers,
      'payload': payload
    };
    
    var res = UrlFetchApp.fetch(url, reqOpts);
    return res;
  }
  
  function responseBuilder() {
    var responseData = {
      'success': false,
      'message': null,
      'error': null
    }
    return responseData;
  }