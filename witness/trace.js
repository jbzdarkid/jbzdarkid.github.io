var data
function trace(elem) {
  var parent = elem.parentNode
  var width = parseInt(window.getComputedStyle(parent).width)
  var height = parseInt(window.getComputedStyle(parent).height)
  data = {
    'table':parent.id.split('_')[0],
    'x':parseInt(parent.id.split('_')[2]),
    'y':parseInt(parent.id.split('_')[1]),
    'subx':width/2,
    'suby':height/2,
    }

  if (document.pointerLockElement == null) {
    // These aren't really arrays, they live update during iteration
    for (var cell of document.getElementsByTagName('td')) {
      cell.className = cell.className.split('-')[0]
    }
    var svgs = document.getElementsByTagName('svg')
    while (svgs.length > 0) {
      svgs[0].remove()
    }

    elem.requestPointerLock()
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('viewBox', '0 0 '+width+' '+height)
    svg.style.zIndex = 10
    var circ = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    circ.style.cx = '11px'
    circ.style.cy = '11px'
    circ.style.border = '0px'
    circ.style.fill = '#6D4D4A'
    var anim = document.createElementNS('http://www.w3.org/2000/svg', 'animate')
    anim.setAttribute('attributeName', 'r')
    anim.setAttribute('from', '0')
    anim.setAttribute('to', '11')
    anim.setAttribute('dur', '0.2s')
    setTimeout(function () {circ.style.r = '11px'}, 201)
    circ.appendChild(anim)
    svg.appendChild(circ)
    elem.appendChild(svg)
  } else {
    document.exitPointerLock()
  }
}

document.addEventListener('pointerlockchange', lockChange, false)
document.addEventListener('mozpointerlockchange', lockChange, false)
document.addEventListener('webkitpointerlockchange', lockChange, false)
function lockChange() {
  if (document.pointerLockElement == null) {
    console.log('Cursor release requested')
    document.removeEventListener("mousemove", onMouseMove, false)
  } else {
    console.log('Cursor lock requested')
    document.addEventListener("mousemove", onMouseMove, false)
  }
}

function _draw(elem, subx, suby, draw_rect) {
  if (elem == null) return
  if (elem.className.includes('start')) return
  var width = parseInt(window.getComputedStyle(elem).width)
  var height = parseInt(window.getComputedStyle(elem).height)
  var svg = elem.getElementsByTagName('svg')[0]
  if (svg == undefined) {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('viewBox', '0 0 '+width+' '+height)
    svg.style.zIndex = 10
  }
  var rect = svg.getElementsByTagName('rect')[0]
  if (rect == undefined) {
    rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.style.fill = '#6D4D4A'
  }
  var circ = svg.getElementsByTagName('circle')[0]
  if (circ == undefined) {
    circ = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    circ.style.r = 11
    circ.style.fill = '#A69191'
    circ.style.stroke = 'black'
    circ.style.strokeOpacity = '0.3'
  }
  circ.style.cx = subx
  circ.style.cy = suby
  if (draw_rect) {
    rect.style.height = 0
    rect.style.width = 0
    rect.style.rx = 0
    rect.setAttribute('transform', '')

    var enter_dir = elem.className.split('-')[1]
    var exit_dir = elem.className.split('-')[2]
    if (enter_dir == null) {
      // Never entered this segment, do nothing
    } else if (exit_dir == null) {
      // Still in this segment, draw a partial
      if (enter_dir == 'r') {
        rect.style.width = subx
        rect.style.height = height
      } else if (enter_dir == 'l') {
        rect.style.width = width - subx
        rect.style.height = height
        rect.setAttribute('transform', 'translate('+subx+', 0)')
      } else if (enter_dir == 'd') {
        rect.style.width = width
        rect.style.height = suby
      } else if (enter_dir == 'u') {
        rect.style.width = width
        rect.style.height = height - suby
        rect.setAttribute('transform', 'translate(0, '+suby+')')
      }
    } else if (enter_dir == exit_dir) {
      // Passed through in a straight line, fill the entirety
      rect.style.width = width
      rect.style.height = height
    } else {
      // Passed through in a corner, create as such
      rect.style.rx = width
      rect.style.width = width*2
      rect.style.height = height*2
      var x_trans = 0
      var y_trans = 0
      if (enter_dir == 'd' || exit_dir == 'u') {
        x_trans = -width
      }
      if (enter_dir == 'r' || exit_dir == 'l') {
        y_trans = -height
      }
      rect.setAttribute('transform', 'translate('+y_trans+', '+x_trans+')')
    }
    svg.appendChild(rect)
  }
  svg.appendChild(circ)
  elem.appendChild(svg)
}

function onMouseMove(e) {
  var sens = 0.3
  var dx = e.movementX || e.mozMovementX || e.webkitMovementX || 0
  var dy = e.movementY || e.mozMovementY || e.webkitMovementY || 0
  data.subx += dx*sens
  data.suby += dy*sens
  var elem = document.getElementById(data.table+'_'+data.y+'_'+data.x)
  var width = parseInt(window.getComputedStyle(elem).width)
  var height = parseInt(window.getComputedStyle(elem).height)

  // FIXME: Can I just use this for all collision detection? If so, eliminates the need for dx?
  // Calculates the distance to the edge in each direction
  if (elem.className.includes('corner')) {
    var dist_x = (data.subx < width/2) ? data.subx : width - data.subx
    var dist_y = (data.suby < height/2) ? data.suby : height - data.suby
    // Reduce the larger distance to 0
    if (dist_x > dist_y) { // FIXME: Reverse?
      if (data.subx - 11 < 0) data.subx = 11
      if (data.subx + 11 > width) data.subx = width - 11
    } else {
      if (data.suby - 11 < 0) data.suby = 11
      if (data.suby + 11 > height) data.suby = height - 11
    }
  }

  // Collision detection
  if (dx < 0 && data.subx - 11 < 0) {
    var new_elem = document.getElementById(data.table+'_'+data.y+'_'+(data.x-1))
    if (new_elem == null) {
      data.subx = 11
    } else if (!(new_elem.className.endsWith('trace') ||elem.className.endsWith('trace-r'))) {
      data.subx = 11
    }
  } else if (dx > 0 && data.subx + 11 > width) {
    var new_elem = document.getElementById(data.table+'_'+data.y+'_'+(data.x+1))
    if (new_elem == null) {
      data.subx = width - 11
    } else if (!(new_elem.className.endsWith('trace') ||elem.className.endsWith('trace-l'))) {
      data.subx = width - 11
    }
  }
  if (dy < 0 && data.suby - 11 < 0) {
    var new_elem = document.getElementById(data.table+'_'+(data.y-1)+'_'+data.x)
    if (new_elem == null) {
      data.suby = 11
    } else if (!(new_elem.className.endsWith('trace') ||elem.className.endsWith('trace-d'))) {
      data.suby = 11
    }
  } else if (dy > 0 && data.suby + 11 > height) {
    var new_elem = document.getElementById(data.table+'_'+(data.y+1)+'_'+data.x)
    if (new_elem == null) {
      data.suby = height - 11
    } else if (!(new_elem.className.endsWith('trace') ||elem.className.endsWith('trace-u'))) {
      data.suby = height - 11
    }
  }

  // Redraw all elements near the cursor
  for (var x=-1; x<=1; x++) {
    for (var y=-1; y<=1; y++) {
      var temp_elem = document.getElementById(data.table+'_'+(data.y+y)+'_'+(data.x+x))
      if (temp_elem == null) continue
      var temp_width = width
      var temp_height = height
      if (x == -1) {
        temp_width = parseInt(window.getComputedStyle(temp_elem).width)
      }
      if (y == -1) {
        temp_height = parseInt(window.getComputedStyle(temp_elem).height)
      }
      if (x == 0 || y == 0) {
        _draw(temp_elem, data.subx - x * temp_width, data.suby - y * temp_height, true)
      } else {
        _draw(temp_elem, data.subx - x * temp_width, data.suby - y * temp_height, false)
      }
    }
  }

  // Generic movement
  if (data.subx < 0) { // Moving left
    var new_elem = document.getElementById(data.table+'_'+data.y+'_'+(data.x-1))
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
    var new_elem = document.getElementById(data.table+'_'+data.y+'_'+(data.x+1))
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
    var new_elem = document.getElementById(data.table+'_'+(data.y-1)+'_'+data.x)
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
    var new_elem = document.getElementById(data.table+'_'+(data.y+1)+'_'+data.x)
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
