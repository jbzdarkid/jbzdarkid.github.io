function _square(elem) {
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 58 58')
  var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  rect.setAttribute('transform', 'translate(15, 15)')
  rect.setAttribute('height', 28)
  rect.setAttribute('width', 28)
  rect.setAttribute('rx', 7)
  rect.setAttribute('ry', 7)
  rect.setAttribute('fill', elem.color)
  svg.appendChild(rect)
  return svg
}

function _star(elem) {
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 58 58')
  var poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
  var points = [
    '0 0', // Top left
    '1 6.5',
    '-4.5 10.5',
    '1 14.5',
    '0 21', // Bottom left
    '6.5 20',
    '10.5 25.5',
    '14.5 20',
    '21 21', // Bottom right
    '20 14.5',
    '25.5 10.5',
    '20 6.5',
    '21 0', // Top right
    '14.5, 1',
    '10.5 -4.5',
    '6.5 1',
  ]
  poly.setAttribute('points', points.join(', '))
  poly.setAttribute('fill', elem.color)
  poly.setAttribute('transform', 'translate(18.5, 18.5)')
  svg.appendChild(poly)
  return svg
}

function _poly(elem) {
  var size = 10 // Side length of individual squares in the polyomino
  var space = 4 // Gap between squares in the polyomino
  // Select the first (potentially only) rotation of the element.
  var polyomino = getPolyomino(elem.size, elem.shape, elem.rot)[0]

  var bounds = {'xmin':0, 'xmax':0, 'ymin':0, 'ymax':0}
  for (var pos of polyomino) {
    bounds.xmin = Math.min(bounds.xmin, pos.x)
    bounds.xmax = Math.max(bounds.xmax, pos.x)
    bounds.ymin = Math.min(bounds.ymin, pos.y)
    bounds.ymax = Math.max(bounds.ymax, pos.y)
  }
  var offset = (size+space)/2 // Offset between elements to create the gap
  var center_x = (58 - size - offset * (bounds.xmax + bounds.xmin)) / 2
  var center_y = (58 - size - offset * (bounds.ymax + bounds.ymin)) / 2

  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 58 58')
  for (var pos of polyomino) {
    var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    var transform = 'translate('+(center_y+pos.y*offset)+', '+(center_x+pos.x*offset)+')'
    if (elem.rot == 'all') {
      // -30 degree rotation around (29, 29), the midpoint of the square
      transform = 'rotate(-30, 29, 29) '+transform
    }
    rect.setAttribute('transform', transform)
    rect.setAttribute('height', size)
    rect.setAttribute('width', size)
    rect.setAttribute('fill', elem.color)
    svg.appendChild(rect)
  }
  return svg
}

function _ylop(elem) {
  var size = 12 // Side length of individual squares in the polyomino
  var space = 2 // Gap between squares in the polyomino
  // Select the first (potentially only) rotation of the element.
  var polyomino = getPolyomino(elem.size, elem.shape, elem.rot)[0]

  var bounds = {'xmin':0, 'xmax':0, 'ymin':0, 'ymax':0}
  for (var pos of polyomino) {
    bounds.xmin = Math.min(bounds.xmin, pos.x)
    bounds.xmax = Math.max(bounds.xmax, pos.x)
    bounds.ymin = Math.min(bounds.ymin, pos.y)
    bounds.ymax = Math.max(bounds.ymax, pos.y)
  }
  var offset = (size+space)/2 // Offset between elements to create the gap
  var center_x = (58 - size - offset * (bounds.xmax + bounds.xmin)) / 2
  var center_y = (58 - size - offset * (bounds.ymax + bounds.ymin)) / 2

  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 58 58')
  for (var pos of polyomino) {
    var poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
    var points = [
      '0 0', '12 0', '12 12', '0 12', '0 3',
      '3 3', '3 9', '9 9', '9 3', '0 3',
    ]
    poly.setAttribute('points', points.join(', '))
    var transform = 'translate('+(center_y+pos.y*offset)+', '+(center_x+pos.x*offset)+')'
    if (elem.rot == 'all') {
      // -30 degree rotation around (29, 29), the midpoint of the square
      transform = 'rotate(-30, 29, 29) '+transform
    }
    poly.setAttribute('transform', transform)
    poly.setAttribute('fill', elem.color)
    svg.appendChild(poly)
  }
  return svg
}

// FIXME: Exact sizing
function _nega(elem) {
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 50 50')
  for (var rot of [60, 180, 300]) {
    var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('transform', 'translate(22, 27) rotate('+rot+', 3, 0)')
    rect.setAttribute('height', 12)
    rect.setAttribute('width', 6)
    rect.setAttribute('fill', elem.color)
    svg.appendChild(rect)
  }
  return svg
}

// FIXME: Sizing looks wrong?
function _triangle(elem) {
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 58 58')
  for (var i=0; i<elem.count; i++) {
    var poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
    poly.setAttribute('points', '0 0, -8 14, 8 14')
    var y_offset = (58 - 22*(elem.count - 1)) / 2 + 22*i
    poly.setAttribute('transform', 'translate('+y_offset+', 22)')
    poly.setAttribute('fill', elem.color)
    svg.appendChild(poly)
  }
  return svg
}

function draw(puzzle, target='puzzle') {
  console.log('Drawing', puzzle, 'into', target)
  var table = document.getElementById(target)
  while (table.rows.length > 0) {
    table.deleteRow(0)
  }
  table.setAttribute('cellspacing', '0px')
  table.setAttribute('cellpadding', '0px')
  table.style.padding = 25
  table.style.background = BACKGROUND
  table.style.border = BORDER

  for (var x=0; x<puzzle.grid.length; x++) {
    var row = table.insertRow(x)
    for (var y=0; y<puzzle.grid[x].length; y++) {
      var cell = row.insertCell(y)
      // Basic cell types, flagging only certain elements as 'trace', as in 'traceable'
      if (x%2 == 0 && y%2 == 0) {
        cell.className = 'corner trace'
        cell.setAttribute('height', 24)
        cell.setAttribute('width', 24)
        cell.style.background = FOREGROUND
      } else if (x%2 == 0 && y%2 == 1) {
        cell.className = 'horiz trace'
        cell.setAttribute('height', 24)
        cell.setAttribute('width', 58)
        cell.style.background = FOREGROUND
      } else if (x%2 == 1 && y%2 == 0) {
        cell.className = 'verti trace'
        cell.setAttribute('height', 58)
        cell.setAttribute('width', 24)
        cell.style.background = FOREGROUND
      } else if (x%2 == 1 && y%2 == 1) {
        cell.className = 'center'
        cell.setAttribute('height', 58)
        cell.setAttribute('width', 58)
        cell.style.background = BACKGROUND
      }
      // If there's a solution present for the grid, draw it (poorly)
      if (puzzle.grid[x][y] == true) {
        cell.style.background = LINE_SUCCESS
      }
      // Grid corners are rounded on non-pillar puzzles
      if (!puzzle.pillar) {
        if (x == 0 && y == 0) {
          cell.style.borderTopLeftRadius = '12px'
        } else if (x == 0 && y == puzzle.grid[x].length-1) {
          cell.style.borderTopRightRadius = '12px'
        } else if (x == puzzle.grid.length-1 && y == 0) {
          cell.style.borderBottomLeftRadius = '12px'
        } else if (x == puzzle.grid.length-1 && y == puzzle.grid[x].length-1) {
          cell.style.borderBottomRightRadius = '12px'
        }
      }
      cell.id = target+'_'+x+'_'+y

      if (x == puzzle.start.x && y == puzzle.start.y) {
        var div = document.createElement('div')
        // Resize, round, and color
        div.style.height = 48
        div.style.width = 48
        div.style.borderRadius = '50%'
        var start_color = FOREGROUND
        if (puzzle.grid[x][y] == true) {
          start_color = LINE_SUCCESS
        }
        div.style.background = start_color
        // Shift into place
        div.style.top = -12
        div.style.left = -12
        div.style.position = 'absolute' // Prevents resizing the rest of the table
        // div.className = 'start trace'
        div.className = 'selected_start trace' // Named for the animation
        div.id = cell.id // Rename the div and cell so that tracing happens on the div
        cell.id += '_parent'

        cell.style.position = 'relative' // Positions div relative to this cell
        cell.appendChild(div)
        cell.onclick = function() {trace(this, puzzle)}
      } else if (puzzle.grid[x][y].type == 'square') {
        cell.appendChild(_square(puzzle.grid[x][y]))
      } else if (puzzle.grid[x][y].type == 'star') {
        cell.appendChild(_star(puzzle.grid[x][y]))
      } else if (puzzle.grid[x][y].type == 'poly') {
        cell.appendChild(_poly(puzzle.grid[x][y]))
      } else if (puzzle.grid[x][y].type == 'ylop') {
        cell.appendChild(_ylop(puzzle.grid[x][y]))
      } else if (puzzle.grid[x][y].type == 'nega') {
        cell.appendChild(_nega(puzzle.grid[x][y]))
      } else if (puzzle.grid[x][y].type == 'triangle') {
        cell.appendChild(_triangle(puzzle.grid[x][y]))
      }
    }
  }

  // FIXME: puzzle.end is correct (new syntax), but table references are reversed x/y
  table.rows[puzzle.end.x].cells[puzzle.end.y].style.borderRadius = '0px'
  var end_color = FOREGROUND
  if (puzzle.grid[puzzle.end.x][puzzle.end.y]) {
    end_color = LINE_SUCCESS
  }
  if (puzzle.end.y == 0) {
    for (var x=0; x<puzzle.grid.length; x++) {
      var cell = table.rows[x].insertCell(0)
      if (x == puzzle.end.x) {
        cell.className = 'end_left trace'
        cell.style.borderTopLeftRadius = '12px'
        cell.style.borderBottomLeftRadius = '12px'
        cell.style.position = 'relative'
        cell.style.height = 24
        cell.style.width = 24
        cell.id = target+'_'+puzzle.end.x+'_'+(puzzle.end.y-1)
        cell.style.background = end_color
        table.style.paddingLeft = '10px'
      }
    }
  } else if (puzzle.end.y == puzzle.grid[puzzle.end.x].length-1) {
    for (var x=0; x<puzzle.grid.length; x++) {
      var cell = table.rows[x].insertCell(-1)
      if (x == puzzle.end.x) {
        cell.className = 'end_right trace'
        cell.style.borderTopRightRadius = '12px'
        cell.style.borderBottomRightRadius = '12px'
        cell.style.position = 'relative'
        cell.style.height = 24
        cell.style.width = 24
        cell.id = target+'_'+puzzle.end.x+'_'+(puzzle.end.y+1)
        cell.style.background = end_color
        table.style.paddingRight = '10px'
      }
    }
  } else if (puzzle.end.x == 0) {
    var row = table.insertRow(0)
    for (var x=0; x<puzzle.grid[puzzle.end.x].length; x++) {
      var cell = row.insertCell(x)
      if (x == puzzle.end.y) {
        cell.className = 'end_up trace'
        cell.style.borderTopLeftRadius = '12px'
        cell.style.borderTopRightRadius = '12px'
        cell.style.position = 'relative'
        cell.style.height = 24
        cell.style.width = 24
        cell.id = target+'_'+(puzzle.end.x-1)+'_'+puzzle.end.y
        cell.style.background = end_color
        table.style.paddingTop = '10px'
      }
    }
  } else if (puzzle.end.x == puzzle.grid.length-1) {
    var row = table.insertRow(-1)
    for (var x=0; x<puzzle.grid[puzzle.end.x].length; x++) {
      var cell = row.insertCell(x)
      if (x == puzzle.end.y) {
        cell.className = 'end_down trace'
        cell.style.borderBottomLeftRadius = '12px'
        cell.style.borderBottomRightRadius = '12px'
        cell.style.position = 'relative'
        cell.style.height = 24
        cell.style.width = 24
        cell.id = target+'_'+(puzzle.end.x+1)+'_'+puzzle.end.y
        cell.style.background = end_color
        table.style.paddingBottom = '10px'
      }
    }
  }

  for (var dot of puzzle.dots) {
    var cell = document.getElementById(target+'_'+dot.x+'_'+dot.y)
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    var width = parseInt(window.getComputedStyle(cell).width)
    var height = parseInt(window.getComputedStyle(cell).height)
    svg.setAttribute('viewBox', '0 0 '+width+' '+height)
    var hex = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
    hex.setAttribute('points', '5.2 9, 10.4 0, 5.2 -9, -5.2 -9, -10.4 0, -5.2 9')
    hex.setAttribute('transform', 'translate('+width/2+', '+height/2+')')
    hex.setAttribute('fill', 'black')
    svg.appendChild(hex)
    cell.appendChild(svg)
  }
  for (var gap of puzzle.gaps) {
    var cell = document.getElementById(target+'_'+gap.x+'_'+gap.y)
    if (cell.className.startsWith('gap')) continue
    cell.className = 'gap '+cell.className
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    var width = parseInt(window.getComputedStyle(cell).width)
    var height = parseInt(window.getComputedStyle(cell).height)
    svg.setAttribute('viewBox', '0 0 '+width+' '+height)
    var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('width', 18)
    rect.setAttribute('height', 24)
    rect.setAttribute('fill', BACKGROUND)
    var transform = 'translate('+(width-18)/2+', '+(height-24)/2+')'
    if (gap.x%2 == 1) {
      // 9, 12 being the center of the rectangle
      transform += ' rotate(90, 9, 12)'
    }
    rect.setAttribute('transform', transform)
    svg.appendChild(rect)
    cell.appendChild(svg)
  }
}
