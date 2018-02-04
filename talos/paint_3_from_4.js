function updateRows(paint4) {
  var rows = ["A", "B", "C", "D", "E", "F", "G", "E", "H", "I"]
  for (i = 0; i < rows.length; i++) {
    document.getElementById(rows[i]).style.opacity = 1;
  }
  if (paint4 == null || paint4 < 0 || paint4 > 4) return;
  rows = [["B", "C", "D", "F", "G", "H"],
          ["C", "D", "H"],
          ["A", "E", "I"],
          ["B", "F", "G"],
          ["B", "C", "D", "F", "G", "H"]][paint4];
  for (i = 0; i < rows.length; i++) {
    document.getElementById(rows[i]).style.opacity = 0.5;
  }
}