function generateAuthToken() {
    userProperties = PropertiesService.getUserProperties();
  
    var data = JSON.stringify({
      'client_id': userProperties.getProperty('xray_client_id_value'),
      'client_secret': userProperties.getProperty('xray_client_secret_value')
    });
  
    var headers = {
      'Content-Type': 'application/json'
    }
  
    var res = requestBuilder(authUrl, 'post', headers, data);
    if (res.getResponseCode() != 200 || res.getContentText() == null) {
      Logger.log(`failed to generate auth token, error: ${res.getContentText()}`);
      return null
    } else {
      Logger.log('succeed to generate auth token');
      var resBody = res.getContentText();
      return resBody.replaceAll('\"', '');
    }
  }