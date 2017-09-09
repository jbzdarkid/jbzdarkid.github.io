function onmessage(e) {
  var div = document.createElement('div')
  div.style.height = '100px'
  div.style.width = '100px'
  div.style.background = 'red'
  console.log(div)
  document.body.appendChild(div)
  postMessage(div)
}