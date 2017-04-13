var data
function trace(elem) {
  if (document.pointerLockElement == null && document.mozPointerLockElement == null) {
    document.styleSheets[0].deleteRule(3)
    document.styleSheets[0].insertRule(".line {fill: #6D4D4A}", 3)
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
    var circles = table.getElementsByClassName('circle')
    while (circles.length > 0) {
      circles[0].remove()
    }

    elem.requestPointerLock = elem.requestPointerLock || elem.mozRequestPointerLock
    elem.requestPointerLock()
    var svg = elem.getElementsByTagName('svg')[0]
    if (svg == undefined) {
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    }
    svg.setAttribute('viewBox', '0 0 '+width+' '+height)
    var circ = svg.getElementsByTagName('circle')[0]
    if (circ == undefined) {
      var circ = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    }
    circ.setAttribute('cx', '11px')
    circ.setAttribute('cy', '11px')
    circ.setAttribute('border', '0px')
    circ.setAttribute('class', 'line')
    var anim = circ.getElementsByTagName('animate')[0]
    if (anim == undefined) {
      var anim = document.createElementNS('http://www.w3.org/2000/svg', 'animate')
    }
    anim.setAttribute('attributeName', 'r')
    anim.setAttribute('from', '0')
    anim.setAttribute('to', '11')
    anim.setAttribute('dur', '0.2s')
    anim.setAttribute('fill', 'freeze') // Hold the final frame of animation
    circ.appendChild(anim)
    svg.appendChild(circ)
    elem.appendChild(svg)
  } else {
    var table = document.getElementById(data.table)
    var puzzle = JSON.parse(table.getAttribute('json'))
    var curr_elem = document.getElementById(data.table+'_'+data.x+'_'+data.y)
    if (curr_elem.className.includes('end')) {
      for (var elem of table.getElementsByTagName('td')) {
        // FIXME: Reversed?
        var x = elem.id.split('_')[2]
        var y = elem.id.split('_')[1]
        if (elem.className.includes('trace-')) {
          if (!elem.className.includes('end')) {
            puzzle.grid[x][y] = true
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
    document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock
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
  var dx = (e.movementX || e.mozMovementX || 0)
  var dy = (e.movementY || e.mozMovementY || 0)
  // Option 1: Raw
  // data.subx += sens*dx
  // data.suby += sens*dy
  // Option 2: Capped
  data.subx += sens*Math.sign(dx)*Math.min(Math.abs(dx), 10)
  data.suby += sens*Math.sign(dy)*Math.min(Math.abs(dy), 10)
  // Option 3: Quadratic
  // data.subx += sens*Math.sign(dx)*Math.sqrt(Math.abs(dx))
  // data.suby += sens*Math.sign(dy)*Math.sqrt(Math.abs(dy))
  // Option 4: Quadratic Capped
  // data.subx += sens*Math.sign(dx)*Math.sqrt(Math.min(Math.abs(dx), 10))
  // data.suby += sens*Math.sign(dy)*Math.sqrt(Math.min(Math.abs(dy), 10))
  var elem = document.getElementById(data.table+'_'+data.x+'_'+data.y)
  var next_elem = document.getElementById(data.table+'_'+(data.x+Math.sign(dx))+'_'+(data.y+Math.sign(dy)))
  var width = parseInt(window.getComputedStyle(elem).width)
  var height = parseInt(window.getComputedStyle(elem).height)

  // Limit motion via collision
  _collision(data, elem, next_elem)

  // Redraw all elements near the cursor
  for (var x=-1; x<=1; x++) {
    for (var y=-1; y<=1; y++) {
      var temp_elem = document.getElementById(data.table+'_'+(data.x+x)+'_'+(data.y+y))
      if (temp_elem == null) continue
      var temp_width = width
      var temp_height = height
      if (x == -1) {
        temp_width = parseInt(window.getComputedStyle(temp_elem).width)
      }
      if (y == -1) {
        temp_height = parseInt(window.getComputedStyle(temp_elem).height)
      }
      _draw(temp_elem, data.subx - x * temp_width, data.suby - y * temp_height)
    }
  }

  // Potentially move the cursor to a new cell
  _move(data)
}

// Collision detection. If the cursor moves into an edge or into a cell,
// then its position is reset to be exactly touching the edge.
// Corners are handled separately to prevent runover into cells
function _collision(data, elem, next_elem) {
  var width = parseInt(window.getComputedStyle(elem).width)
  var height = parseInt(window.getComputedStyle(elem).height)

  if (elem.className.includes('corner') && next_elem != undefined) { // Corner collision
    // Calculates the distance to the edge in each direction
    var dist_x = (data.subx < width/2) ? data.subx : width - data.subx
    var dist_y = (data.suby < height/2) ? data.suby : height - data.suby
    if (dist_x > dist_y) { // Reduce the larger distance to the edge
      if (data.subx - 11 < 0) data.subx = 11
      if (data.subx + 11 > width) data.subx = width - 11
    } else {
      if (data.suby - 11 < 0) data.suby = 11
      if (data.suby + 11 > height) data.suby = height - 11
    }
  }

  // Break collision
  if (elem.className.includes('break')) {
    if (elem.className.endsWith('trace-r') && data.subx - 7 > 0) {
      data.subx = 7
    } else if (elem.className.endsWith('trace-l') && data.subx + 7 < width) {
      data.subx = width - 7
    } else if (elem.className.endsWith('trace-d') && data.suby - 7 > 0) {
      data.suby = 7
    } else if (elem.className.endsWith('trace-u') && data.suby + 7 < height) {
      data.suby = height - 7
    }
  }

  // Generic collision
  if (data.subx - 11 < 0) {
    var new_elem = document.getElementById(data.table+'_'+(data.x-1)+'_'+data.y)
    if (new_elem == null) {
      data.subx = 11
    } else if (!(new_elem.className.endsWith('trace') ||elem.className.endsWith('trace-r'))) {
      data.subx = 11
    }
  } else if (data.subx + 11 > width) {
    var new_elem = document.getElementById(data.table+'_'+(data.x+1)+'_'+data.y)
    if (new_elem == null) {
      data.subx = width - 11
    } else if (!(new_elem.className.endsWith('trace') ||elem.className.endsWith('trace-l'))) {
      data.subx = width - 11
    }
  }
  if (data.suby - 11 < 0) {
    var new_elem = document.getElementById(data.table+'_'+data.x+'_'+(data.y-1))
    if (new_elem == null) {
      data.suby = 11
    } else if (!(new_elem.className.endsWith('trace') ||elem.className.endsWith('trace-d'))) {
      data.suby = 11
    }
  } else if (data.suby + 11 > height) {
    var new_elem = document.getElementById(data.table+'_'+data.x+'_'+(data.y+1))
    if (new_elem == null) {
      data.suby = height - 11
    } else if (!(new_elem.className.endsWith('trace') ||elem.className.endsWith('trace-u'))) {
      data.suby = height - 11
    }
  }
}

// This function draws elements as the cursor passes near them. It draws
// differently if the cursor is currently in the cell or not
function _draw(elem, subx, suby) {
  if (elem == null) return
  if (elem.className.includes('start')) return
  if (!elem.className.includes('trace')) return
  var width = parseInt(window.getComputedStyle(elem).width)
  var height = parseInt(window.getComputedStyle(elem).height)
  var svg = elem.getElementsByTagName('svg')[0]
  if (svg == undefined) {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('viewBox', '0 0 '+width+' '+height)
  }
  while (svg.getElementsByTagName('circle').length > 0) {
    svg.getElementsByTagName('circle')[0].remove()
  }
  var circ = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
  circ.setAttribute('r', '11px')
  circ.setAttribute('class', 'circle')
  circ.setAttribute('cx', subx)
  circ.setAttribute('cy', suby)
  while (svg.getElementsByTagName('rect').length > 0) {
    svg.getElementsByTagName('rect')[0].remove()
  }
  var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  rect.setAttribute('height', '0px')
  rect.setAttribute('width', '0px')
  rect.setAttribute('rx', '0px')
  rect.setAttribute('ry', '0px')
  rect.setAttribute('class', 'line')
  rect.setAttribute('transform', '')
  var circ2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
  circ2.setAttribute('r', '11px')
  circ2.setAttribute('cx', width/2)
  circ2.setAttribute('cy', height/2)
  circ2.setAttribute('class', 'line')
  var rect2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  rect2.setAttribute('class', 'line')

  var enter_dir = elem.className.split('-')[1]
  var exit_dir = elem.className.split('-')[2]
  if (enter_dir == null) { // Haven't entered the cell, draw nothing
  } else if (exit_dir == null) { // Still in the cell
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
    if (enter_dir == 'l' && subx <= width/2) {
      svg.appendChild(circ2)
    } else if (enter_dir == 'r' && subx >= width/2) {
      svg.appendChild(circ2)
    } else if (enter_dir == 'u' && suby <= height/2) {
      svg.appendChild(circ2)
    } else if (enter_dir == 'd' && suby >= height/2) {
      svg.appendChild(circ2)
    }
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
  } else { // Entered and exited the cell, redraw mostly not necessary
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
  }
  svg.appendChild(rect)
  svg.appendChild(rect2)
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
function _move(data) {
  var elem = document.getElementById(data.table+'_'+data.x+'_'+data.y)
  var width = parseInt(window.getComputedStyle(elem).width)
  var height = parseInt(window.getComputedStyle(elem).height)

  if (data.subx < 0) { // Moving left
    var new_elem = document.getElementById(data.table+'_'+(data.x-1)+'_'+data.y)
    if (new_elem != null) {
      var new_width = parseInt(window.getComputedStyle(new_elem).width)
      if (new_elem.className.endsWith('trace')) { // Traced new path
        data.x--
        data.subx += new_width
        elem.className += '-l'
        new_elem.className += '-l'
      } else if (elem.className.endsWith('-r')) { // Retraced path
        data.x--
        data.subx += new_width
        elem.className = elem.className.substring(0, elem.className.length-2)
        new_elem.className = new_elem.className.substring(0, new_elem.className.length-2)
      }
    }
  } else if (data.subx > width) { // Moving right
    var new_elem = document.getElementById(data.table+'_'+(data.x+1)+'_'+data.y)
    if (new_elem != null) {
      if (new_elem.className.endsWith('trace')) { // Traced new path
        data.x++
        data.subx -= width
        elem.className += '-r'
        new_elem.className += '-r'
      } else if (elem.className.endsWith('-l')) { // Retraced path
        data.x++
        data.subx -= width
        elem.className = elem.className.substring(0, elem.className.length-2)
        new_elem.className = new_elem.className.substring(0, new_elem.className.length-2)
      }
    }
  }
  if (data.suby < 0) { // Moving up
    var new_elem = document.getElementById(data.table+'_'+data.x+'_'+(data.y-1))
    if (new_elem != null) {
      var new_height = parseInt(window.getComputedStyle(new_elem).height)
      if (new_elem.className.endsWith('trace')) { // Trace new path
        data.y--
        data.suby += new_height
        elem.className += '-u'
        new_elem.className += '-u'
      } else if (elem.className.endsWith('-d')) { // Retrace path
        data.y--
        data.suby += new_height
        elem.className = elem.className.substring(0, elem.className.length-2)
        new_elem.className = new_elem.className.substring(0, new_elem.className.length-2)
      }
    }
  } else if (data.suby > height) { // Moving down
    var new_elem = document.getElementById(data.table+'_'+data.x+'_'+(data.y+1))
    if (new_elem != null) {
      if (new_elem.className.endsWith('trace')) { // Traced new path
        data.y++
        data.suby -= height
        elem.className += '-d'
        new_elem.className += '-d'
      } else if (elem.className.endsWith('-u')) { // Retraced path
        data.y++
        data.suby -= height
        elem.className = elem.className.substring(0, elem.className.length-2)
        new_elem.className = new_elem.className.substring(0, new_elem.className.length-2)
      }
    }
  }
}
