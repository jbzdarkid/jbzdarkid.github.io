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
    // var traced_elems = document.getElementsByClassName('traced')
    // while (traced_elems.length > 0) {
    //   traced_elems[0].className = traced_elems[0].className.replace('traced (left|right|up|down)', 'untraced')
    // }
  } else {
    console.log('Cursor lock requested')
    document.addEventListener("mousemove", onMouseMove, false)
  }
}

function onMouseMove(e) {
  var sens = 0.3
  // Caution: reversed
  data.subx += sens*(e.movementY || e.mozMovementY || e.webkitMovementY || 0)
  data.suby += sens*(e.movementX || e.mozMovementX || e.webkitMovementX || 0)
  elem = document.getElementById(data.table+'_'+data.x+'_'+data.y)
  var width = parseInt(window.getComputedStyle(elem).width)
  var height = parseInt(window.getComputedStyle(elem).height)

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
    if (elem.className.includes('traced right')) {
      rect.style.height = height
      rect.style.width = data.suby
      // circ.style.cx = data.suby
      // circ.style.cy = height/2
    } else if (elem.className.includes('traced left')) {
      rect.style.height = height
      rect.style.width = width - data.suby
      rect.setAttribute('transform', 'translate('+data.suby+', 0)')
      // circ.style.cx = data.suby
      // circ.style.cy = height/2
    } else if (elem.className.includes('traced down')) {
      rect.style.height = data.subx
      rect.style.width = width
      // circ.style.cx = width/2
      // circ.style.cy = data.subx
    } else if (elem.className.includes('traced up')) {
      rect.style.height = height - data.subx
      rect.style.width = width
      rect.setAttribute('transform', 'translate(0, '+data.subx+')')
      // circ.style.cx = width/2
      // circ.style.cy = data.subx
    }
    svg.appendChild(rect)
    // svg.appendChild(circ)
    elem.appendChild(svg)
  }
  if (data.subx < 0) {
    console.log('Went up over boundary', data.subx)
    var new_elem = document.getElementById(data.table+'_'+(data.x-1)+'_'+data.y)
    if (new_elem != null) {
      if (new_elem.className.includes('untraced')) {
        data.x--
        data.subx += parseInt(window.getComputedStyle(new_elem).height)
        new_elem.className = new_elem.className.replace('untraced', 'traced up')
      } else if (elem.className.includes('traced down')) {
        data.x--
        data.subx += parseInt(window.getComputedStyle(new_elem).height)
        elem.className = elem.className.replace('traced down', 'untraced')
      } else {
        data.subx = 0
      }
    }
  } else if (data.subx > parseInt(window.getComputedStyle(elem).height)) {
    var new_elem = document.getElementById(data.table+'_'+(data.x+1)+'_'+data.y)
    console.log('90', new_elem)
    if (new_elem != null) {
      if (new_elem.className.includes('untraced')) {
        data.x++
        data.subx -= parseInt(window.getComputedStyle(elem).height)
        new_elem.className = new_elem.className.replace('untraced', 'traced down')
        console.log(data.subx)
      } else if (elem.className.includes('traced up')) {
        data.x++
        data.subx -= parseInt(window.getComputedStyle(elem).height)
        console.log(data.subx)
        elem.className = elem.className.replace('traced up', 'untraced')
      } else {
        data.subx = parseInt(window.getComputedStyle(elem).height)
      }
    }
  }
  if (data.suby < 0) {
    var new_elem = document.getElementById(data.table+'_'+data.x+'_'+(data.y-1))
    if (new_elem != null) {
      if (new_elem.className.includes('untraced')) {
        data.y--
        data.suby += parseInt(window.getComputedStyle(new_elem).width)
        new_elem.className = new_elem.className.replace('untraced', 'traced left')
      } else if (elem.className.includes('traced right')) {
        data.y--
        data.suby += parseInt(window.getComputedStyle(new_elem).width)
        elem.className = elem.className.replace('traced right', 'untraced')
      } else {
        data.suby = 0
      }
    }
  } else if (data.suby > parseInt(window.getComputedStyle(elem).width)) {
    var new_elem = document.getElementById(data.table+'_'+data.x+'_'+(data.y+1))
    if (new_elem != null) {
      if (new_elem.className.includes('untraced')) {
        data.y++
        data.suby -= parseInt(window.getComputedStyle(elem).width)
        new_elem.className = new_elem.className.replace('untraced', 'traced right')
      } else if (elem.className.includes('traced left')) {
        data.y++
        data.suby -= parseInt(window.getComputedStyle(elem).width)
        elem.className = elem.className.replace('traced left', 'untraced')
      } else {
        data.suby = parseInt(window.getComputedStyle(elem).width)
      }
    }
  }
}
