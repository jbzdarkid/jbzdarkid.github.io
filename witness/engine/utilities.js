/*** Start cross-compatibility ***/
if (!String.prototype.includes) {
  String.prototype.includes = function() {
    return String.prototype.indexOf.apply(this, arguments) !== -1
  }
}
Event.prototype.movementX = Event.prototype.movementX || Event.prototype.mozMovementX
Event.prototype.movementY = Event.prototype.movementY || Event.prototype.mozMovementY
/*** End cross-compatibility ***/

// https://stackoverflow.com/q/11409895
Number.prototype.clamp = function(min, max) {
  return this < min ? min : this > max ? max : this
}

// http://stackoverflow.com/q/901115
var urlParams
(window.onpopstate = function () {
    var match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) {return decodeURIComponent(s.replace(pl, ' '))},
        query  = window.location.search.substring(1)

    urlParams = {}
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

WHITE = 'white'
BLACK = 'black'
RED = 'red'
BLUE = 'blue'
ORANGE = 'orange'
YELLOW = 'yellow'

if (localStorage.theme == "true") { // Dark scheme
  BACKGROUND = '#221' // '#000'
  FOREGROUND = '#751' // '#873'
  BORDER = '#666'
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
  BORDER = '#000'
  LINE_DEFAULT = '#AAA'
  LINE_SUCCESS = '#FFF'
  LINE_FAIL = '#000'
  CURSOR = '#FFF'
  recolor = function() {
    document.body.style.background = '#FFF'
    document.body.style.color = '#000'
  }
}

var animations = '.line { \
  fill: ' + LINE_DEFAULT + '; \
  pointer-events: none; \
} \
@keyframes line-success { \
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
} \
@keyframes error { \
  from {} \
  to {fill: red;} \
}'
var style = document.createElement('style')
style.type = 'text/css'
style.title = 'animations'
style.appendChild(document.createTextNode(animations))
document.head.appendChild(style)

// Custom logging to allow leveling
var console_error = console.error
var console_warn = console.warn
var console_info = console.log
var console_log = console.log
var console_debug = console.log
var console_spam = console.log

function setLogLevel(level) {
  console.error = function() {}
  console.warn = function() {}
  console.info = function() {}
  console.log = function() {}
  console.debug = function() {}
  console.spam = function() {}

  if (level == 'none') return

  // Instead of throw, but still red flags and is easy to find
  console.error = console_error
  if (level == 'error') return

  // Less serious than error, but flagged nonetheless
  console.warn = console_warn
  if (level == 'warn') return

  // Default visible, important information
  console.info = console_info
  if (level == 'info') return

  // Useful for debugging (mainly validation)
  console.log = console_log
  if (level == 'log') return

  // Useful for serious debugging (mainly graphics/misc)
  console.debug = console_debug
  if (level == 'debug') return

  // Useful for insane debugging (mainly tracing)
  console.spam = console_spam
  if (level == 'spam') return
}
setLogLevel('info')
