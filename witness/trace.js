var data
function trace(elem) {
  var parent = elem.parentNode
  console.log(parent)
  data = {
    'table':parent.id.split('_')[0],
    'x':parseInt(parent.id.split('_')[1]),
    'y':parseInt(parent.id.split('_')[2]),
    'subx':parseInt(window.getComputedStyle(parent).width)/2,
    'suby':parseInt(window.getComputedStyle(parent).height)/2,
    }
  parent.className = parent.className.replace('untraced', 'traced')

  if (document.pointerLockElement == null) {
    elem.requestPointerLock()
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
    // This isn't really an array, it live updates during iteration
    // var traced_elems = document.getElementsByClassName('traced')
    // while (traced_elems.length > 0) {
    //   traced_elems[0].className = traced_elems[0].className.replace('traced (left|right|up|down)', 'untraced')
    // }
  } else {
    console.log('Cursor lock requested')
    document.addEventListener("mousemove", onMouseMove, false)
  }
}

function _draw(elem, subx, suby, draw_rect) {
  var width = parseInt(window.getComputedStyle(elem).width)
  var height = parseInt(window.getComputedStyle(elem).height)
  var svg = elem.getElementsByTagName('svg')[0]
  if (svg == undefined) {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('viewBox', '0 0 '+width+' '+height)
    svg.style.zIndex = 10
    svg.className = 'traced'
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
  circ.style.cx = suby
  circ.style.cy = subx
  if (draw_rect) {
    rect.style.height = 0
    rect.style.width = 0
    if (elem.className.includes('traced right')) {
      rect.style.height = height
      rect.style.width = suby
    } else if (elem.className.includes('traced left')) {
      rect.style.height = height
      rect.style.width = width - suby
      rect.setAttribute('transform', 'translate('+suby+', 0)')
    } else if (elem.className.includes('traced down')) {
      rect.style.height = subx
      rect.style.width = width
    } else if (elem.className.includes('traced up')) {
      rect.style.height = height - subx
      rect.style.width = width
      rect.setAttribute('transform', 'translate(0, '+subx+')')
    }
    svg.appendChild(rect)
  }
  svg.appendChild(circ)
  elem.appendChild(svg)
}

function onMouseMove(e) {
  var sens = 0.3
  // Caution: reversed
  data.subx += sens*(e.movementY || e.mozMovementY || e.webkitMovementY || 0)
  data.suby += sens*(e.movementX || e.mozMovementX || e.webkitMovementX || 0)
  var elem = document.getElementById(data.table+'_'+data.x+'_'+data.y)
  var width = parseInt(window.getComputedStyle(elem).width)
  var height = parseInt(window.getComputedStyle(elem).height)

  _draw(elem, data.subx, data.suby)

  if (data.subx < 11) { // Moving up
    var new_elem = document.getElementById(data.table+'_'+(data.x-1)+'_'+data.y)
    if (new_elem != null) {
      var new_height = parseInt(window.getComputedStyle(new_elem).height)
      if (new_elem.className.includes('untraced')) { // Trace new path
        console.log('Traced new path up')
        data.x--
        data.subx += new_height
        new_elem.className = new_elem.className.replace('untraced', 'traced up')
        _draw(new_elem, data.subx, data.suby)
      } else if (elem.className.includes('traced down')) { // Retrace path
        data.x--
        data.subx += new_height
        elem.className = elem.className.replace('traced down', 'untraced')
        _draw(new_elem, data.subx, data.suby)
      } else { // Ran into another line
        data.subx = 12
      }
    } else { // Ran into the edge
      data.subx = 12
    }
  } else if (data.subx > height-11) { // Moving down
    var new_elem = document.getElementById(data.table+'_'+(data.x+1)+'_'+data.y)
    if (new_elem != null) {
      if (new_elem.className.includes('untraced')) { // Traced new path
        console.log('Traced new path down')
        data.x++
        data.subx -= height
        new_elem.className = new_elem.className.replace('untraced', 'traced down')
        _draw(new_elem, data.subx, data.suby)
      } else if (elem.className.includes('traced up')) { // Retraced path
        data.x++
        data.subx -= height
        elem.className = elem.className.replace('traced up', 'untraced')
        _draw(elem, data.subx, data.suby)
      } else { // Ran into another line
        data.subx = height-12
      }
    } else { // Ran into the edge
      data.subx = height-12
    }
  }
  if (data.suby < 11) { // Moving left
    var new_elem = document.getElementById(data.table+'_'+data.x+'_'+(data.y-1))
    if (new_elem != null) {
      var new_width = parseInt(window.getComputedStyle(new_elem).width)
      if (new_elem.className.includes('untraced')) { // Traced new path
        data.y--
        data.suby += new_width
        new_elem.className = new_elem.className.replace('untraced', 'traced left')
        _draw(new_elem, data.subx, data.suby)
      } else if (elem.className.includes('traced right')) { // Retraced path
        data.y--
        data.suby += new_width
        elem.className = elem.className.replace('traced right', 'untraced')
        _draw(new_elem, data.subx, data.suby)
      } else { // Ran into another line
        data.suby = 12
      }
    } else { // Ran into the edge
      data.suby = 12
    }
  } else if (data.suby > width-11) { // Moving right
    var new_elem = document.getElementById(data.table+'_'+data.x+'_'+(data.y+1))
    if (new_elem != null) {
      if (new_elem.className.includes('untraced')) { // Traced new path
        console.log('Traced right')
        data.y++
        data.suby -= width
        new_elem.className = new_elem.className.replace('untraced', 'traced right')
        _draw(new_elem, data.subx, data.suby)
      } else if (elem.className.includes('traced left')) { // Retraced path
        console.log('Reraced right')
        data.y++
        data.suby -= width
        elem.className = elem.className.replace('traced left', 'untraced')
        _draw(new_elem, data.subx, data.suby)
      } else { // Ran into another line
        console.log('Collided right')
        data.suby = width-12
      }
    } else { // Ran into the edge
      console.log('Collided right')
      data.suby = width-12
    }
  }
}
