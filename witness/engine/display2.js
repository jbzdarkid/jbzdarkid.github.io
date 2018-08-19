function draw(puzzle, target='puzzle') {
  console.log('Drawing', puzzle, 'into', target)
  if (puzzle == undefined) return
  var svg = document.getElementById(target)
  svg.setAttribute('viewbox', '0 0 1000 1000')
  svg.style.width = '100%'
  svg.style.height = '100%'
  while (svg.firstChild) svg.removeElement(firstChild)

  var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  svg.appendChild(rect)
  rect.setAttribute('stroke-width', 10)
  rect.setAttribute('stroke', 'black')
  rect.setAttribute('fill', BACKGROUND)
  // Accounting for the border thickness
  rect.setAttribute('x', 5)
  rect.setAttribute('y', 5)
  // 41*(width-1) + 24 (extra edge) + 25*2 (padding) + 10*2 (border)
  rect.setAttribute('width', 41*puzzle.grid.length + 53)
  rect.setAttribute('height', 41*puzzle.grid[0].length + 53)
  
  for (var x=0; x<puzzle.grid.length; x++) {
    for (var y=0; y<puzzle.grid[x].length; y++) {
      var line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      line.setAttribute('stroke-width', 24)
      line.setAttribute('stroke-linecap', 'round')
      line.setAttribute('stroke', FOREGROUND)
      if (y%2 == 0 && x%2 == 1) { // Horizontal
        line.setAttribute('x1', x*41 + 11)
        line.setAttribute('y1', y*41 + 52)
        line.setAttribute('x2', x*41 + 93)
        line.setAttribute('y2', y*41 + 52)
        svg.appendChild(line)
      } else if (y%2 == 1 && x%2 == 0) { // Vertical
        line.setAttribute('x1', x*41 + 52)
        line.setAttribute('y1', y*41 + 11)
        line.setAttribute('x2', x*41 + 52)
        line.setAttribute('y2', y*41 + 93)
        svg.appendChild(line)
      } else if (y%2 == 1 && x%2 == 1) {
        if (puzzle.grid[x][y]) {
          var params = JSON.parse(JSON.stringify(puzzle.grid[x][y]))
          params.width = 58
          params.height = 58
          params.x = x*41 + 23
          params.y = y*41 + 23
          drawSymbolWithSvg(svg, params)
        }
      }
    }
  }
  
  drawSymbolWithSvg(svg, {
    'type':'start',
    'width': 58,
    'height': 58,
    'x': puzzle.start.x*41 - 59,
    'y': puzzle.start.y*41 - 59,
  })

  var rot = 0
  if (puzzle.end.y == 0) rot = 0
  if (puzzle.end.y == puzzle.grid[puzzle.end.x].length - 1) rot = 2
  if (puzzle.end.x == 0) rot = 1
  if (puzzle.end.x == puzzle.grid.length - 1) rot = 3
  drawSymbolWithSvg(svg, {
    'type':'end',
    'width': 58,
    'height': 58,
    'rot': rot,
    'x': puzzle.end.x*41 + 23,
    'y': puzzle.end.y*41 + 23,
  })
}
