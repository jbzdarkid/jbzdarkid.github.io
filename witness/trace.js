function trace(elem) {
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
  } else {
    console.log('Cursor lock requested')
    document.addEventListener("mousemove", onMouseMove, false);
  }
}
function onMouseMove(e) {
  var movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0
  var movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0
  console.log(e)

  // Do something...
  console.log(movementX, movementY)
}
