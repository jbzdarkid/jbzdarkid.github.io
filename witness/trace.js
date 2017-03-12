var pos
function trace(elem) {
  var data = elem.parentNode.id.split('_')
  pos = {
    'table':data[0],
    'x':parseInt(data[1]),
    'y':parseInt(data[2]),
    'subx':20,
    'suby':10,
    }
  elem.className = 'traced'

  if (document.pointerLockElement == null) {
    elem.requestPointerLock()
  } else {
    document.exitPointerLock()
  }
}

document.addEventListener('pointerlockchange', lockChange, false);
document.addEventListener('mozpointerlockchange', lockChange, false);
document.addEventListener('webkitpointerlockchange', lockChange, false);
function lockChange() {
  if (document.pointerLockElement == null) {
    console.log('Cursor release requested')
    document.removeEventListener("mousemove", onMouseMove, false);
    // This isn't really an array, it live updates during iteration
    var traced_elems = document.getElementsByClassName('traced')
    while (traced_elems.length > 0) {
      traced_elems[0].className = 'untraced'
    }
  } else {
    console.log('Cursor lock requested')
    document.addEventListener("mousemove", onMouseMove, false);
  }
}

function onMouseMove(e) {
  // Caution: reversed
  pos.subx += e.movementY || e.mozMovementY || e.webkitMovementY || 0
  pos.suby += e.movementX || e.mozMovementX || e.webkitMovementX || 0

  elem = document.getElementById(pos.table+'_'+pos.x+'_'+pos.y)
  var width = parseInt(elem.style.width)
  var height = parseInt(elem.style.height)

  console.log(pos)
  if (pos.subx < 0) {
    var new_elem = document.getElementById(pos.table+'_'+(pos.x-1)+'_'+pos.y)
    if (new_elem != null) {
      pos.x--
      pos.subx += width
      if (new_elem.className == 'untraced') {
        new_elem.className = 'traced'
      } else if (new_elem.className = 'traced') {
        elem.className = 'untraced'
      }
    }
  } else if (pos.subx > width) {
    var new_elem = document.getElementById(pos.table+'_'+(pos.x+1)+'_'+pos.y)
    if (new_elem != null) {
      pos.x++
      pos.subx -= width
      if (new_elem.className == 'untraced') {
        new_elem.className = 'traced'
      } else if (new_elem.className = 'traced') {
        elem.className = 'untraced'
      }
    }
  }
  if (pos.suby < 0) {
    var new_elem = document.getElementById(pos.table+'_'+pos.x+'_'+(pos.y-1))
    if (new_elem != null) {
      pos.y--
      pos.suby += height
      if (new_elem.className == 'untraced') {
        new_elem.className = 'traced'
      } else if (new_elem.className = 'traced') {
        elem.className = 'untraced'
      }
    }
  } else if (pos.suby > height) {
    var new_elem = document.getElementById(pos.table+'_'+pos.x+'_'+(pos.y+1))
    if (new_elem != null) {
      pos.y++
      pos.suby -= height
      if (new_elem.className == 'untraced') {
        new_elem.className = 'traced'
      } else if (new_elem.className = 'traced') {
        elem.className = 'untraced'
      }
    }
  }
}
