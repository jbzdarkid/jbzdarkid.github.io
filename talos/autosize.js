// Auto-size images to fit to screen width
function resize(document) {
  var width = document.body.clientWidth/5-20;
  console.log('Computed img width:', width);
  var img_tags = document.getElementsByTagName('img')
  for (var i=0; i<img_tags.length; i++) {
    img_tags[i].width = width;
  }
}
window.onload = function() {resize(document)};
window.onresize = function() {resize(document)};
