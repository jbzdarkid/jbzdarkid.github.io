// Makes a copy of the grid, since javascript is pass-by-reference
function _copyGrid(grid) {
  var new_grid = []
  for (var row of grid) {
    new_grid.push(row.slice())
  }
  return new_grid
}

// Returns a new copy of a puzzle, since javascript is pass-by-reference.
function _copy(puzzle) {
  return {
    'grid':_copyGrid(puzzle.grid),
    'start':{'x':puzzle.start.x, 'y':puzzle.start.y},
    'end':{'x':puzzle.end.x, 'y':puzzle.end.y},
    'dots':puzzle.dots.slice()
  }
}

var POLY_DICT = {
  '1.0.0': [{'x':0, 'y':0}],
  '2.0.0': [{'x':0, 'y':0}, {'x':0, 'y':2}],
  '2.0.1': [{'x':0, 'y':0}, {'x':2, 'y':0}],
  '3.0.0': [{'x':0, 'y':0}, {'x':0, 'y':2}, {'x':0, 'y':4}],
  '3.0.1': [{'x':0, 'y':0}, {'x':2, 'y':0}, {'x':4, 'y':0}],
  '3.1.0': [{'x':0, 'y':0}, {'x':0, 'y':2}, {'x':2, 'y':2}],
  '3.1.1': [{'x':0, 'y':0}, {'x':2, 'y':0}, {'x':2, 'y':-2}],
  '3.1.2': [{'x':0, 'y':0}, {'x':2, 'y':0}, {'x':2, 'y':2}],
  '3.1.3': [{'x':0, 'y':0}, {'x':0, 'y':2}, {'x':2, 'y':0}],
}

// Returns the contiguous regions on the grid, as arrays of points.
// The return array may contain empty cells.
function _getRegions(grid) {
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

  // console.log('Computed region map, colors:')
  // console.log(colors)
  return regions
}
