/*** Firefox compatibility ***/
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

/*** End Firefox compatibility ***/

class Puzzle {
  constructor(width, height) {
    this.grid  = this.newGrid(width, height)
    this.start = {'x':null, 'y':null}
    this.end   = {'x':null, 'y':null}
    this.dots  = []
    this.gaps  = []
    this.toString = function() {
      return 'Puzzle object:\n'+
        'Start: '+this.start.x+' '+this.start.y+'\n'+
        'End: '+this.end.x+' '+this.end.y+'\n'+
        'Dots: ['+this.dots+']\n'+
        'Gaps: ['+this.gaps+']\n'+
        'Grid ('+this.grid.length+' by '+this.grid[0].length+'):\n'+
        this.gridString()
    }
  }

  gridString() {
    var str = ''
    for (var row of this.grid) {
      var rowStr = ''
      for (var cell of row) {
        if (cell == false) {
          rowStr += ' '
        } else if (cell == true) {
          rowStr += '#'
        } else {
          rowStr += '?'
        }
      }
      str += '[' + rowStr + ']\n'
    }
    return str
  }


  grid(x, y=null) {
    if (y == null) {
      // Passed in a value like {'x':x, 'y':y}
      y = x.y
      x = x.x
    }
    return this.grid[x][y]
  }

  newGrid(width, height) {
    var grid = []
    for (var i=0; i<2*width+1; i++) {
      grid[i] = []
      for (var j=0; j<2*height+1; j++) {
        grid[i][j] = false
      }
    }
    return grid
  }

  clone() {
    return {
      'grid':this.copyGrid(this.grid),
      'start':{'x':this.start.x, 'y':this.start.y},
      'end':{'x':this.end.x, 'y':this.end.y},
      'dots':this.dots.slice(),
      'gaps':this.gaps.slice()
    }
  }

  copyGrid() {
    var new_grid = []
    for (var row of this.grid) {
      new_grid.push(row.slice())
    }
    return new_grid
  }
}

Puzzle.prototype.toString = function() {
  return 'Puzzle object:\n'+
    'Start: '+this.start.x+' '+this.start.y+'\n'+
    'End: '+this.end.x+' '+this.end.y+'\n'+
    'Dots: '+this.dots.toString()+'\n'+
    'Gaps: '+this.gaps.toString()+'\n'+
    'Grid: '+this.grid.length+' by '+this.grid[0].length+':\n'+
    this.grid.toString()
}


function _copyGrid(width, height) { // FIXME: Deprecated
  var new_grid = []
  for (var row of grid) {
    new_grid.push(row.slice())
  }
  return new_grid
}

// A 2x2 grid is internally a 5x5:
// Corner, edge, corner, edge, corner
// Edge,   cell, edge,   cell, edge
// Corner, edge, corner, edge, corner
// Edge,   cell, edge,   cell, edge
// Corner, edge, corner, edge, corner
//
// Corners and edges will have a value of true if the line passes through them
// Cells will contain an object if there is an element in them
function _newGrid(width, height) { // FIXME: Deprecated
  var grid = []
  for (var i=0; i<2*width+1; i++) {
    grid[i] = []
    for (var j=0; j<2*height+1; j++) {
      grid[i][j] = false
    }
  }
  return grid
}

// Returns the contiguous regions on the grid, as arrays of points.
// The return array may contain empty cells.
function _getRegions(grid) { // FIXME: Should I deprecate this?
  var colors = []
  for (var x=0; x<grid.length; x++) {
    colors[x] = []
    for (var y=0; y<grid[x].length; y++) {
      colors[x][y] = 0
    }
  }

  var regions = []
  var unvisited = [{'x':1, 'y':1}]
  var localRegion = []

  while (unvisited.length > 0) {
    regions[regions.length] = []
    localRegion.push(unvisited.pop())
    while (localRegion.length > 0) {
      var cell = localRegion.pop()
      if (colors[cell.x][cell.y] != 0) {
        continue
      } else {
        colors[cell.x][cell.y] = regions.length
        regions[regions.length-1].push(cell)
      }
      if (cell.x < colors.length-2 && colors[cell.x+2][cell.y] == 0) {
        if (grid[cell.x+1][cell.y] == 0) {
          localRegion.push({'x':cell.x+2, 'y':cell.y})
        } else {
          unvisited.push({'x':cell.x+2, 'y':cell.y})
        }
      }
      if (cell.y < colors[cell.x].length-2 && colors[cell.x][cell.y+2] == 0) {
        if (grid[cell.x][cell.y+1] == 0) {
          localRegion.push({'x':cell.x, 'y':cell.y+2})
        } else {
          unvisited.push({'x':cell.x, 'y':cell.y+2})
        }
      }
      if (cell.x > 1 && colors[cell.x-2][cell.y] == 0) {
        if (grid[cell.x-1][cell.y] == 0) {
          localRegion.push({'x':cell.x-2, 'y':cell.y})
        } else {
          unvisited.push({'x':cell.x-2, 'y':cell.y})
        }
      }
      if (cell.y > 1 && colors[cell.x][cell.y-2] == 0) {
        if (grid[cell.x][cell.y-1] == 0) {
          localRegion.push({'x':cell.x, 'y':cell.y-2})
        } else {
          unvisited.push({'x':cell.x, 'y':cell.y-2})
        }
      }
    }
  }

  // console.log('Computed region map, colors:', colors)
  return regions
}
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

function closeWindow(accept) {
    document.body.removeChild(document.getElementById('cookieWarning'))
    if (!accept) {
        navigator.doNotTrack = '1'
    } else {
        localStorage.seenWarning = true
    }
}

function saveSens() {
    if (navigator.doNotTrack == '1' || navigator.doNotTrack == 'yes' || window.doNotTrack == '1') {
        return
    }
    localStorage.sensitivity = document.getElementById('sens').value
}

var styles = {
  'monday':{
    'width':4, 'height':4, 'colors':2, 'difficulty':[50, 100],
    'distribution':{
      'squares':4,
      'stars':4,
    }
  },
  'tuesday':{
    'width':4, 'height':4, 'colors':1, 'difficulty':[1, 9999],
    'distribution':{
      'polyominos':3,
      'triangles':2,
    }
  },
  'wednesday':{
    'width':4, 'height':4, 'colors':2, 'difficulty':[1, 9999],
    'distribution':{
      'stars':5,
      'negations':1,
      'dots':25,
    }
  },
  'thursday':{
    'width':5, 'height':5, 'colors':3, 'difficulty':[1, 9999],
    'distribution':{
      'polyominos':4,
      'squares':4,
    }
  },
  'friday':{
    'width':5, 'height':5, 'colors':1, 'difficulty':[1, 9999],
    'distribution':{
      'triangles':12,
      'negations':2,
    }
  },
  'saturday':{ // FIXME
    'width':5, 'height':5, 'colors':3, 'difficulty':[1, 9999],
    'distribution': {
      'stars':4,
      'polyominos':2,
      'onimoylops':2,
    }
    // symmetry: 1
  },
  'sunday':{
//    'width':6, 'height':6, 'colors':1, 'difficulty':[1, 9999],
    'width':5, 'height':5, 'colors':1, 'difficulty':[1, 9999],
    'distribution':{
      'triangles':1,
      'polyominos':1,
      'stars':1,
      'squares':1,
      'negations':1,
      'dots':1,
      'gaps':1,
    }
    // pillar: 1
  },
}

// From the random panels
RED = '#923A5E'
ORANGE = '#C5714F'
GREEN = '#58864C'
BLUE = '#5697A2'
PURPLE = '#785DAE'

