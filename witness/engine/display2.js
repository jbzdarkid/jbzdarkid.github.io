function draw(puzzle, target='puzzle') {
  console.log('Drawing', puzzle, 'into', target)
  if (puzzle == undefined) return
  var svg = document.getElementById(target)
  svg.setAttribute('viewbox', '0 0 1000 1000')
  svg.style.width = '100%'
  svg.style.height = '100%'
  while (svg.firstChild) svg.removeElement(firstChild)
  for (var x=0; x<puzzle.grid.length; x++) {
    for (var y=0; y<puzzle.grid[x].length; y++) {
      var line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      line.setAttribute('stroke-width', 24)
      line.setAttribute('stroke-linecap', 'round')
      line.setAttribute('stroke', FOREGROUND)
      if (y%2 == 0 && x%2 == 1) { // Horizontal
        line.setAttribute('x1', (x-1)*41 + 12)
        line.setAttribute('y1', y*41 + 12)
        line.setAttribute('x2', (x+1)*41 + 12)
        line.setAttribute('y2', y*41 + 12)
        svg.appendChild(line)
      } else if (y%2 == 1 && x%2 == 0) { // Vertical
        line.setAttribute('x1', x*41 + 12)
        line.setAttribute('y1', (y-1)*41 + 12)
        line.setAttribute('x2', x*41 + 12)
        line.setAttribute('y2', (y+1)*41 + 12)
        svg.appendChild(line)
      } else if (y%2 == 1 && x%2 == 1) {
        drawSymbolWithSvg(svg, {
          'type':'square',
          'color':'red',
          'width':58,
          'height':58,
          'x':x*41 - 29 + 12,
          'y':y*41 - 29 + 12,
        })
      }
    }
  }
  
  /*
  for (var x=0; x<puzzle.grid.length; x+=2) {
    for (var y=0; y<puzzle.grid[x].length; y+=2) {
      var hline = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      svg.appendChild(hline)
      hline.setAttribute('stroke-width', 24)
      hline.setAttribute('stroke', 'black')
      hline.setAttribute('stroke-linecap', 'round')
      hline.setAttribute('x1', x*41 + 12)
      hline.setAttribute('y1', y*41 + 12)
      hline.setAttribute('x2', x*41 + 12)
      hline.setAttribute('y2', (y+2)*41 + 12)
      
      var vline = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      svg.appendChild(vline)
      vline.setAttribute('stroke-width', 24)
      vline.setAttribute('stroke', 'black')
      vline.setAttribute('stroke-linecap', 'round')
      vline.setAttribute('x1', x*41 + 12)
      vline.setAttribute('y1', y*41 + 12)
      vline.setAttribute('x2', (x+2)*41 + 12)
      vline.setAttribute('y2', y*41 + 12)
    }
  }
  */
}
