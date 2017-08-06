var cursorSize = 12
var data
function trace(elem) {
  if (document.pointerLockElement == null) {
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
    // These aren't really arrays, they live update during iteration
    for (var cell of table.getElementsByTagName('td')) {
      cell.className = cell.className.split('-')[0]
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
  } else {
    var table = document.getElementById(data.table)
    var puzzle = JSON.parse(table.getAttribute('json'))
    var curr_elem = document.getElementById(data.table+'_'+data.x+'_'+data.y)
    if (curr_elem.className.includes('end')) {
      for (var x=0; x<puzzle.grid.length; x++) {
        for (var y=0; y<puzzle.grid[x].length; y++) {
          var elem = document.getElementById(data.table+'_'+x+'_'+y)
          if (elem != undefined && elem.className.includes('trace-')) {
            if (!elem.className.includes('end')) {
              puzzle.grid[x][y] = true
            }
          }
        }
      }

      document.styleSheets[0].deleteRule(0)
      if (isValid(puzzle)) {
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
  var elem = document.getElementById(data.table+'_'+data.x+'_'+data.y)
  var next_elem = document.getElementById(data.table+'_'+(data.x+Math.sign(dy))+'_'+(data.y+Math.sign(dx)))
  var width = parseInt(window.getComputedStyle(elem).width)
  var height = parseInt(window.getComputedStyle(elem).height)

  // Limit motion via collision
  _collision(next_elem)

  // Redraw all elements near the cursor
  for (var x=-1; x<=1; x++) {
    for (var y=-1; y<=1; y++) {
      var temp_elem = document.getElementById(data.table+'_'+(data.x+x)+'_'+(data.y+y))
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

// Collision detection. If the cursor moves into an edge or into a cell,
// then its position is reset to be exactly touching the edge, and some
// of the excess movement is converted to the other direction.
// Corners are handled separately to prevent runover into cells
function _collision(next_elem) {
  var elem = document.getElementById(data.table+'_'+data.x+'_'+data.y)
  var width = parseInt(window.getComputedStyle(elem).width)
  var height = parseInt(window.getComputedStyle(elem).height)
  if (elem.className.includes('start')) {
    height /= 2
    width /= 2
  }

  // Corner collision
  if ((elem.className.includes('corner') || elem.className.includes('start')) && next_elem != null) {
    var deltaMod = 3 // Fraction of movement to redirect to the other direction
    var padding = 3 // Pixels above and below the corner where we won't modify movement
    if (data.subx < cursorSize && data.subx > cursorSize / 2) {
      var delta = cursorSize - data.subx
      if (data.suby > cursorSize + padding) {
        data.subx += delta
        data.suby -= delta / deltaMod
      } else if (data.suby < cursorSize - padding) {
        data.subx += delta
        data.suby += delta / deltaMod
      }
    }
    if (data.suby < cursorSize && data.suby > cursorSize / 2) {
      var delta = cursorSize - data.suby
      if (data.subx > cursorSize + padding) {
        data.subx -= delta / deltaMod
        data.suby += delta
      } else if (data.subx < cursorSize - padding) {
        data.subx += delta / deltaMod
        data.suby += delta
      }
    }
    if (data.subx > cursorSize && data.subx < cursorSize * 3 / 2) {
      var delta = data.subx - cursorSize
      if (data.suby > cursorSize + padding) {
        data.subx -= delta
        data.suby -= delta / deltaMod
      } else if (data.suby < cursorSize - padding) {
        data.subx -= delta
        data.suby += delta / deltaMod
      }
    }
    if (data.suby > cursorSize && data.suby < cursorSize * 3 / 2) {
      var delta = data.suby - cursorSize
      if (data.subx > cursorSize + padding) {
        data.subx -= delta / deltaMod
        data.suby -= delta
      } else if (data.subx < cursorSize - padding) {
        data.subx += delta / deltaMod
        data.suby -= delta
      }
    }
  }

  // Gap (aka break) collision
  if (elem.className.includes('gap')) {
    var gapSize = 18 // Thickness of the gap, in pixels
    if (elem.className.endsWith('trace-r') && data.subx + cursorSize > (width - gapSize)/2) {
      data.subx = (width - gapSize)/2 - cursorSize
    } else if (elem.className.endsWith('trace-l') && data.subx - cursorSize < (width + gapSize)/2) {
      data.subx = (width + gapSize)/2 + cursorSize
    } else if (elem.className.endsWith('trace-d') && data.suby + cursorSize > (height - gapSize)/2) {
      data.suby = (height - gapSize)/2 - cursorSize
    } else if (elem.className.endsWith('trace-u') && data.suby - cursorSize < (height + gapSize)/2) {
      data.suby = (height + gapSize)/2 + cursorSize
    }
  }

  // Generic collision
  var deltaMod = 3 // Fraction of movement to redirect to the other direction
  if (data.subx < cursorSize) {
    var new_elem = document.getElementById(data.table+'_'+data.x+'_'+(data.y-1))
    var delta = cursorSize - data.subx
    if (new_elem == null) {
      data.subx += delta
      data.suby -= delta / deltaMod
    } else if (!new_elem.className.endsWith('trace') && !elem.className.endsWith('trace-r')) {
      data.subx += delta
      data.suby += (data.suby > height/2 ? 1 : -1) * delta / deltaMod
    }
  }
  if (data.suby < cursorSize) {
    var new_elem = document.getElementById(data.table+'_'+(data.x-1)+'_'+data.y)
    var delta = cursorSize - data.suby
    if (new_elem == null) {
      data.subx += delta / deltaMod
      data.suby += delta
    } else if (!new_elem.className.endsWith('trace') && !elem.className.endsWith('trace-d')) {
      data.subx += (data.subx > width/2 ? 1 : -1) * delta / deltaMod
      data.suby += delta
    }
  } else if (data.suby > height - cursorSize) {
    var new_elem = document.getElementById(data.table+'_'+(data.x+1)+'_'+data.y)
    var delta = data.suby - (height - cursorSize)
    if (new_elem == null) {
      data.subx += delta / deltaMod
      data.suby -= delta
    } else if (!new_elem.className.endsWith('trace') && !elem.className.endsWith('trace-u')) {
      data.subx += (data.subx > width/2 ? 1 : -1) * delta / deltaMod
      data.suby -= delta
    }
  }
  if (data.subx > width - cursorSize) {
    var new_elem = document.getElementById(data.table+'_'+data.x+'_'+(data.y+1))
    var delta = data.subx - (width - cursorSize)
    if (new_elem == null) {
      data.subx -= delta
      data.suby -= delta / deltaMod
    } else if (!new_elem.className.endsWith('trace') && !elem.className.endsWith('trace-l')) {
      data.subx -= delta
      data.suby += (data.suby > height/2 ? 1 : -1) * delta / deltaMod
    }
    if (document.getElementById(data.table+'_'+(data.x-1)+'_'+data.y) == null) {
      data.suby = Math.max(data.suby, cursorSize)
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
  var elem = document.getElementById(data.table+'_'+data.x+'_'+data.y)
  var width = parseInt(window.getComputedStyle(elem).width)
  var height = parseInt(window.getComputedStyle(elem).height)
  if (elem.className.includes('start')) {
    height /= 2
    width /= 2
  }

  if (data.subx < 0) { // Moving left
    var new_elem = document.getElementById(data.table+'_'+data.x+'_'+(data.y-1))
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
    var new_elem = document.getElementById(data.table+'_'+data.x+'_'+(data.y+1))
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
    var new_elem = document.getElementById(data.table+'_'+(data.x-1)+'_'+data.y)
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
    var new_elem = document.getElementById(data.table+'_'+(data.x+1)+'_'+data.y)
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
