window.BBOX_DEBUG = false

class BoundingBox {
  constructor(x1, y1, x2, y2) {
    this.raw = {'x1':x1, 'y1':y1, 'x2':x2, 'y2':y2}
    this._compute()
  }
  
  shift(dir) {
    if (dir == 'left') {
      this.raw.x2 = this.raw.x1
      this.raw.x1 -= (data.pos.x%2 == 0 ? 24 : 58)
    } else if (dir == 'right') {
      this.raw.x1 = this.raw.x2
      this.raw.x2 += (data.pos.x%2 == 0 ? 24 : 58)
    } else if (dir == 'top') {
      this.raw.y2 = this.raw.y1
      this.raw.y1 -= (data.pos.y%2 == 0 ? 24 : 58)
    } else if (dir == 'bottom') {
      this.raw.y1 = this.raw.y2
      this.raw.y2 += (data.pos.y%2 == 0 ? 24 : 58)
    }
    this._compute()
  }
  
  _compute() {
    this.x1 = this.raw.x1
    this.y1 = this.raw.y1
    this.x2 = this.raw.x2
    this.y2 = this.raw.y2
    this.middle = {'x':(this.x1 + this.x2)/2, 'y':(this.y1 + this.y2)/2}
  }
}

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
      'bbox':new BoundingBox(cx-12, cy-12, cx+12, cy+12),
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
    var sens = document.getElementById('sens').value
    document.onmousemove = function(event) {
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

function _push(dx, dy, dir, target_dir) {
  // Fraction of movement to redirect in the other direction
  if (target_dir == 'right' || target_dir == 'top') {
    var movementRatio = 3
  } else if (target_dir == 'left' || target_dir == 'bottom') {
    var movementRatio = -3
  }

  if (dir == 'left') {
    var overshoot = (data.x + dx) - data.bbox.x1 - 12
    if (overshoot < 0) {
      data.y += dy + overshoot / movementRatio
      data.x = data.bbox.x1 + 12
      return true
    }
  } else if (dir == 'right') {
    var overshoot = data.bbox.x2 - (data.x + dx) - 12
    if (overshoot < 0) {
      data.y += dy + overshoot / movementRatio
      data.x = data.bbox.x2 - 12
      return true
    }
  } else if (dir == 'top') {
    var overshoot = (data.y + dy) - data.bbox.y1 - 12
    if (overshoot < 0) {
      data.x += dx - overshoot / movementRatio
      data.y = data.bbox.y1 + 12
      return true
    }
  } else if (dir == 'bottom') {
    var overshoot = data.bbox.y2 - (data.y + dy) - 12 
    if (overshoot < 0) {
      data.x += dx - overshoot / movementRatio
      data.y = data.bbox.y2 - 12
      return true
    }
  }
  return false
}

function _pushCursor(dx, dy, width, height) {
  /* TODO: // Endpoint collision -- Maybe not needed?
  if (elem.className.startsWith('end')) {
    if (elem.className.startsWith('end_left')) {
      data.subx += dx + Math.abs(dy) / 3
    } else if (elem.className.startsWith('end_right')) {
      data.subx += dx - Math.abs(dy) / 3
    } else if (elem.className.startsWith('end_up')) {
      data.suby += dy + Math.abs(dx) / 3
    } else if (elem.className.startsWith('end_down')) {
      data.suby += dy - Math.abs(dx) / 3
    }
    return
  }
  */

  // Outer wall collision
  if (data.pos.x == 0) { // Against left wall
    if (data.puzzle.end.x == data.pos.x) { // Endpoint is on the left wall
      if (data.pos.y < data.puzzle.end.y) { // Above endpoint
        if (_push(dx, dy, 'left', 'bottom')) return
      } else if (data.pos.y > data.puzzle.end.y) { // Below endpoint
        if (_push(dx, dy, 'left', 'top')) return
      }
    } else { // Endpoint is not on the left wall
      if (_push(dx, dy, 'left', 'top')) return
    }
  } else if (data.pos.x == data.puzzle.grid.length - 1) { // Against right wall
    if (data.puzzle.end.x == data.pos.x) { // Endpoint is on the right wall
      if (data.pos.y < data.puzzle.end.y) { // Above endpoint
        if (_push(dx, dy, 'right', 'bottom')) return
      } else if (data.pos.y > data.puzzle.end.y) { // Below endpoint
        if (_push(dx, dy, 'right', 'top')) return
      }
    } else { // Endpoint is not on the right wall
      if (_push(dx, dy, 'right', 'top')) return
    }
  }
  if (data.pos.y == 0) { // Against top wall
    if (data.puzzle.end.y == data.pos.y) { // Endpoint is on the top wall
      if (data.pos.x < data.puzzle.end.x) { // Left of endpoint
        if (_push(dx, dy, 'top', 'right')) return
      } else if (data.pos.x > data.puzzle.end.x) { // Right of endpoint
        if (_push(dx, dy, 'top', 'left')) return
      }
    } else { // Endpoint is not on the top wall
      if (_push(dx, dy, 'top', 'right')) return
    }
  } else if (data.pos.y == data.puzzle.grid[data.pos.x].length - 1) { // Against bottom wall
    if (data.puzzle.end.y == data.pos.y) { // Endpoint is on the bottom wall
      if (data.pos.x < data.puzzle.end.x) { // Left of endpoint
        if (_push(dx, dy, 'bottom', 'right')) return
      } else if (data.pos.x > data.puzzle.end.x) { // Right of endpoint
        if (_push(dx, dy, 'bottom', 'left')) return
      }
    } else { // Endpoint is not on the bottom wall
      if (_push(dx, dy, 'bottom', 'right')) return
    }
  }

  // Inner wall collision
  if (data.pos.x%2 == 1 && data.pos.y%2 == 0) { // Horizontal cell
    if (data.x < data.bbox.middle.x) {
      if (_push(dx, dy, 'top', 'left')) return
      if (_push(dx, dy, 'bottom', 'left')) return
    } else {
      if (_push(dx, dy, 'top', 'right')) return
      if (_push(dx, dy, 'bottom', 'right')) return
    }
  } else if (data.pos.x%2 == 0 && data.pos.y%2 == 1) { // Vertical cell
    if (data.y < data.bbox.middle.y) {
      if (_push(dx, dy, 'left', 'top')) return
      if (_push(dx, dy, 'right', 'top')) return
    } else {
      if (_push(dx, dy, 'left', 'bottom')) return
      if (_push(dx, dy, 'right', 'bottom')) return
    }
  }

  // Intersection collision
  // Ratio of movement to be considered turning at an intersection
  var turnMod = 2
  if (data.pos.x%2 == 0 && data.pos.y%2 == 0) {
    if (data.x < data.bbox.middle.x) {
      _push(dx, dy, 'top', 'right')
      _push(dx, dy, 'bottom', 'right')
      // Overshot the intersection and appears to be trying to turn
      if (data.x > data.bbox.middle.x && Math.abs(dy) * turnMod > Math.abs(dx)) {
        data.y += Math.sign(dy) * (data.x - data.bbox.middle.x)
        data.x = data.bbox.middle.x
      }
      return
    } else if (data.x > data.bbox.middle.x) {
      _push(dx, dy, 'top', 'left')
      _push(dx, dy, 'bottom', 'left')
      // Overshot the intersection and appears to be trying to turn
      if (data.x < data.bbox.middle.x && Math.abs(dy) * turnMod > Math.abs(dx)) {
        data.y += Math.sign(dy) * (data.bbox.middle.x - data.x)
        data.x = data.bbox.middle.x
      }
      return
    }
    if (data.y < data.bbox.middle.y) {
      _push(dx, dy, 'left', 'bottom')
      _push(dx, dy, 'right', 'bottom')
      // Overshot the intersection and appears to be trying to turn
      if (data.y > data.bbox.middle.y && Math.abs(dx) * turnMod > Math.abs(dy)) {
        data.x += Math.sign(dx) * (data.y - data.bbox.middle.y)
        data.y = data.bbox.middle.y
      }
      return
    } else if (data.y > data.bbox.middle.y) {
      _push(dx, dy, 'left', 'top')
      _push(dx, dy, 'right', 'top')
      // Overshot the intersection and appears to be trying to turn
      if (data.y < data.bbox.middle.y && Math.abs(dx) * turnMod > Math.abs(dy)) {
        data.x += Math.sign(dx) * (data.bbox.middle.y - data.y)
        data.y = data.bbox.middle.y
      }
      return
    }
  }

  // Normal movement
  data.x += dx
  data.y += dy
}

// Change actual puzzle cells, and limit motion to only puzzle cells.
// Recursion is to allow multi-cell movements.
function _move() {
  if (data.x < data.bbox.x1 + 12) { // Moving left
    var cell = data.puzzle.getCell(data.pos.x - 1, data.pos.y)
    if (cell == false && data.x < data.bbox.x1) {
      data.pos.x--
      data.bbox.shift('left')
      _move()
    } else if (cell == undefined) {
      data.x = data.bbox.x1 + 12
    }
  } else if (data.x > data.bbox.x2 - 12) { // Moving right
    var cell = data.puzzle.getCell(data.pos.x + 1, data.pos.y)
    if (cell == false && data.x > data.bbox.x2) {
      data.pos.x++
      data.bbox.shift('right')
      _move()
    } else if (cell == undefined) {
      data.x = data.bbox.x2 - 12
    }
  }
  if (data.y < data.bbox.y1 + 12) { // Moving up
    var cell = data.puzzle.getCell(data.pos.x, data.pos.y - 1)
    if (cell == false && data.y < data.bbox.y1) {
      data.pos.y--
      data.bbox.shift('top')
      _move()
    } else if (cell == undefined) {
      data.y = data.bbox.y1 + 12
    }
  } else if (data.y > data.bbox.y2 - 12) { // Moving down
    var cell = data.puzzle.getCell(data.pos.x, data.pos.y + 1)
    if (cell == false && data.y > data.bbox.y2) {
      data.pos.y++
      data.bbox.shift('bottom')
      _move()
    } else if (cell == undefined) {
      data.y = data.bbox.y2 - 12
    }
  }
}
