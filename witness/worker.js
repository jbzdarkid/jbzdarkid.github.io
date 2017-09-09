onmessage = function(e) {
  console.log('Message received from main script');
  var div = document.createElement('div')
  div.style.height = '100px'
  div.style.width = '100px'
  div.style.background = 'red'
  console.log('Posting message back to main script');
  postMessage(div)
}