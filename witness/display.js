function draw(puzzle, target='puzzle') {
  // console.log('Drawing', puzzle)
  var table = document.getElementById(target)
  while (table.rows.length > 0) {
    table.deleteRow(0)
  }
  table.setAttribute('json', JSON.stringify(puzzle))

  for (var x=0; x<puzzle.grid.length; x++) {
    var row = table.insertRow(x)
    for (var y=0; y<puzzle.grid[x].length; y++) {
      var cell = row.insertCell(y)
      // Basic cell types, flagging only certain elements as 'trace', as in 'traceable'
      if (x%2 == 0 && y%2 == 0) {
        cell.className = 'corner trace'
      } else if (x%2 == 0 && y%2 == 1) {
        cell.className = 'horiz trace'
      } else if (x%2 == 1 && y%2 == 0) {
        cell.className = 'verti trace'
      } else if (x%2 == 1 && y%2 == 1) {
        cell.className = 'center'
      }
      // If there's a solution present for the grid, draw it (poorly)
      if (puzzle.grid[x][y] == true) {
        cell.style.background = '#4F1A1A'
      }
      // Grid corners are rounded
      if (x == 0 && y == 0) {
        cell.style.borderTopLeftRadius = '11px'
      } else if (x == 0 && y == puzzle.grid[x].length-1) {
        cell.style.borderTopRightRadius = '11px'
      } else if (x == puzzle.grid.length-1 && y == 0) {
        cell.style.borderBottomLeftRadius = '11px'
      } else if (x == puzzle.grid.length-1 && y == puzzle.grid[x].length-1) {
        cell.style.borderBottomRightRadius = '11px'
      }
      cell.align = 'center'
      cell.id = target+'_'+y+'_'+x

      if (x == puzzle.start.x && y == puzzle.start.y) {
        var div = document.createElement('div')
        div.align = 'center'
        cell.className = 'start trace'
        var div = document.createElement('div')
        div.style.position = 'absolute'
        div.style.width = '44px'
        div.style.height = '44px'
        div.style.top = '-11px'
        div.style.left = '-11px'
        div.style.borderRadius = '50px'
        div.className = 'corner'
        div.onclick = function() {trace(this)}
        cell.appendChild(div)
      } else if (puzzle.grid[x][y].type == 'square') {
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 50 50')
        var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('transform', 'translate(12.5, 12.5)')
        rect.setAttribute('height', '25px')
        rect.setAttribute('width', '25px')
        rect.setAttribute('rx', '5px')
        rect.setAttribute('ry', '5px')
        rect.setAttribute('fill', puzzle.grid[x][y].color)
        svg.appendChild(rect)
        cell.appendChild(svg)
      } else if (puzzle.grid[x][y].type == 'star') {
        // FIXME: Stars are actually canted in slightly
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 50 50')
        for (var rot of [0, 45]) {
          var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          rect.setAttribute('transform', 'translate(15, 15) rotate('+rot+', 10, 10)')
          rect.setAttribute('height', '20px')
          rect.setAttribute('width', '20px')
          rect.setAttribute('fill', puzzle.grid[x][y].color)
          svg.appendChild(rect)
        }
        cell.appendChild(svg)
      } else if (puzzle.grid[x][y].type == 'poly') {
        var bounds = {'xmin':0, 'xmax':0, 'ymin':0, 'ymax':0}
        for (var pos of POLYOMINOS[puzzle.grid[x][y].shape]) {
          bounds.xmin = Math.min(bounds.xmin, pos.x)
          bounds.xmax = Math.max(bounds.xmax, pos.x)
          bounds.ymin = Math.min(bounds.ymin, pos.y)
          bounds.ymax = Math.max(bounds.ymax, pos.y)
        }
        var xoffset = 20 - 3.5 * (bounds.xmax + bounds.xmin)
        var yoffset = 20 - 3.5 * (bounds.ymax + bounds.ymin)

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 50 50')
        for (var pos of POLYOMINOS[puzzle.grid[x][y].shape]) {
          var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
          rect.setAttribute('transform', 'translate('+(yoffset+pos.y*7)+', '+(xoffset+pos.x*7)+')')
          rect.setAttribute('height', '11px')
          rect.setAttribute('width', '11px')
          rect.setAttribute('fill', puzzle.grid[x][y].color)
          svg.appendChild(rect)
        }
        cell.appendChild(svg)
      } else if (puzzle.grid[x][y].type == 'ylop') {
        var bounds = {'xmin':0, 'xmax':0, 'ymin':0, 'ymax':0}
        for (var pos of POLYOMINOS[puzzle.grid[x][y].shape]) {
          bounds.xmin = Math.min(bounds.xmin, pos.x)
          bounds.xmax = Math.max(bounds.xmax, pos.x)
          bounds.ymin = Math.min(bounds.ymin, pos.y)
          bounds.ymax = Math.max(bounds.ymax, pos.y)
        }
        var xoffset = 19 - 3.5 * (bounds.xmax + bounds.xmin)
        var yoffset = 19 - 3.5 * (bounds.ymax + bounds.ymin)

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 50 50')
        for (var pos of POLYOMINOS[puzzle.grid[x][y].shape]) {
          var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
          rect.setAttribute('transform', 'translate('+(yoffset+pos.y*7)+', '+(xoffset+pos.x*7)+')')
          rect.setAttribute('height', '12px')
          rect.setAttribute('width', '12px')
          rect.setAttribute('fill', puzzle.grid[x][y].color)
          svg.appendChild(rect)
          var rect2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
          rect2.setAttribute('transform', 'translate('+(yoffset+pos.y*7+3)+', '+(xoffset+pos.x*7+3)+')')
          rect2.setAttribute('height', '6px')
          rect2.setAttribute('width', '6px')
          rect2.setAttribute('fill', 'black')
          svg.appendChild(rect2)
        }
        cell.appendChild(svg)
      } else if (puzzle.grid[x][y].type == 'nega') {
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 50 50')
        for (var rot of [60, 180, 300]) {
          var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
          rect.setAttribute('transform', 'translate(22, 27) rotate('+rot+', 3, 0)')
          rect.setAttribute('height', '12px')
          rect.setAttribute('width', '6px')
          rect.setAttribute('fill', puzzle.grid[x][y].color)
          svg.appendChild(rect)
        }
        cell.appendChild(svg)
      }
    }
  }
  
  // puzzle.end is correct (new syntax), but table references are reversed x <-> y
  document.getElementById(target+'_'+puzzle.end.y+'_'+puzzle.end.x).style.borderRadius = '0px'
  if (puzzle.end.y == 0) {
    for (var x=0; x<puzzle.grid.length; x++) {
      var cell = table.rows[x].insertCell(0)
      if (x == puzzle.end.x) {
        cell.className = 'end_left trace'
        cell.id = target+'_'+(puzzle.end.y-1)+'_'+puzzle.end.x
      }
    }
  } else if (puzzle.end.y == puzzle.grid[puzzle.end.x].length-1) {
    for (var x=0; x<puzzle.grid.length; x++) {
      var cell = table.rows[x].insertCell(-1)
      if (x == puzzle.end.x) {
        cell.className = 'end_right trace'
        cell.id = target+'_'+(puzzle.end.y+1)+'_'+puzzle.end.x
      }
    }
  } else if (puzzle.end.x == 0) {
    var row = table.insertRow(0)
    for (var x=0; x<puzzle.grid[puzzle.end.x].length; x++) {
      var cell = row.insertCell(x)
      if (x == puzzle.end.y) {
        cell.className = 'end_up trace'
        cell.id =  target+'_'+puzzle.end.y+'_'+(puzzle.end.x-1)
      }
    }
  } else if (puzzle.end.x == puzzle.grid.length-1) {
    var row = table.insertRow(-1)
    for (var x=0; x<puzzle.grid[puzzle.end.x].length; x++) {
      var cell = row.insertCell(x)
      if (x == puzzle.end.y) {
        cell.className = 'end_down trace'
        cell.id =  target+'_'+puzzle.end.y+'_'+(puzzle.end.x+1)
      }
    }
  }

  for (var dot of puzzle.dots) {
    var cell = document.getElementById(target+'_'+dot.y+'_'+dot.x)
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    var width = parseInt(window.getComputedStyle(cell).width)
    var height = parseInt(window.getComputedStyle(cell).height)
    svg.setAttribute('viewBox', '0 0 '+width+' '+height)
    var hex = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    hex.setAttribute('points', '5.2 9, 10.4 0, 5.2 -9, -5.2 -9, -10.4 0, -5.2 9')
    hex.setAttribute('transform', 'translate('+width/2+', '+height/2+')')
    hex.setAttribute('fill', 'black')
    svg.appendChild(hex)
    cell.appendChild(svg)
  }
  for (var gap of puzzle.gaps) {
    var cell = document.getElementById(target+'_'+gap.y+'_'+gap.x)
    cell.className = 'break '+cell.className
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    var width = parseInt(window.getComputedStyle(cell).width)
    var height = parseInt(window.getComputedStyle(cell).height)
    svg.setAttribute('viewBox', '0 0 '+width+' '+height)
    var poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    poly.setAttribute('points', '-7 -11, -7 11, 7 11, 7 -11')
    var transform = 'translate('+(width/2)+', '+(height/2)+')'
    if (gap.x%2 == 1) {
      transform += ' rotate(90, 0, 0)'
    }
    poly.setAttribute('transform', transform)
    poly.setAttribute('fill', '#1F1313')
    svg.appendChild(poly)
    cell.appendChild(svg)
  }
}