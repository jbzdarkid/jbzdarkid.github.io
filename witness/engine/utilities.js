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

var styles = {
  'monday':{
    'width':4, 'height':4, 'colors':2, 'difficulty':[50, 100],
    'distribution':{
      'squares':4,
      'stars':4,
    }
  },
  'tuesday':{
    'width':4, 'height':4, 'colors':2, 'difficulty':[1, 9999],
    'distribution':{
      'stars':5,
      'negations':1,
      'dots':25,
    }
  },
  'wednesday':{
    'width':4, 'height':4, 'colors':1, 'difficulty':[1, 9999],
    'distribution':{
      'polyominos':3,
      'triangles':2,
    }
  },
  'thursday':{
    'width':5, 'height':5, 'colors':1, 'difficulty':[1, 9999],
    'distribution':{
      'triangles':12,
      'negations':2,
    }
  },
  'friday':{
    'width':5, 'height':5, 'colors':3, 'difficulty':[1, 9999],
    'pillar':1,
    'distribution':{}
  },
  'saturday':{
    'width':5, 'height':5, 'colors':3, 'difficulty':[1, 9999],
    'symmetry':1,
    'distribution': {}
  },
  'sunday':{
//    'width':6, 'height':6, 'colors':1, 'difficulty':[1, 9999],
    'width':5, 'height':5, 'colors':1, 'difficulty':[1, 9999],
    'pillar':1, 'symmetry':1,
    'distribution':{
      'triangles':1,
      'polyominos':1,
      'stars':1,
      'squares':1,
      'negations':1,
      'dots':1,
      'gaps':1,
    }
  },
}

// From the random panels
RED = '#923A5E'
ORANGE = '#C5714F'
GREEN = '#58864C'
BLUE = '#5697A2'
PURPLE = '#785DAE'

// Bright colors are go
RED = 'red'
ORANGE = 'orange'
GREEN = 'green'
BLUE = 'blue'
PURPLE = 'purple'

BACKGROUND = '#000'
FOREGROUND = '#666'
LINE_SUCC = '#DDD'
LINE_FAIL = '#333'


