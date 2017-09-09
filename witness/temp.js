onmessage = function() {
  console.log('Recieved at worker')
  var N = 100000000
  for (var i=0; i<N; i++) {
    var j = i**i
  }
  postMessage(null)
}