function onSubmit(e) {
  // This input is untrusted, so we should verify that it's valid JSON (and *only* send JSON further downstream).
  try {
    var data = e.response.getItemResponses()[0].getResponse().trim()
    var puzzle = JSON.parse(data)
  } catch (SyntaxError) {
    console.error('Failed to parse response text', data)
    return
  }
  var requestId = e.response.getItemResponses()[1].getResponse().trim()
  var payload = JSON.stringify({
    'ref': 'master',
    'inputs': {'requestId': requestId, 'puzzle': JSON.stringify(puzzle)},
  })
  console.info('Payload', payload)
  var headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/vnd.github+json',
    'Authorization': 'Bearer your_personal_access_token',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  var options = {
    'method': 'post',
    'payload': payload,
    'headers': headers,
  }
  var response = UrlFetchApp.fetch('https://api.github.com/repos/jbzdarkid/jbzdarkid.github.io/actions/workflows/67527847/dispatches', options);
  console.info('Response', response.getResponseCode(), response.getContentText())
}
