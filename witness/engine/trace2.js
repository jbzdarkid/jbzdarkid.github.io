window.BBOX_DEBUG = false

var data

function trace(elem, puzzle) {
  if (document.pointerLockElement == null) { // Started tracing a solution
    PLAY_SOUND('start')
    var animations = undefined
    for (var styleSheet of document.styleSheets) {
      if (styleSheet.title == 'animations') {
        animations = styleSheet
        break
      }
    }

    var cursor = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    elem.parentElement.appendChild(cursor)
    cursor.setAttribute('r', 12)
    cursor.setAttribute('fill', CURSOR)
    cursor.setAttribute('stroke', 'black')
    cursor.setAttribute('stroke-width', '2px')
    cursor.setAttribute('stroke-opacity', '0.4')
    var cx = parseFloat(elem.getAttribute('cx'))
    var cy = parseFloat(elem.getAttribute('cy'))
    cursor.setAttribute('cx', cx)
    cursor.setAttribute('cy', cy)
    
    var bboxDebug = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    elem.parentElement.appendChild(bboxDebug)
    bboxDebug.setAttribute('fill', 'white')
    bboxDebug.setAttribute('opacity', 0.3)
    
    data = {
      'animations':animations,
      'tracing':true,
      'bbox':{'x1':cx-12, 'y1':cy-12, 'x2':cx+12, 'y2':cy+12},
      'bboxDebug':bboxDebug,
      // Cursor element and location
      'cursor': cursor,
      'x':cx,
      'y':cy,
      // Position within puzzle.grid
      'pos':puzzle.start,
      'puzzle':puzzle,
    }
    
    for (var i = 0; i < data.animations.cssRules.length; i++) {
      var rule = data.animations.cssRules[i]
      if (rule.selectorText == '.' + data.table) {
        data.animations.deleteRule(i--)
      }
    }

    elem.requestPointerLock()
  } else {
    event.stopPropagation()
    // Signal the onMouseMove to stop accepting input (race condition)
    data.tracing = false

    // Extract the traced solution

    if ("not ended in an endpoint" && false) {
      // Resume tracing from cursor?
      PLAY_SOUND('abort')
    } else {
      validate(data.puzzle)

      // Mark the negations
      // for (var pos of data.puzzle.negations) {
        // var cell = document.getElementById(data.table+'_'+pos.x+'_'+pos.y)
        // cell.children[0].style.opacity = 0.5
      // }

      var animation = '.' + data.table + ' {animation: 1s 1 forwards '
      if (data.puzzle.valid || true) {
        PLAY_SOUND('success')
        animation += 'line-success'
      } else {
        PLAY_SOUND('fail')
        animation += 'line-fail'
      }
      animation += '}'
      data.animations.insertRule(animation)
    }
    document.exitPointerLock()
  }
}

document.onpointerlockchange = document.mozpointerlockchange = function() {
  if (document.pointerLockElement == null && document.mozPointerLockElement == null) {
    console.log('Cursor release requested')
    document.onmousemove = null
    document.ontouchmove = null
    document.onclick = null
    document.ontouchend = null
  } else {
    console.log('Cursor lock requested')
    document.onmousemove = function(event) {
      var sens = document.getElementById('sens').value
      _onMove(sens * event.movementX, sens * event.movementY)
    }
    document.ontouchmove = function(event) {
      // TODO: Save the identifier & x/y from the touchstart, then compute deltas
    }
    // document.ontouchend = function(event) {_stopTrace(event)}
  }
}


function _onMove(dx, dy) {
  if (!data.tracing) return
//  console.log(data.x, data.y, dx, dy)
  var width = (data.pos.x%2 == 0 ? 24 : 58)
  var height = (data.pos.y%2 == 0 ? 24 : 58)
  
  // Also handles some collision
  _pushCursor(dx, dy, width, height)
  
  // Compute absolute boundary checks (no pushing)
  // _collision()
  // Move the location to a new cell
  _move() // Try to implement collision here, so 1 fewer function

  // redraw
  data.cursor.setAttribute('cx', data.x)
  data.cursor.setAttribute('cy', data.y)
  
  if (window.BBOX_DEBUG) {
    data.bboxDebug.setAttribute('x', data.bbox.x1)
    data.bboxDebug.setAttribute('y', data.bbox.y1)
    data.bboxDebug.setAttribute('width', data.bbox.x2 - data.bbox.x1)
    data.bboxDebug.setAttribute('height', data.bbox.y2 - data.bbox.y1)
  }
}

function _push(dx, dy, dir, multiplier = 1) {
  // Fraction of movement to redirect in the other direction
  var deltaModInnerWall = 3 * multiplier
  var deltaModOuterWall = 3 * multiplier

  if (dir == 'left') {
    var overshoot = (data.x + dx) - data.bbox.x1 - 12
    if (overshoot < 0) {
      data.y += dy + overshoot / deltaModOuterWall
      data.x = data.bbox.x1 + 12
      return true
    }
  } else if (dir == 'right') {
    var overshoot = data.bbox.x2 - (data.x + dx) - 12
    if (overshoot < 0) {
      data.y += dy + overshoot / deltaModOuterWall
      data.x = data.bbox.x2 - 12
      return true
    }
  } else if (dir == 'top') {
    var overshoot = (data.y + dy) - data.bbox.y1 - 12
    if (overshoot < 0) {
      data.x += dx - overshoot / deltaModOuterWall
      data.y = data.bbox.y1 + 12
      return true
    }
  } else if (dir == 'bottom') {
    var overshoot = data.bbox.y2 - (data.y + dy) - 12 
    if (overshoot < 0) {
      data.x += dx - overshoot / deltaModOuterWall
      data.y = data.bbox.y2 - 12
      return true
    }
  }
  return false
}

function _pushCursor(dx, dy, width, height) {
  // Ratio of movement to be considered turning at an intersection
  var turnMod = 2

  /* TODO: // Endpoint collision
  if (elem.className.startsWith('end')) {
    if (elem.className.startsWith('end_left')) {
      data.subx += dx + Math.abs(dy) / deltaModInnerWall
    } else if (elem.className.startsWith('end_right')) {
      data.subx += dx - Math.abs(dy) / deltaModInnerWall
    } else if (elem.className.startsWith('end_up')) {
      data.suby += dy + Math.abs(dx) / deltaModInnerWall
    } else if (elem.className.startsWith('end_down')) {
      data.suby += dy - Math.abs(dx) / deltaModInnerWall
    }
    return
  }
  */
  
  // Outer wall collision
  if (data.pos.x == 0) { // Against left wall
    if (data.puzzle.end.x == data.pos.x) { // Endpoint is on the left wall
      if (data.pos.y < data.puzzle.end.y) { // Above endpoint
        if (_push(dx, dy, 'left', -1)) return
      }
      if (data.pos.y > data.puzzle.end.y) { // Below endpoint
        if (_push(dx, dy, 'left')) return
      }
    } else { // Endpoint is not on the left wall
      if (_push(dx, dy, 'left')) return
    }
  } else if (data.pos.x == data.puzzle.grid.length - 1) { // Against right wall
    if (data.puzzle.end.x == data.pos.x) { // Endpoint is on the right wall
      if (data.pos.y < data.puzzle.end.y) { // Above endpoint
        if (_push(dx, dy, 'right', -1)) return
      }
      if (data.pos.y > data.puzzle.end.y) { // Below endpoint
        if (_push(dx, dy, 'right')) return
      }
    } else { // Endpoint is not on the right wall
      if (_push(dx, dy, 'right')) return
    }
  }
  if (data.pos.y == 0) { // Against top wall
    if (data.puzzle.end.y == data.pos.y) { // Endpoint is on the top wall
      if (data.pos.x < data.puzzle.end.x) { // Left of endpoint
        if (_push(dx, dy, 'top')) return
      }
      if (data.pos.x > data.puzzle.end.x) { // Right of endpoint
        if (_push(dx, dy, 'top', -1)) return
      }
    } else { // Endpoint is not on the top wall
      if (_push(dx, dy, 'top')) return
    }
  } else if (data.pos.y == data.puzzle.grid[data.pos.x].length - 1) { // Against bottom wall
    if (data.puzzle.end.y == data.pos.y) { // Endpoint is on the bottom wall
      if (data.pos.x < data.puzzle.end.x) { // Left of endpoint
        if (_push(dx, dy, 'bottom')) return
      }
      if (data.pos.x > data.puzzle.end.x) { // Right of endpoint
        if (_push(dx, dy, 'bottom', -1)) return
      }
    } else { // Endpoint is not on the bottom wall
      if (_push(dx, dy, 'bottom')) return
    }
  }

  var middle = {
    'x':(data.bbox.x1 + data.bbox.x2) / 2,
    'y':(data.bbox.y1 + data.bbox.y2) / 2,
  }
  
  // Inner wall collision
  if (data.pos.x%2 == 1 && data.pos.y%2 == 0) { // Horizontal cell
    if (data.x < middle.x) {
      if (_push(dx, dy, 'top', -1)) return
      if (_push(dx, dy, 'bottom', -1)) return
    } else {
      if (_push(dx, dy, 'top')) return
      if (_push(dx, dy, 'bottom')) return
    }
  } else if (data.pos.x%2 == 0 && data.pos.y%2 == 1) { // Vertical cell
    if (data.y < middle.y) {
      if (_push(dx, dy, 'left')) return
      if (_push(dx, dy, 'right')) return
    } else {
      if (_push(dx, dy, 'left', -1)) return
      if (_push(dx, dy, 'right', -1)) return
    }
  }
  // Intersection collision
  if (data.pos.x%2 == 0 && data.pos.y%2 == 0) {
    if (data.x < middle.x) {
      _push(dx, dy, 'top')
      _push(dx, dy, 'bottom')
      // Overshot the intersection and appears to be trying to turn
      if (data.x > middle.x && Math.abs(dy) * turnMod > Math.abs(dx)) {
        data.y += Math.sign(dy) * (data.x - middle.x)
        data.x = middle.x
      }
      return
    }
    if (data.x > middle.x) {
      _push(dx, dy, 'top', -1)
      _push(dx, dy, 'bottom', -1)
      // Overshot the intersection and appears to be trying to turn
      if (data.x < middle.x && Math.abs(dy) * turnMod > Math.abs(dx)) {
        data.y += Math.sign(dy) * (middle.x - data.x)
        data.x = middle.x
      }
      return
    }
    if (data.y < middle.y) {
      _push(dx, dy, 'left', -1)
      _push(dx, dy, 'right', -1)
      // Overshot the intersection and appears to be trying to turn
      if (data.y > middle.y && Math.abs(dx) * turnMod > Math.abs(dy)) {
        data.x += Math.sign(dx) * (data.y - middle.y)
        data.y = middle.y
      }
      return
    }
    if (data.y > middle.y) {
      _push(dx, dy, 'left')
      _push(dx, dy, 'right')
      // Overshot the intersection and appears to be trying to turn
      if (data.y < middle.y && Math.abs(dx) * turnMod > Math.abs(dy)) {
        data.x += Math.sign(dx) * (middle.y - data.y)
        data.y = middle.y
      }
      return
    }
  }

  // Normal movement
  data.x += dx
  data.y += dy
}

function _move(width, height) {
  if (data.x < data.bbox.x1) { // Moving left
    var cell = data.puzzle.getCell(data.pos.x - 1, data.pos.y)
    if (cell == false) {
      data.pos.x--
      data.bbox.x2 = data.bbox.x1
      data.bbox.x1 -= (data.pos.x%2 == 0 ? 24 : 58)
    }
  } else if (data.x > data.bbox.x2) { // Moving right
    var cell = data.puzzle.getCell(data.pos.x + 1, data.pos.y)
    if (cell == false) {
      data.pos.x++
      data.bbox.x1 = data.bbox.x2
      data.bbox.x2 += (data.pos.x%2 == 0 ? 24 : 58)
    }
  }
  if (data.y < data.bbox.y1) { // Moving up
    var cell = data.puzzle.getCell(data.pos.x, data.pos.y - 1)
    if (cell == false) {
      data.pos.y--
      data.bbox.y2 = data.bbox.y1
      data.bbox.y1 -= (data.pos.y%2 == 0 ? 24 : 58)
    }
  } else if (data.y > data.bbox.y2) { // Moving down
    var cell = data.puzzle.getCell(data.pos.x, data.pos.y + 1)
    if (cell == false) {
      data.pos.y++
      data.bbox.y1 = data.bbox.y2
      data.bbox.y2 += (data.pos.y%2 == 0 ? 24 : 58)
    }
  }
}
 
/*
  var line = data.lines[data.lines.length - 1]
  if (line == undefined) {
    var line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    data.svg.appendChild(line)
    data.lines[data.lines.length - 1] = line
    line.setAttribute('x1', data.x)
    line.setAttribute('y1', data.y)
    line.setAttribute('x2', data.x)
    line.setAttribute('y2', data.y)
    line.setAttribute('stroke-width', 24)
    line.setAttribute('stroke-linecap', 'round')
    line.setAttribute('stroke', LINE_DEFAULT)
  }
  
  _move2()
}

function _move2(line, dx, dy) {
  var x1 = parseFloat(line.getAttribute('x1'))
  var y1 = parseFloat(line.getAttribute('y1'))
  var x2 = parseFloat(line.getAttribute('x2')) + dx
  var y2 = parseFloat(line.getAttribute('y2')) + dy
  
  if (line.dir == undefined) {
    // TODO: This feels bad...
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) line.dir = 'left'
      if (dx > 0) line.dir = 'right'
    } else {
      if (dy < 0) line.dir = 'up'
      if (dy > 0) line.dir = 'down'
    }
  }
  

  var width = (data.pos.x%2 == 0 ? 24 : 58)
  var height = (data.pos.y%2 == 0 ? 24 : 58)
  
  if (line.dir == 'left') {
    y2 = y1
    _newLine(line.dir, x1, x2, width, y1, y2, height)
  } else if (line.dir == 'right') {
    y2 = y1
    if (x2 - x1 > width) _newLine(dx - width, dy)
    if (x2 - x1 > 0) line.dir = 'left'
  } else if (line.dir == 'up') {
    x2 = x1
    if (y1 - y2 > height) _newLine(dx, dy + height)
    if (y1 - y2 > 0) line.dir = 'down'
  } else if (line.dir == 'down') {
    x2 = x1
    if (y2 - y1 > height) _newLine(dx, dy - height)
    if (y2 - y1 > 0) line.dir = 'up'
  }

  line.setAttribute('x2', x2)
  line.setAttribute('y2', y2)

}

function _newLine(dir, x1, x2, width, y1, y2, height) {
  var newLine = false
  if (dir == 'left') {
    if (x1 - x2 > width) {
      newLine = true
      dx = 
      _newLine(dx - width, dy)
    if (x1 - x2 > 0) line.dir = 'left'

  data.lines.push(undefined)
  data.x = // ???
  data.y = // ???
  _onMove(dx, dy)
}

function _move(x1, x2, width, y1, y2, height) {
  if (x1 - x2 > width) { // Left
    console.log('left')
    data.pos.x--
  } else if (x2 - x1 > width) { // Right
    console.log('right')
    data.pos.x++
    data.x += width
  } else if (y1 - y2 > height) { // Up
    console.log('up')
    data.pos.y--
    data.y -= height
  } else if (y2 - y1 > height) { // Down
    console.log('down')
    data.pos.y++
  }
}




*/