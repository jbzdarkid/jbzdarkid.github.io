var cursorSize = 12
var data

// FIXME: likely bad encapsulation
function getVisualCell(x, y) {
  if (y < 0) {
    if (data.puzzle.pillar) {
      y = (y % data.puzzle.grid[0].length) + data.puzzle.grid[0].length
    }
  }
  if (y >= data.puzzle.grid[0].length) {
    if (data.puzzle.pillar) {
      y = (y % data.puzzle.grid[0].length)
    }
  }
  return document.getElementById(data.table+'_'+x+'_'+y)
}

function trace(elem) {
  if (document.pointerLockElement == null) { // Started tracing a solution
    document.styleSheets[0].deleteRule(0)
    document.styleSheets[0].insertRule(".line {fill: #6D4D4A}", 0)
    var parent = elem.parentNode
    var width = parseInt(window.getComputedStyle(parent).width)
    var height = parseInt(window.getComputedStyle(parent).height)
    data = {
      'table':parent.id.split('_')[0],
      'x':parseInt(parent.id.split('_')[1]),
      'y':parseInt(parent.id.split('_')[2]),
      'subx':width/2,
      'suby':height/2,
    }

    var table = document.getElementById(data.table)
    data.puzzle = Puzzle.deserialize(table.getAttribute('json'))

    // These aren't really arrays, they live update during iteration
    for (var cell of table.getElementsByTagName('td')) {
      // Remove leftover color from a previous trace
      cell.className = cell.className.split('-')[0]
      // Remove leftover color from a shown solution
      cell.style.removeProperty('background') 
    }
    var lines = table.getElementsByClassName('line')
    while (lines.length > 0) {
      lines[0].remove()
    }
    var circles = table.getElementsByClassName('cursor')
    while (circles.length > 0) {
      circles[0].remove()
    }
    // Redraw the start so the line appears. FIXME: Animation?
    _draw(elem, data.subx, data.suby)

    elem.requestPointerLock()
  } else { // Stopped tracing a solution
    var curr_elem = getVisualCell(data.x, data.y)
    if (curr_elem.className.includes('end')) {
      for (var x=0; x<data.puzzle.grid.length; x++) {
        for (var y=0; y<data.puzzle.grid[x].length; y++) {
          var elem = getVisualCell(x, y)
          if (elem != undefined && elem.className.includes('trace-')) {
            if (!elem.className.includes('end')) {
              data.puzzle.grid[x][y] = true
            }
          }
        }
      }

      document.styleSheets[0].deleteRule(0)
      if (isValid(data.puzzle)) {
        document.styleSheets[0].insertRule(".line {animation: 1s 1 forwards line-succ}", 0)
      } else {
        document.styleSheets[0].insertRule(".line {animation: 1s 1 forwards line-fail}", 0)
      }
    }
    document.exitPointerLock()
  }
}

document.addEventListener('pointerlockchange', lockChange, false)
document.addEventListener('mozpointerlockchange', lockChange, false)
function lockChange() {
  if (document.pointerLockElement == null && document.mozPointerLockElement == null) {
    console.log('Cursor release requested')
    document.removeEventListener("mousemove", onMouseMove, false)
  } else {
    console.log('Cursor lock requested')
    document.addEventListener("mousemove", onMouseMove, false)
  }
}

function onMouseMove(e) {
  var sens = document.getElementById('sens').value
  var dx = e.movementX
  var dy = e.movementY
  // Option 1: Raw
  data.subx += sens*dx
  data.suby += sens*dy
  // Option 2: Capped
  // data.subx += sens*Math.sign(dx)*Math.min(Math.abs(dx), 10)
  // data.suby += sens*Math.sign(dy)*Math.min(Math.abs(dy), 10)
  // Option 3: Quadratic
  // data.subx += sens*Math.sign(dx)*Math.sqrt(Math.abs(dx))
  // data.suby += sens*Math.sign(dy)*Math.sqrt(Math.abs(dy))
  // Option 4: Quadratic Capped
  // data.subx += sens*Math.sign(dx)*Math.sqrt(Math.min(Math.abs(dx), 10))
  // data.suby += sens*Math.sign(dy)*Math.sqrt(Math.min(Math.abs(dy), 10))
  var elem = getVisualCell(data.x, data.y)
  var next_elem = getVisualCell(data.x + Math.sign(dy), data.y + Math.sign(dx))
  var width = parseInt(window.getComputedStyle(elem).width)
  var height = parseInt(window.getComputedStyle(elem).height)

  // Limit motion via collision
  _collision(next_elem)

  // Redraw all elements near the cursor
  for (var x=-1; x<=1; x++) {
    for (var y=-1; y<=1; y++) {
      var temp_elem = getVisualCell(data.x + x, data.y + y)
      if (temp_elem == null) continue
      var temp_width = width
      var temp_height = height
      if (x == -1) {
        temp_height = parseInt(window.getComputedStyle(temp_elem).height)
      }
      if (y == -1) {
        temp_width = parseInt(window.getComputedStyle(temp_elem).width)
      }
      _draw(temp_elem, data.subx - y * temp_width, data.suby - x * temp_height)
    }
  }

  // Potentially move the cursor to a new cell
  _move(data, next_elem)
}

// FIXME: Huge code duplication. I've simplified so it's more obvious, but I
// should look into shared helper functions rather than merging if statements.
// Collision detection. If the cursor moves into an edge or into a cell,
// then its position is reset to be exactly touching the edge, and some
// of the excess movement is converted to the other direction.
// Corners are handled separately to prevent runover into cells
function _collision(next_elem) {
  var elem = getVisualCell(data.x, data.y)
  var width = parseInt(window.getComputedStyle(elem).width)
  var height = parseInt(window.getComputedStyle(elem).height)
  if (elem.className.includes('start')) {
    height /= 2
    width /= 2
  }
  var deltaMod = 3 // Fraction of movement to redirect in the other direction

  // Intersection collision
  // If next_elem is null, we're at an insersection but pushing against a wall,
  // so we fall through to wall collision.
  if ((elem.className.includes('corner') || elem.className.includes('start')) && next_elem != null) {
    var padding = 3 // "Smoothing" pixels where the cursor can slide
    if (data.subx < cursorSize - padding) { // In the left of the intersection
      data.subx += Math.abs(data.suby - cursorSize) / deltaMod
      data.suby = cursorSize
    } else if (data.subx > cursorSize + padding) { // In the right of the intersection
      data.subx -= Math.abs(data.suby - cursorSize) / deltaMod
      data.suby = cursorSize
    } else if (data.suby < cursorSize - padding) { // In the top of the intersection
      data.suby += Math.abs(data.subx - cursorSize) / deltaMod
      data.subx = cursorSize
    } else if (data.suby > cursorSize + padding) { // In the bottom of the intersection
      data.suby -= Math.abs(data.subx - cursorSize) / deltaMod
      data.subx = cursorSize
    }
  }

  // Gap collision
  if (elem.className.includes('gap')) {
    var gapSize = 18 // Thickness of the gap, in pixels
    if (elem.className.endsWith('trace-r')) { // Approaching from left
      if (data.subx + cursorSize > (width - gapSize)/2) {
        data.subx = (width - gapSize)/2 - cursorSize
      }
    } else if (elem.className.endsWith('trace-l')) { // Approaching from right
      if (data.subx - cursorSize < (width + gapSize)/2) {
        data.subx = (width + gapSize)/2 + cursorSize
      }
    } else if (elem.className.endsWith('trace-d')) {
      if (data.suby + cursorSize > (height - gapSize)/2) { // Approaching from above
        data.suby = (height - gapSize)/2 - cursorSize
      }
    } else if (elem.className.endsWith('trace-u')) {
      if (data.suby - cursorSize < (height + gapSize)/2) { // Approaching from below
        data.suby = (height + gapSize)/2 + cursorSize
      }
    }
  }

  // Self collision
  if (next_elem != null && next_elem.className.includes('trace-')) {
    var padding = 5 // Gap between cursor and previously traced line
    
    if (elem.className.endsWith('trace-r')) { // Approaching from left
      if (data.subx > width - cursorSize - padding) {
        data.subx = width - cursorSize - padding
      }
    } else if (elem.className.endsWith('trace-l')) { // Approaching from right
      if (data.subx < cursorSize + padding) {
        data.subx = cursorSize + padding
      }
    } else if (elem.className.endsWith('trace-d')) { // Approaching from above
      if (data.suby > height - cursorSize - padding) {
        data.suby = height - cursorSize - padding
      }
    } else if (elem.className.endsWith('trace-u')) { // Approaching from below
      if (data.suby < cursorSize + padding) {
        data.suby = cursorSize + padding
      }
    }
  }

  // FIXME: data.x and data.y feel backwards
  // Outer wall collision
  // Against left or right wall, pushing moves you up
  if ((data.subx < cursorSize && getVisualCell(data.x, data.y - 1) == null)
   || (data.subx > cursorSize && getVisualCell(data.x, data.y + 1) == null)) {
    data.suby -= Math.abs(data.subx - cursorSize) / deltaMod
    data.subx = cursorSize
    if (getVisualCell(data.x - 1, data.y) == null) { // Also against top wall
      if (data.suby < cursorSize) data.suby = cursorSize
    }
  }
  // Against top or bottom wall, pushing moves you right
  if ((data.suby < cursorSize && getVisualCell(data.x - 1, data.y) == null)
   || (data.suby > cursorSize && getVisualCell(data.x + 1, data.y) == null)) {
    data.subx += Math.abs(data.suby - cursorSize) / deltaMod
    data.suby = cursorSize
    if (getVisualCell(data.x, data.y + 1) == null) { // Also against right wall
      if (data.subx > cursorSize) data.subx = cursorSize
    }
  }
  
  // FIXME: data.x and data.y feel backwards
  // Cell wall collision
  if (data.subx < cursorSize) { // Against left wall
    var new_elem = getVisualCell(data.x, data.y - 1)
    if (new_elem != null
     && !new_elem.className.endsWith('trace')
     && !elem.className.endsWith('trace-r')) {
      if (data.suby < height / 2) { // Top half of cell
        data.suby -= Math.abs(data.subx - cursorSize) / deltaMod
        data.subx = cursorSize
      } else { // Bottom half of cell
        data.suby += Math.abs(data.subx - cursorSize) / deltaMod
        data.subx = cursorSize
      }
    }
  } else if (data.subx > cursorSize) { // Against right wall
    var new_elem = getVisualCell(data.x, data.y + 1)
    if (new_elem != null
     && !new_elem.className.endsWith('trace')
     && !elem.className.endsWith('trace-l')) {
      if (data.suby < height / 2) { // Top half of cell
        data.suby -= Math.abs(data.subx - cursorSize) / deltaMod
        data.subx = cursorSize
      } else { // Bottom half of cell
        data.suby += Math.abs(data.subx - cursorSize) / deltaMod
        data.subx = cursorSize
      }
    }
  }
  if (data.suby < cursorSize) { // Against top wall
    var new_elem = getVisualCell(data.x - 1, data.y)
    if (new_elem != null
     && !new_elem.className.endsWith('trace')
     && !elem.className.endsWith('trace-d')) {
      if (data.subx < width / 2) { // Left half of cell
        data.subx -= Math.abs(data.suby - cursorSize) / deltaMod
        data.suby = cursorSize
      } else { // Right half of cell
        data.subx += Math.abs(data.suby - cursorSize) / deltaMod
        data.suby = cursorSize
      }
    }
  } else if (data.suby > cursorSize) { // Against bottom wall
    var new_elem = getVisualCell(data.x + 1, data.y)
    if (new_elem != null
     && !new_elem.className.endsWith('trace')
     && !elem.className.endsWith('trace-u')) {
      if (data.subx < width / 2) { // Left half of cell
        data.subx -= Math.abs(data.suby - cursorSize) / deltaMod
        data.suby = cursorSize
      } else { // Right half of cell
        data.subx += Math.abs(data.suby - cursorSize) / deltaMod
        data.suby = cursorSize
      }
    }
  }
}

// This function draws elements as the cursor passes near them. It draws
// differently if the cursor is currently in the cell or not
function _draw(elem, subx, suby) {
  if (elem == null) return
  var width = parseInt(window.getComputedStyle(elem).width)
  var height = parseInt(window.getComputedStyle(elem).height)
  var svg = elem.getElementsByTagName('svg')[0]
  if (svg == undefined) {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('viewBox', '0 0 '+width+' '+height)
  }
  while (svg.getElementsByClassName('cursor').length > 0) {
    svg.getElementsByClassName('cursor')[0].remove()
  }
  while (svg.getElementsByClassName('line').length > 0) {
    svg.getElementsByClassName('line')[0].remove()
  }
  var circ = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
  circ.setAttribute('r', cursorSize)
  circ.setAttribute('class', 'cursor')
  circ.setAttribute('cx', subx)
  circ.setAttribute('cy', suby)
  var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  rect.setAttribute('height', 0)
  rect.setAttribute('width', 0)
  rect.setAttribute('rx', 0)
  rect.setAttribute('ry', 0)
  rect.setAttribute('class', 'line')
  rect.setAttribute('transform', '')
  var circ2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
  circ2.setAttribute('r', cursorSize)
  circ2.setAttribute('cx', width/2)
  circ2.setAttribute('cy', height/2)
  circ2.setAttribute('class', 'line')
  var rect2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  rect2.setAttribute('class', 'line')

  var enter_dir = elem.className.split('-')[1]
  var exit_dir = elem.className.split('-')[2]
  if (elem.className.includes('start')) {
    // Tracing from the start element, special case
    if (subx > width) {
      circ.setAttribute('cx', parseInt(circ.getAttribute('cx')) - width/2)
    }
    if (suby > height) {
      circ.setAttribute('cy', parseInt(circ.getAttribute('cy')) - height/2)
    }
    circ.setAttribute('cx', parseInt(circ.getAttribute('cx')) + cursorSize)
    circ.setAttribute('cy', parseInt(circ.getAttribute('cy')) + cursorSize)

    circ2.setAttribute('r', cursorSize*2)
    svg.appendChild(circ2)
  } else if (enter_dir == null) {
    // Haven't entered the cell, draw nothing
  } else if (exit_dir == null) {
    // Still in the cell, draw cursor and first half of line
    if (enter_dir == 'r') {
      rect.setAttribute('width', Math.max(subx, 0))
      rect.setAttribute('height', height)
    } else if (enter_dir == 'l') {
      rect.setAttribute('width', Math.max(width - subx, 0))
      rect.setAttribute('height', height)
      rect.setAttribute('transform', 'translate('+subx+', 0)')
    } else if (enter_dir == 'd') {
      rect.setAttribute('width', width)
      rect.setAttribute('height', Math.max(suby, 0))
    } else if (enter_dir == 'u') {
      rect.setAttribute('width', width)
      rect.setAttribute('height', Math.max(height - suby, 0))
      rect.setAttribute('transform', 'translate(0, '+suby+')')
    }
    svg.appendChild(rect)
    if (enter_dir == 'l' && subx <= width/2) {
      svg.appendChild(circ2)
    } else if (enter_dir == 'r' && subx >= width/2) {
      svg.appendChild(circ2)
    } else if (enter_dir == 'u' && suby <= height/2) {
      svg.appendChild(circ2)
    } else if (enter_dir == 'd' && suby >= height/2) {
      svg.appendChild(circ2)
    }
    // If past the halfway point, draw the second half of the line
    if (enter_dir != 'l' && subx > width/2) {
      rect2.setAttribute('width', subx - width/2)
      rect2.setAttribute('height', height)
      rect2.setAttribute('transform', 'translate('+width/2+', 0)')
    } else if (enter_dir != 'r' && subx < width/2) {
      rect2.setAttribute('width', width/2 - subx)
      rect2.setAttribute('height', height)
      rect2.setAttribute('transform', 'translate('+subx+', 0)')
    } else if (enter_dir != 'u' && suby > height/2) {
      rect2.setAttribute('width', width)
      rect2.setAttribute('height', suby - height/2)
      rect2.setAttribute('transform', 'translate(0, '+height/2+')')
    } else if (enter_dir != 'd' && suby < height/2) {
      rect2.setAttribute('width', width)
      rect2.setAttribute('height', height/2 - suby)
      rect2.setAttribute('transform', 'translate(0, '+suby+')')
    }
    svg.appendChild(rect2)
  } else {
    // Entered and exited the cell, redraw
     svg.appendChild(rect)
    if (enter_dir == 'r') {
      rect.setAttribute('width', width/2)
      rect.setAttribute('height', height)
    } else if (enter_dir == 'l') {
      rect.setAttribute('width', width/2)
      rect.setAttribute('height', height)
      rect.setAttribute('transform', 'translate('+(width/2)+', 0)')
    } else if (enter_dir == 'd') {
      rect.setAttribute('width', width)
      rect.setAttribute('height', height/2)
    } else if (enter_dir == 'u') {
      rect.setAttribute('width', width)
      rect.setAttribute('height', height/2)
      rect.setAttribute('transform', 'translate(0, '+(height/2)+')')
    }
    svg.appendChild(circ2)
    if (exit_dir == 'r') {
      rect2.setAttribute('width', width/2)
      rect2.setAttribute('height', height)
      rect2.setAttribute('transform', 'translate('+width/2+', 0)')
    } else if (exit_dir == 'l') {
      rect2.setAttribute('width', width/2)
      rect2.setAttribute('height', height)
    } else if (exit_dir == 'd') {
      rect2.setAttribute('width', width)
      rect2.setAttribute('height', height/2)
      rect2.setAttribute('transform', 'translate(0, '+height/2+')')
    } else if (exit_dir == 'u') {
      rect2.setAttribute('width', width)
      rect2.setAttribute('height', height/2)
    }
    svg.appendChild(rect2)
  }
  // Always redraw cursor, at the end so it goes over the line
  svg.appendChild(circ)
  elem.appendChild(svg)
}

// This handles moving the cursor. Since the puzzle is actually a grid, in order
// to have smooth transitions I keep track of which element the cursor is
// currently over, along with a subposition to determine where in the cell it is
// This function handles reaching the edge of a shape, and also sets the class
// name for traversed cells. The naming scheme is trace-X-Y where X is the
// direction the cell was entered from, and Y is the direction that the cell
// was exited from. Thus, tracing to the right leads to class 'trace-r-r' If the
// cursor is currently in a cell, it will have only one direction, eg 'trace-r'
// and if the cell is not traced (but can be) then it will have class 'trace'
function _move(data, next_elem) {
  var elem = getVisualCell(data.x, data.y)
  var width = parseInt(window.getComputedStyle(elem).width)
  var height = parseInt(window.getComputedStyle(elem).height)
  if (elem.className.includes('start')) {
    height /= 2
    width /= 2
  }

  if (data.subx < 0) { // Moving left
    var new_elem = getVisualCell(data.x, data.y - 1)
    if (new_elem != null) {
      var new_width = parseInt(window.getComputedStyle(new_elem).width)
      if (new_elem.className.includes('start')) new_width /= 2
      if (new_elem.className.endsWith('trace')) { // Traced new path
        data.y--
        data.subx += new_width
        elem.className += '-l'
        new_elem.className += '-l'
      } else if (elem.className.endsWith('-r')) { // Retraced path
        data.y--
        data.subx += new_width
        elem.className = elem.className.substring(0, elem.className.length-2)
        new_elem.className = new_elem.className.substring(0, new_elem.className.length-2)
      }
    }
  } else if (data.subx > width) { // Moving right
    var new_elem = getVisualCell(data.x, data.y + 1)
    if (new_elem != null) {
      if (new_elem.className.endsWith('trace')) { // Traced new path
        data.y++
        data.subx -= width
        elem.className += '-r'
        new_elem.className += '-r'
      } else if (elem.className.endsWith('-l')) { // Retraced path
        data.y++
        data.subx -= width
        elem.className = elem.className.substring(0, elem.className.length-2)
        new_elem.className = new_elem.className.substring(0, new_elem.className.length-2)
      }
    }
  }
  if (data.suby < 0) { // Moving up
    var new_elem = getVisualCell(data.x - 1, data.y)
    if (new_elem != null) {
      var new_height = parseInt(window.getComputedStyle(new_elem).height)
      if (new_elem.className.includes('start')) new_height /= 2
      if (new_elem.className.endsWith('trace')) { // Trace new path
        data.x--
        data.suby += new_height
        elem.className += '-u'
        new_elem.className += '-u'
      } else if (elem.className.endsWith('-d')) { // Retrace path
        data.x--
        data.suby += new_height
        elem.className = elem.className.substring(0, elem.className.length-2)
        new_elem.className = new_elem.className.substring(0, new_elem.className.length-2)
      }
    }
  } else if (data.suby > height) { // Moving down
    var new_elem = getVisualCell(data.x + 1, data.y)
    if (new_elem != null) {
      if (new_elem.className.endsWith('trace')) { // Traced new path
        data.x++
        data.suby -= height
        elem.className += '-d'
        new_elem.className += '-d'
      } else if (elem.className.endsWith('-u')) { // Retraced path
        data.x++
        data.suby -= height
        elem.className = elem.className.substring(0, elem.className.length-2)
        new_elem.className = new_elem.className.substring(0, new_elem.className.length-2)
      }
    }
  }
}
