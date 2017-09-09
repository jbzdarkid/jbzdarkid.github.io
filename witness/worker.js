onmessage = function(div) {
  div.style.height = '100px'
  div.style.width = '100px'
  div.style.background = 'red'
  postMessage(div)
}