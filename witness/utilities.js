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

function _copyGrid(grid) {
  console.trace('FIXME: Deprecated, use puzzle.copyGrid instead')
  var new_grid = []
  for (var row of grid) {
    new_grid.push(row.slice())
  }
  return new_grid
}

// A 2x2 grid is internally a 5x5:
// corner, edge, corner, edge, corner
// edge,   cell, edge,   cell, edge
// corner, edge, corner, edge, corner
// edge,   cell, edge,   cell, edge
// corner, edge, corner, edge, corner
//
// Corners and edges will have a value of true if the line passes through them
// Cells will contain an object if there is an element in them
function _newGrid(width, height) {
  console.trace('FIXME: Deprecated, use puzzle.newGrid instead')
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
function _getRegions(grid) {
  console.trace('FIXME: Deprecated, use puzzle.getRegions instead')
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

