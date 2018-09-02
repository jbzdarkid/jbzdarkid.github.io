window.BBOX_DEBUG = false

class BoundingBox {
  constructor(x1, x2, y1, y2) {
    this.raw = {'x1':x1, 'x2':x2, 'y1':y1, 'y2':y2}
    this.endDir = undefined
    this._update()
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
    this._update()
  }

  setEnd(dir) {
    this.endDir = dir
    this._update()
  }

  _update() {
    this.x1 = this.raw.x1 + (this.endDir == 'left' ? -24 : 0)
    this.x2 = this.raw.x2 + (this.endDir == 'right' ? 24 : 0)
    this.y1 = this.raw.y1 + (this.endDir == 'top' ? -24 : 0)
    this.y2 = this.raw.y2 + (this.endDir == 'bottom' ? 24 : 0)
    this.middle = { // Note: Middle of the raw object
      'x':(this.raw.x1 + this.raw.x2)/2,
      'y':(this.raw.y1 + this.raw.y2)/2
    }
  }
}

var data

function trace(elem, puzzle) {
  if (document.pointerLockElement == null) { // Started tracing a solution
    PLAY_SOUND('start')
    // Clean previous state
    var svg = elem.parentElement

    while (svg.getElementsByClassName('cursor').length > 0) {
      svg.getElementsByClassName('cursor')[0].remove()
    }

    var cursor = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    elem.parentElement.appendChild(cursor)
    cursor.setAttribute('r', 12)
    cursor.setAttribute('fill', CURSOR)
    cursor.setAttribute('stroke', 'black')
    cursor.setAttribute('stroke-width', '2px')
    cursor.setAttribute('stroke-opacity', '0.4')
    cursor.setAttribute('class', 'cursor')
    var cx = parseFloat(elem.getAttribute('cx'))
    var cy = parseFloat(elem.getAttribute('cy'))
    cursor.setAttribute('cx', cx)
    cursor.setAttribute('cy', cy)

    var bboxDebug = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    elem.parentElement.appendChild(bboxDebug)
    bboxDebug.setAttribute('fill', 'white')
    bboxDebug.setAttribute('opacity', 0.3)

    data = {
      'tracing':true,
      'bbox':new BoundingBox(cx - 12, cx + 12, cy - 12, cy + 12),
      'bboxDebug':bboxDebug,
      // Cursor element and location
      'cursor': cursor,
      'x':cx,
      'y':cy,
      // Position within puzzle.grid
      'pos':{'x':puzzle.start.x, 'y':puzzle.start.y},
      'puzzle':puzzle,
    }
    elem.requestPointerLock()
  } else {
    event.stopPropagation()
    // Signal the onMouseMove to stop accepting input (race condition)
    data.tracing = false

    if (!"ended in an endpoint" && false) {
      // Resume tracing from cursor?
      PLAY_SOUND('abort')
    } else {
      validate(data.puzzle)

      if (data.puzzle.valid) {
        PLAY_SOUND('success')
      } else {
        PLAY_SOUND('fail')
      }
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
  var width = (data.pos.x%2 == 0 ? 24 : 58)
  var height = (data.pos.y%2 == 0 ? 24 : 58)

  // Also handles some collision
  _pushCursor(dx, dy, width, height)

  // Potentially move the location to a new cell, and make absolute boundary checks
  _move()

  // redraw (?)
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
  if (target_dir == 'left' || target_dir == 'top') {
    var movementRatio = -3
  } else if (target_dir == 'right' || target_dir == 'bottom') {
    var movementRatio = 3
  }

  if (dir == 'left') {
    var overshoot = data.bbox.x1 - (data.x + dx) + 12
    if (overshoot > 0) {
      data.y += dy + overshoot / movementRatio
      data.x = data.bbox.x1 + 12
      return true
    }
  } else if (dir == 'right') {
    var overshoot = (data.x + dx) - data.bbox.x2 + 12
    if (overshoot > 0) {
      data.y += dy + overshoot / movementRatio
      data.x = data.bbox.x2 - 12
      return true
    }
  } else if (dir == 'leftright') {
    data.y += dy + Math.abs(dx) / movementRatio
    return true
  } else if (dir == 'top') {
    var overshoot = data.bbox.y1 - (data.y + dy) + 12
    if (overshoot > 0) {
      data.x += dx + overshoot / movementRatio
      data.y = data.bbox.y1 + 12
      return true
    }
  } else if (dir == 'bottom') {
    var overshoot = (data.y + dy) - data.bbox.y2 + 12 
    if (overshoot > 0) {
      data.x += dx + overshoot / movementRatio
      data.y = data.bbox.y2 - 12
      return true
    }
  } else if (dir == 'topbottom') {
    data.x += dx + Math.abs(dy) / movementRatio
    return true
  }
  return false
}

function _pushCursor(dx, dy, width, height) {
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
      _push(dx, dy, 'topbottom', 'left')
    } else {
      _push(dx, dy, 'topbottom', 'right')
    }
    return
  } else if (data.pos.x%2 == 0 && data.pos.y%2 == 1) { // Vertical cell
    if (data.y < data.bbox.middle.y) {
      _push(dx, dy, 'leftright', 'top')
    } else {
      _push(dx, dy, 'leftright', 'bottom')
    }
    return
  }

  // Intersection collision
  // Ratio of movement to be considered turning at an intersection
  var turnMod = 2
  if (data.pos.x%2 == 0 && data.pos.y%2 == 0) {
    if (data.x < data.bbox.middle.x) {
      _push(dx, dy, 'topbottom', 'right')
      // Overshot the intersection and appears to be trying to turn
      if (data.x > data.bbox.middle.x && Math.abs(dy) * turnMod > Math.abs(dx)) {
        data.y += Math.sign(dy) * (data.x - data.bbox.middle.x)
        data.x = data.bbox.middle.x
      }
      return
    } else if (data.x > data.bbox.middle.x) {
      _push(dx, dy, 'topbottom', 'left')
      // Overshot the intersection and appears to be trying to turn
      if (data.x < data.bbox.middle.x && Math.abs(dy) * turnMod > Math.abs(dx)) {
        data.y += Math.sign(dy) * (data.bbox.middle.x - data.x)
        data.x = data.bbox.middle.x
      }
      return
    }
    if (data.y < data.bbox.middle.y) {
      _push(dx, dy, 'leftright', 'bottom')
      // Overshot the intersection and appears to be trying to turn
      if (data.y > data.bbox.middle.y && Math.abs(dx) * turnMod > Math.abs(dy)) {
        data.x += Math.sign(dx) * (data.y - data.bbox.middle.y)
        data.y = data.bbox.middle.y
      }
      return
    } else if (data.y > data.bbox.middle.y) {
      _push(dx, dy, 'leftright', 'top')
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

  if (data.pos.x == data.puzzle.end.x && data.pos.y == data.puzzle.end.y) {
    data.bbox.setEnd(data.puzzle.end.dir)
  } else {
    data.bbox.setEnd(undefined)
  }
}
