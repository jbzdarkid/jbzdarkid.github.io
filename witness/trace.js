var data
function trace(elem) {
  var parent = elem.parentNode
  data = {
    'table':parent.id.split('_')[0],
    'x':parseInt(parent.id.split('_')[1]),
    'y':parseInt(parent.id.split('_')[2]),
    'subx':parseInt(parent.style.width)/2,
    'suby':parseInt(parent.style.height)/2,
    }
  elem.parentNode.className = 'traced'

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
    var traced_elems = document.getElementsByClassName('traced')
    while (traced_elems.length > 0) {
      traced_elems[0].className = 'untraced'
    }
  } else {
    console.log('Cursor lock requested')
    document.addEventListener("mousemove", onMouseMove, false)
  }
}

function onMouseMove(e) {
  var sens = 0.5
  // Caution: reversed
  data.subx += sens*(e.movementY || e.mozMovementY || e.webkitMovementY || 0)
  data.suby += sens*(e.movementX || e.mozMovementX || e.webkitMovementX || 0)

  elem = document.getElementById(data.table+'_'+data.x+'_'+data.y)
  var width = parseInt(elem.style.width)
  var height = parseInt(elem.style.height)


  if (elem.className != 'traced') {
    try {
      elem.childNodes[0].remove()
    } catch (e) {}
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('viewBox', '0 0 '+width+' '+height)
    svg.className = 'traced'
    var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    var circ = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    circ.style.r = '50px'
    // rect.style.rx = '100px'
    if (elem.className == 'traced right') {
      rect.style.height = height
      rect.style.width = data.suby
      circ.style.cx = data.suby
      circ.style.cy = height/2
    } else if (elem.className == 'traced left') {
      rect.style.height = height
      rect.style.width = width - data.suby
      rect.setAttribute('transform', 'translate('+data.suby+', 0)')
      circ.style.cx = data.suby
      circ.style.cy = height/2
    } else if (elem.className == 'traced up') {
      rect.style.height = data.subx
      rect.style.width = width
      circ.style.cx = (width/2)
      circ.style.cy = data.subx
    } else if (elem.className == 'traced down') {
      rect.style.height = height - data.subx
      rect.style.width = width
      rect.setAttribute('transform', 'translate(0, '+data.subx+')')
      circ.style.cx = (width/2)
      circ.style.cy = data.subx
    }
    svg.appendChild(rect)
    svg.appendChild(circ)
    elem.appendChild(svg)
  }

  if (data.subx < 0) {
    var new_elem = document.getElementById(data.table+'_'+(data.x-1)+'_'+data.y)
    if (new_elem != null) {
      if (new_elem.className == 'untraced') {
        data.x--
        data.subx += width
        new_elem.className = 'traced down'
      } else if (elem.className == 'traced up') {
        data.x--
        data.subx += width
        elem.className = 'untraced'
      } else {
        data.subx = 0
      }
    }
  } else if (data.subx > width) {
    var new_elem = document.getElementById(data.table+'_'+(data.x+1)+'_'+data.y)
    if (new_elem != null) {
      if (new_elem.className == 'untraced') {
        data.x++
        data.subx -= width
        new_elem.className = 'traced up'
      } else if (elem.className == 'traced down') {
        data.x++
        data.subx -= width
        elem.className = 'untraced'
      } else {
        data.subx = width
      }
    }
  }
  if (data.suby < 0) {
    var new_elem = document.getElementById(data.table+'_'+data.x+'_'+(data.y-1))
    if (new_elem != null) {
      if (new_elem.className == 'untraced') {
        data.y--
        data.suby += height
        new_elem.className = 'traced left'
      } else if (elem.className == 'traced right') {
        data.y--
        data.suby += height
        elem.className = 'untraced'
      } else {
        data.suby = 0
      }
    }
  } else if (data.suby > height) {
    var new_elem = document.getElementById(data.table+'_'+data.x+'_'+(data.y+1))
    if (new_elem != null) {
      if (new_elem.className == 'untraced') {
        data.y++
        data.suby -= height
        new_elem.className = 'traced right'
      } else if (elem.className == 'traced left') {
        data.y++
        data.suby -= height
        elem.className = 'untraced'
      } else {
        data.suby = height
      }
    }
  }
}
