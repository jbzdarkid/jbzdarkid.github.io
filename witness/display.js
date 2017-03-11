function draw(puzzle, target='puzzle') {
  var table = document.getElementById(target)
  while (table.rows.length > 0) {
    table.deleteRow(0)
  }

  for (var x=0; x<puzzle.grid.length; x++) {
    var row = table.insertRow(x)
    for (var y=0; y<puzzle.grid[x].length; y++) {
      var cell = row.insertCell(y)
      cell.height = x%2 == 0 ? 22 : 50
      cell.width  = y%2 == 0 ? 22 : 50
      if (x%2 == 1 && y%2 == 1) {
        cell.style.background = '#000000'
      } else {
        cell.style.background = '#404040'
      }
      if (x == 0 && y == 0) {
        cell.style.borderTopLeftRadius = '10px'
      } else if (x == 0 && y == puzzle.grid[x].length-1) {
        cell.style.borderTopRightRadius = '10px'
      } else if (x == puzzle.grid.length-1 && y == 0) {
        cell.style.borderBottomLeftRadius = '10px'
      } else if (x == puzzle.grid.length-1 && y == puzzle.grid[x].length-1) {
        cell.style.borderBottomRightRadius = '10px'
      }
      cell.align = 'center'
      cell.id = target+'_'+x+'_'+y

      var div = document.createElement('div')
      div.align = 'center'
      if (puzzle.grid[x][y] > 0) {
        div.className = 'line'
        if (puzzle.grid[x][y] == 2) {
          if (x > 0 && puzzle.grid[x-1][y] == 1) {
            if (y > 0 && puzzle.grid[x][y-1] == 1) {
              div.style.borderBottomRightRadius = '10px'
            }
            if (y < puzzle.grid[x].length-1 && puzzle.grid[x][y+1] == 1) {
              div.style.borderBottomLeftRadius = '10px'
            }
          }
          if (x < puzzle.grid.length-1 && puzzle.grid[x+1][y] == 1) {
            if (y > 0 && puzzle.grid[x][y-1] == 1) {
              div.style.borderTopRightRadius = '10px'
            }
            if (y < puzzle.grid[x].length-1 && puzzle.grid[x][y+1] == 1) {
              div.style.borderTopLeftRadius = '10px'
            }
          }
        }
      }
      if (x == puzzle.start.x && y == puzzle.start.y) {
        div.className = 'start line'
        div.onclick = function() {trace(this)}
      } else if (x == puzzle.end.x && y == puzzle.end.y) {
        if (y == 0) {
          div.className = 'end end-left line'
          if (x > 0 && puzzle.grid[x-1][y] == 1) {
            div.style.borderBottomRightRadius = '20px'
          } else if (x < puzzle.grid.length-1 && puzzle.grid[x+1][y] == 1) {
            div.style.borderTopRightRadius = '20px'
          }
        } else if (y == puzzle.grid[x].length-1) {
          div.className = 'end end-right line'
          if (x > 0 && puzzle.grid[x-1][y] == 1) {
            div.style.borderBottomLeftRadius = '20px'
          } else if (x < puzzle.grid.length-1 && puzzle.grid[x+1][y] == 1) {
            div.style.borderTopLeftRadius = '20px'
          }
        } else if (x == 0) {
          div.className = 'end end-top line'
          if (y > 0 && puzzle.grid[x][y-1] == 1) {
            div.style.borderBottomRightRadius = '20px'
          } else if (y < puzzle.grid[x].length-1 && puzzle.grid[x][y+1] == 1) {
            div.style.borderBottomLeftRadius = '20px'
          }
        } else if (x == puzzle.grid.length-1) {
          div.className = 'end end-bottom line'
          if (y > 0 && puzzle.grid[x][y-1] == 1) {
            div.style.borderTopRightRadius = '20px'
          } else if (y < puzzle.grid[x].length-1 && puzzle.grid[x][y+1] == 1) {
            div.style.borderTopLeftRadius = '20px'
          }
        }
      } else if (puzzle.grid[x][y].type == 'square') {
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 50 50')
        var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('transform', 'translate(12.5, 12.5)')
        rect.style.height = '25px'
        rect.style.width = '25px'
        rect.style.rx = '5px'
        rect.style.fill = puzzle.grid[x][y].color
        svg.appendChild(rect)
        div.appendChild(svg)
      } else if (puzzle.grid[x][y].type == 'star') {
        // FIXME: Stars are actually canted in slightly
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 50 50')
        for (var rot of [0, 45]) {
          var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          rect.setAttribute('transform', 'translate(15, 15) rotate('+rot+', 10, 10)')
          rect.style.height = '20px'
          rect.style.width = '20px'
          rect.style.fill = puzzle.grid[x][y].color
          svg.appendChild(rect)
        }
        div.appendChild(svg)
      } else if (puzzle.grid[x][y].type == 'poly') {
        var bounds = {'xmin':0, 'xmax':0, 'ymin':0, 'ymax':0}
        for (var pos of POLY_DICT[puzzle.grid[x][y].shape]) {
          bounds.xmin = Math.min(bounds.xmin, pos.x)
          bounds.xmax = Math.max(bounds.xmax, pos.x)
          bounds.ymin = Math.min(bounds.ymin, pos.y)
          bounds.ymax = Math.max(bounds.ymax, pos.y)
        }
        var xoffset = 20 - 3.5 * (bounds.xmax + bounds.xmin)
        var yoffset = 20 - 3.5 * (bounds.ymax + bounds.ymin)

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 50 50')
        for (var pos of POLY_DICT[puzzle.grid[x][y].shape]) {
          var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
          rect.setAttribute('transform', 'translate('+(yoffset+pos.y*7)+', '+(xoffset+pos.x*7)+')')
          rect.style.height = '10px'
          rect.style.width = '10px'
          rect.style.fill = puzzle.grid[x][y].color
          svg.appendChild(rect)
        }
        div.appendChild(svg)
      } else if (puzzle.grid[x][y].type == 'nega') {
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 50 50')
        for (var rot of [60, 180, 300]) {
          var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
          rect.setAttribute('transform', 'translate(22, 27) rotate('+rot+', 3, 0)')
          rect.style.height = '12px'
          rect.style.width = '6px'
          rect.style.fill = puzzle.grid[x][y].color
          svg.appendChild(rect)
        }
        div.appendChild(svg)
      }
      cell.appendChild(div)
    }
  }
  for (var dot of puzzle.dots) {
    var cell = document.getElementById(target+'_'+dot.x+'_'+dot.y)
    var div = cell.childNodes[0]

    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 50 50')
    svg.style.width = '20px'
    svg.style.height = '20px'
    var hex = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    hex.setAttribute('points', '11 19, 22 0, 11 -19, -11 -19, -22 0, -11 19')
    // hex.setAttribute('points', '11 19, 22 0, 11 -19, -11 -19, -22 0, -11 19')
    hex.setAttribute('transform', 'translate(25, 25)')
    hex.style.color = 'black'
    svg.appendChild(hex)
    div.appendChild(svg)
    // div.innerHTML = '\u2b22'
    // div.style.fontSize = '16px'
  }
}