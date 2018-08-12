/*** Start cross-compatibility ***/
if (!String.prototype.includes) {
  String.prototype.includes = function() {
    return String.prototype.indexOf.apply(this, arguments) !== -1
  }
}
document.pointerLockElement = document.pointerLockElement && document.mozPointerLockElement
document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock
Element.prototype.requestPointerLock = Element.prototype.requestPointerLock || Element.prototype.mozRequestPointerLock
Event.prototype.movementX = Event.prototype.movementX || Event.prototype.mozMovementX
Event.prototype.movementY = Event.prototype.movementY || Event.prototype.mozMovementY
/*** End cross-compatibility ***/

// http://stackoverflow.com/q/901115
var urlParams
(window.onpopstate = function () {
    var match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) {return decodeURIComponent(s.replace(pl, ' '))},
        query  = window.location.search.substring(1)

    urlParams = {};
    while (match = search.exec(query))
       urlParams[decode(match[1])] = decode(match[2])
})()

var tracks = {
  'start': new Audio('/witness/audio/panel_start_tracing.ogg'),
  'success': new Audio('/witness/audio/panel_success.ogg'),
  'fail': new Audio('/witness/audio/panel_failure.ogg'),
  'abort': new Audio('/witness/audio/panel_abort_tracing.ogg')
}

function PLAY_SOUND(track) {
  console.log('Playing sound:', track)
  for (var audio of Object.values(tracks)) {
    audio.pause()
    audio.currentTime = 0
  }
  tracks[track].volume = 0.1
  tracks[track].play()
}

window.DISABLE_CACHE = false

WHITE = 'white'
BLACK = 'black'
RED = 'red'
BLUE = 'blue'
ORANGE = 'orange'
YELLOW = 'yellow'

if (localStorage.theme == "true") { // Dark scheme
  BACKGROUND = '#221' // '#000'
  FOREGROUND = '#751' // '#873'
  BORDER = '10px solid #666'
  LINE_DEFAULT = '#888' // '#FD8'
  LINE_SUCCESS = '#BBB' // '#FA0'
  LINE_FAIL = '#000'
  CURSOR = '#FFF'
  recolor = function() {
    document.body.style.background = '#000'
    document.body.style.color = '#CCC'
  }
} else { // Light scheme
  BACKGROUND = '#0A8'
  FOREGROUND = '#344'
  BORDER = '10px solid #000'
  LINE_DEFAULT = '#AAA'
  LINE_SUCCESS = '#FFF'
  LINE_FAIL = '#000'
  CURSOR = '#FFF'
  recolor = function() {
    document.body.style.background = '#FFF'
    document.body.style.color = '#000'
  }
}


var animations = '@keyframes line-success { \
  from {fill: ' + LINE_DEFAULT + ';} \
  to {fill: ' + LINE_SUCCESS + ';} \
} \
@keyframes line-fail { \
  from {fill: ' + LINE_DEFAULT + ';} \
  to {fill: ' + LINE_FAIL + ';} \
} \
@keyframes start-grow { \
  from {height: 12; width: 12; top: 6; left: 6;} \
  to {height: 48; width: 48; top: -12; left: -12;} \
}';
var style = document.createElement('style')
style.type = 'text/css'
style.title = 'animations'
style.appendChild(document.createTextNode(animations))
document.head.appendChild(style)

/*
Light:
Background is a light teal 009999
Foreground is a dark teal 223333
Stones are White/Black
Dots are black
Colored dots are green 99EE99 and orange
Stars are yellow?

Dark:
Background is a dark brown 222200
Foreground is a mid brown 665511
Dots are Orange



*/

