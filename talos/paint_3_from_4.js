function showRows() {
  var row_tags = document.getElementsByTagName('tr')
  for (i = 0; i < row_tags.length; i++) {
    row_tags[i].style.opacity = 1; // Visible
  }
}

function hideRows(row_names) {
  for (i=0; i<row_names.length; i++) {
    var row = document.getElementById(row_names.charAt(i));
    row.style.opacity = 0.3; // Mostly not visible
  }
}