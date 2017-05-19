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
    var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('transform', 'translate(' + (center_y+pos.y*offset) + ', ' + (center_x+pos.x*offset) + ')')
    rect.setAttribute('height', size)
    rect.setAttribute('width', size)
    rect.setAttribute('fill', elem.color)
    svg.appendChild(rect)
    var rect2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    var transform = 'translate('+(center_y+pos.y*offset+size/4)+', '+(center_x+pos.x*offset+size/4)+')'
    if (elem.rot == 'all') {
      // -30 degree rotation around (29, 29), the midpoint of the square
      transform = 'rotate(-30, 29, 29) '+transform
    }
    rect2.setAttribute('transform', transform)
    rect2.setAttribute('height', size/2)
    rect2.setAttribute('width', size/2)
    rect2.setAttribute('fill', 'black')
    svg.appendChild(rect2)
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

// FIXME: Exact sizing
function _tri(elem) {
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 50 50')
  var poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
  poly.setAttribute('points', '0 0, -10 20, 10 20')
  poly.setAttribute('transform', 'translate(25, 15)')
  poly.setAttribute('fill', elem.color)
  svg.appendChild(poly)
  return svg
}

function draw(puzzle, target='puzzle') {
  // console.log('Drawing', puzzle)
  var table = document.getElementById(target)
  while (table.rows.length > 0) {
    table.deleteRow(0)
  }
  table.setAttribute('json', JSON.stringify(puzzle)) // Used to validate a traced solution later

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
        cell.style.borderTopLeftRadius = '12px'
      } else if (x == 0 && y == puzzle.grid[x].length-1) {
        cell.style.borderTopRightRadius = '12px'
      } else if (x == puzzle.grid.length-1 && y == 0) {
        cell.style.borderBottomLeftRadius = '12px'
      } else if (x == puzzle.grid.length-1 && y == puzzle.grid[x].length-1) {
        cell.style.borderBottomRightRadius = '12px'
      }
      cell.id = target+'_'+x+'_'+y

      if (x == puzzle.start.x && y == puzzle.start.y) {
        var div = document.createElement('div')
        div.onclick = function() {trace(this)}
        div.id = cell.id
        div.className = 'start trace'
        cell.style.position = 'relative'
        cell.removeAttribute('class')
        cell.id += '_parent'
        cell.appendChild(div)
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
      } else if (puzzle.grid[x][y].type == 'tri') {
        cell.appendChild(_tri(puzzle.grid[x][y]))
      }
    }
  }

  // FIXME: puzzle.end is correct (new syntax), but table references are reversed x/y
  table.rows[puzzle.end.x].cells[puzzle.end.y].style.borderRadius = '0px'
  if (puzzle.end.y == 0) {
    for (var x=0; x<puzzle.grid.length; x++) {
      var cell = table.rows[x].insertCell(0)
      if (x == puzzle.end.x) {
        cell.className = 'end_left trace'
        cell.id = target+'_'+puzzle.end.x+'_'+(puzzle.end.y-1)
        cell.style.background = table.rows[puzzle.end.x].cells[puzzle.end.y+1].style.background
      }
    }
  } else if (puzzle.end.y == puzzle.grid[puzzle.end.x].length-1) {
    for (var x=0; x<puzzle.grid.length; x++) {
      var cell = table.rows[x].insertCell(-1)
      if (x == puzzle.end.x) {
        cell.className = 'end_right trace'
        cell.id = target+'_'+puzzle.end.x+'_'+(puzzle.end.y+1)
        cell.style.background = table.rows[puzzle.end.x].cells[puzzle.end.y].style.background
      }
    }
  } else if (puzzle.end.x == 0) {
    var row = table.insertRow(0)
    for (var x=0; x<puzzle.grid[puzzle.end.x].length; x++) {
      var cell = row.insertCell(x)
      if (x == puzzle.end.y) {
        cell.className = 'end_up trace'
        cell.id =  target+'_'+(puzzle.end.x-1)+'_'+puzzle.end.y
        cell.style.background = table.rows[puzzle.end.x+1].cells[puzzle.end.y].style.background
      }
    }
  } else if (puzzle.end.x == puzzle.grid.length-1) {
    var row = table.insertRow(-1)
    for (var x=0; x<puzzle.grid[puzzle.end.x].length; x++) {
      var cell = row.insertCell(x)
      if (x == puzzle.end.y) {
        cell.className = 'end_down trace'
        cell.id =  target+'_'+(puzzle.end.x+1)+'_'+puzzle.end.y
        cell.style.background = table.rows[puzzle.end.x].cells[puzzle.end.y].style.background
      }
    }
  }

  for (var dot of puzzle.dots) {
    var cell = document.getElementById(target+'_'+dot.y+'_'+dot.x)
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
    cell.className = 'gap '+cell.className
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    var width = parseInt(window.getComputedStyle(cell).width)
    var height = parseInt(window.getComputedStyle(cell).height)
    svg.setAttribute('viewBox', '0 0 '+width+' '+height)
    var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('width', 18)
    rect.setAttribute('height', 24)
    rect.setAttribute('fill', '#1F1313')
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