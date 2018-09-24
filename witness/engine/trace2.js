window.BBOX_DEBUG = false

class BoundingBox {
  constructor(x1, x2, y1, y2, endDir) {
    this.raw = {'x1':x1, 'x2':x2, 'y1':y1, 'y2':y2}
    this.endDir = endDir
    this._update()
  }

  shift(dir, pixels) {
    if (dir == 'left') {
      this.raw.x2 = this.raw.x1
      this.raw.x1 -= pixels
    } else if (dir == 'right') {
      this.raw.x1 = this.raw.x2
      this.raw.x2 += pixels
    } else if (dir == 'top') {
      this.raw.y2 = this.raw.y1
      this.raw.y1 -= pixels
    } else if (dir == 'bottom') {
      this.raw.y1 = this.raw.y2
      this.raw.y2 += pixels
    }
    this._update()
  }

  setEnd(dir) {
    this.endDir = dir
    this._update()
  }

  inRaw(x, y) {
    return (
      x.clamp(this.raw.x1, this.raw.x2) == x &&
      y.clamp(this.raw.y1, this.raw.y2) == y
    )
  }

  clone() {
    return new BoundingBox(this.raw.x1, this.raw.x2, this.raw.y1, this.raw.y2, this.endDir)
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

class PathSegment {
  constructor(dir) {
    this.poly1 = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
    this.circ = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    this.poly2 = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
    this.dir = dir
    data.svg.insertBefore(this.circ, data.cursor)
    data.svg.insertBefore(this.poly2, data.cursor)
    this.poly1.setAttribute('class', 'line ' + data.svg.id)
    this.circ.setAttribute('class', 'line ' + data.svg.id)
    this.poly2.setAttribute('class', 'line ' + data.svg.id)
    if (this.dir == 'none') { // Start point
      this.circ.setAttribute('r', 24)
      this.circ.setAttribute('cx', data.bbox.middle.x)
      this.circ.setAttribute('cy', data.bbox.middle.y)
    } else {
      data.svg.insertBefore(this.poly1, data.cursor)
      this.circ.setAttribute('r', 12)
    }
  }

  destroy() {
    data.svg.removeChild(this.poly1)
    data.svg.removeChild(this.circ)
    data.svg.removeChild(this.poly2)
  }

  redraw() { // Uses raw bbox because of endpoints
    var points1 = data.bbox.clone().raw
    if (this.dir == 'left') {
      points1.x1 = data.x.clamp(data.bbox.middle.x, data.bbox.x2)
    } else if (this.dir == 'right') {
      points1.x2 = data.x.clamp(data.bbox.x1, data.bbox.middle.x)
    } else if (this.dir == 'top') {
      points1.y1 = data.y.clamp(data.bbox.middle.y, data.bbox.y2)
    } else if (this.dir == 'bottom') {
      points1.y2 = data.y.clamp(data.bbox.y1, data.bbox.middle.y)
    }
    this.poly1.setAttribute('points',
      points1.x1 + ' ' + points1.y1 + ',' +
      points1.x1 + ' ' + points1.y2 + ',' +
      points1.x2 + ' ' + points1.y2 + ',' +
      points1.x2 + ' ' + points1.y1)

    var pastMiddle = true
    var points2 = data.bbox.clone().raw
    if (data.x < data.bbox.middle.x && this.dir != 'right') {
      points2.x1 = data.x.clamp(data.bbox.x1, data.bbox.middle.x)
      points2.x2 = data.bbox.middle.x
    } else if (data.x > data.bbox.middle.x && this.dir != 'left') {
      points2.x1 = data.bbox.middle.x
      points2.x2 = data.x.clamp(data.bbox.middle.x, data.bbox.x2)
    } else if (data.y < data.bbox.middle.y && this.dir != 'bottom') {
      points2.y1 = data.y.clamp(data.bbox.y1, data.bbox.middle.y)
      points2.y2 = data.bbox.middle.y
    } else if (data.y > data.bbox.middle.y && this.dir != 'top') {
      points2.y1 = data.bbox.middle.y
      points2.y2 = data.y.clamp(data.bbox.middle.y, data.bbox.y2)
    } else if (this.dir != 'none') { // Start point always has circle visible
      pastMiddle = false
    }
    this.poly2.setAttribute('points',
      points2.x1 + ' ' + points2.y1 + ',' +
      points2.x1 + ' ' + points2.y2 + ',' +
      points2.x2 + ' ' + points2.y2 + ',' +
      points2.x2 + ' ' + points2.y1)

    if (pastMiddle) {
      this.circ.setAttribute('opacity', 1)
      this.circ.setAttribute('cx', data.bbox.middle.x)
      this.circ.setAttribute('cy', data.bbox.middle.y)
      this.poly2.setAttribute('opacity', 1)
    } else {
      this.circ.setAttribute('opacity', 0)
      this.poly2.setAttribute('opacity', 0)
    }
  }
}

var data

function _clearGrid(svg, puzzle) {
  while (svg.getElementsByClassName('cursor').length > 0) {
    svg.getElementsByClassName('cursor')[0].remove()
  }

  while (svg.getElementsByClassName('line').length > 0) {
    svg.getElementsByClassName('line')[0].remove()
  }

  puzzle.clearLines()
}

function trace(elem, event, puzzle) {
  var svg = elem.parentElement
  if (document.pointerLockElement == null) { // Started tracing a solution
    PLAY_SOUND('start')
    // Cleans drawn lines & puzzle state
    _clearGrid(svg, puzzle)
    onTraceStart(svg, puzzle, elem)
    elem.requestPointerLock()
  } else {
    event.stopPropagation()
    // Signal the onMouseMove to stop accepting input (race condition)
    data.tracing = false

    // At endpoint and not in raw box -> In true endpoint
    if (puzzle.isEndpoint(data.pos.x, data.pos.y) && !data.bbox.inRaw(data.x, data.y)) {
      data.cursor.onclick = null
      validate(puzzle)

      if (puzzle.valid) {
        PLAY_SOUND('success')
        var animation = 'line-success'
      } else {
        PLAY_SOUND('fail')
        var animation = 'line-fail'
      }
      data.animations.insertRule('.' + svg.id + ' {animation: 1s 1 forwards ' + animation + '}')
    } else if (event.which == 3) { // Right-clicked, not at the end: Clear puzzle
      PLAY_SOUND('abort')
      _clearGrid(svg, puzzle)
    } else { // Exit lock but allow resuming from the cursor
      data.cursor.onclick = function(event) {
        if (this.parentElement != data.svg) return // Another puzzle is live, so data is gone
        data.tracing = true
        elem.requestPointerLock()
      }
    }
    document.exitPointerLock()
  }
}

function onTraceStart(svg, puzzle, start) {
  var x = parseFloat(start.getAttribute('cx'))
  var y = parseFloat(start.getAttribute('cy'))

  var cursor = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
  svg.appendChild(cursor)
  cursor.setAttribute('r', 12)
  cursor.setAttribute('fill', CURSOR)
  cursor.setAttribute('stroke', 'black')
  cursor.setAttribute('stroke-width', '2px')
  cursor.setAttribute('stroke-opacity', '0.4')
  cursor.setAttribute('class', 'cursor')
  cursor.setAttribute('cx', x)
  cursor.setAttribute('cy', y)

  var bboxDebug = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  svg.appendChild(bboxDebug)
  bboxDebug.setAttribute('fill', 'white')
  bboxDebug.setAttribute('opacity', 0.3)
  if (puzzle.start.x%2 == 1) { // Start point is on a horizontal segment
    var bbox = new BoundingBox(x - 29, x + 29, y - 12, y + 12)
  } else if (puzzle.start.y%2 == 1) { // Start point is on a vertical segment
    var bbox = new BoundingBox(x - 12, x + 12, y - 29, y + 29)
  } else { // Start point is at an intersection
    var bbox = new BoundingBox(x - 12, x + 12, y - 12, y + 12)
  }

  data = {
    'tracing':true,
    'bbox':bbox,
    'bboxDebug':bboxDebug,
    'svg':svg,
    // Cursor element and location
    'cursor': cursor,
    'x':x,
    'y':y,
    // Position within puzzle.grid
    'pos':{'x':puzzle.start.x, 'y':puzzle.start.y},
    'puzzle':puzzle,
    'path':[],
  }
  for (var styleSheet of document.styleSheets) {
    if (styleSheet.title == 'animations') {
      data.animations = styleSheet
      break
    }
  }
  for (var i = 0; i < data.animations.cssRules.length; i++) {
    var rule = data.animations.cssRules[i]
    if (rule.selectorText == '.' + svg.id) {
      data.animations.deleteRule(i--)
    }
  }
  data.path.push(new PathSegment('none'))
  data.puzzle.setCell(puzzle.start.x, puzzle.start.y, true)
}

document.onpointerlockchange = function() {
  if (document.pointerLockElement == null ) {
    document.onmousemove = null
    document.ontouchmove = null
    document.onclick = null
    document.ontouchend = null
  } else {
    var sens = document.getElementById('sens').value
    document.onmousemove = function(event) {
      onMove(sens * event.movementX, sens * event.movementY)
    }
    document.ontouchmove = function(event) {
      // TODO: Save the identifier & x/y from the touchstart, then compute deltas
    }
    // document.ontouchend = function(event) {_stopTrace(event)}
  }
}

function onMove(dx, dy) {
  if (!data.tracing) return
  var width = (data.pos.x%2 == 0 ? 24 : 58)
  var height = (data.pos.y%2 == 0 ? 24 : 58)

  // Also handles some collision
  _pushCursor(dx, dy, width, height)

  // Potentially move the location to a new cell, and make absolute boundary checks
  while (true) {
    _gapCollision()
    var moveDir = _move()
    data.path[data.path.length - 1].redraw()
    if (moveDir == 'none') break
    _changePos(moveDir)
  }

  // Move the cursor
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
  if (!data.puzzle.pillar) { // Left/right walls are inner if we're a pillar
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

  // No collision, limit movement to X or Y only to prevent out-of-bounds
  if (Math.abs(dx) > Math.abs(dy)) {
    data.x += dx
  } else {
    data.y += dy
  }
}

function _gapCollision() {
  var lastDir = data.path[data.path.length - 1].dir
  var isGap = false
  for (var gap of data.puzzle.gaps) {
    if (gap.x == data.pos.x && gap.y == data.pos.y) {
      isGap = true
      break
    }
  }
  if (!isGap) return

  if (data.pos.x%2 == 1 && data.pos.y%2 == 0) { // Horizontal cell
    if (lastDir == 'left') {
      data.x = Math.max(data.bbox.middle.x + 21, data.x)
    } else if (lastDir == 'right') {
      data.x = Math.min(data.x, data.bbox.middle.x - 21)
    }
  } else if (data.pos.x%2 == 0 && data.pos.y%2 == 1) { // Vertical cell
    if (lastDir == 'top') {
      data.y = Math.max(data.bbox.middle.y + 21, data.y)
    } else if (lastDir == 'bottom') {
      data.y = Math.min(data.y, data.bbox.middle.y - 21)
    }
  }
}

// Change actual puzzle cells, and limit motion to only puzzle cells.
// Returns the direction moved, or null otherwise.
function _move() {
  var lastDir = data.path[data.path.length - 1].dir

  if (data.x < data.bbox.x1 + 12) { // Moving left
    var cell = data.puzzle.getCell(data.pos.x - 1, data.pos.y)
    if (cell == undefined) {
      data.x = data.bbox.x1 + 12
    } else if (cell == true && lastDir != 'right') {
      data.x = data.bbox.x1 + 12
    } else if (data.x < data.bbox.x1) {
      return 'left'
    }
  } else if (data.x > data.bbox.x2 - 12) { // Moving right
    var cell = data.puzzle.getCell(data.pos.x + 1, data.pos.y)
    if (cell == undefined) {
      data.x = data.bbox.x2 - 12
    } else if (cell == true && lastDir != 'left') {
      data.x = data.bbox.x2 - 12
    } else if (data.x > data.bbox.x2) {
      return 'right'
    }
  } else if (data.y < data.bbox.y1 + 12) { // Moving up
    var cell = data.puzzle.getCell(data.pos.x, data.pos.y - 1)
    if (cell == undefined) {
      data.y = data.bbox.y1 + 12
    } else if (cell == true && lastDir != 'bottom') {
      data.y = data.bbox.y1 + 12
    } else if (data.y < data.bbox.y1) {
      return 'top'
    }
  } else if (data.y > data.bbox.y2 - 12) { // Moving down
    var cell = data.puzzle.getCell(data.pos.x, data.pos.y + 1)
    if (cell == undefined) {
      data.y = data.bbox.y2 - 12
    } else if (cell == true && lastDir != 'top') {
      data.y = data.bbox.y2 - 12
    } else if (data.y > data.bbox.y2) {
      return 'bottom'
    }
  }
  return 'none'
}

function _changePos(moveDir) {
  var lastDir = data.path[data.path.length - 1].dir

  var backedUp = (
    (moveDir == 'left' && lastDir == 'right') ||
    (moveDir == 'right' && lastDir == 'left') ||
    (moveDir == 'top' && lastDir == 'bottom') ||
    (moveDir == 'bottom' && lastDir == 'top'))

  if (backedUp) { // Exited cell, mark as unvisited
    data.path.pop().destroy()
    data.puzzle.setCell(data.pos.x, data.pos.y, false)
  }
  if (moveDir == 'left') {
    data.pos.x--
    if (data.puzzle.pillar && data.pos.x < 0) { // Wrap around the left
      data.x += data.puzzle.grid.length * 41
      data.pos.x += data.puzzle.grid.length
      data.bbox.shift('right', data.puzzle.grid.length * 41 - 82)
      data.bbox.shift('right', 58)
      data.cursor.setAttribute('cx', data.x)
    } else {
      data.bbox.shift('left', (data.pos.x%2 == 0 ? 24 : 58))
    }
  } else if (moveDir == 'right') {
    data.pos.x++
    if (data.puzzle.pillar && data.pos.x >= data.puzzle.grid.length) { // Wrap around to the right
      data.x -= data.puzzle.grid.length * 41
      data.pos.x -= data.puzzle.grid.length
      data.bbox.shift('left', data.puzzle.grid.length * 41 - 82)
      data.bbox.shift('left', 24)
    } else {
      data.bbox.shift('right', (data.pos.x%2 == 0 ? 24 : 58))
    }
  } else if (moveDir == 'top') {
    data.pos.y--
    data.bbox.shift('top', (data.pos.y%2 == 0 ? 24 : 58))
  } else if (moveDir == 'bottom') {
    data.pos.y++
    data.bbox.shift('bottom', (data.pos.y%2 == 0 ? 24 : 58))
  }

  if (data.pos.x%2 == 1 && data.pos.y%2 == 1) {
    console.error('Cursor went out of bounds (into a cell)!')
  }

  if (!backedUp) { // Entered a new cell, mark as visited
    data.path.push(new PathSegment(moveDir))
    data.puzzle.setCell(data.pos.x, data.pos.y, true)
  }

  // Check for endpoint adjustment
  if (data.puzzle.isEndpoint(data.pos.x, data.pos.y)) {
    data.bbox.setEnd(data.puzzle.end.dir)
  } else {
    data.bbox.setEnd(undefined)
  }
}