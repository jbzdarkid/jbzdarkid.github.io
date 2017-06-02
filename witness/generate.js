// Returns a random integer in [0, n)
// Uses a set seed so puzzles can be regenerated
var seed = 42
function _randint(n) {
  seed = ((seed << 13) ^ seed) - (seed >> 21)
  return Math.abs(seed) % Math.floor(n)
}

// Generates a random puzzle for a given size.
function _randomize(style) {
  var width = style['width']
  var height = style['height']
  var puzzle = {
    'grid':_newGrid(width, height),
    'start':{'x':null, 'y':null},
    'end':{'x':null,'y':null},
    'dots':[],
    'gaps':[],
  }

  // FIXME: Both start and end must be on corners
  puzzle.start.x = 2*_randint(width)
  puzzle.start.y = 2*_randint(height)
  switch (_randint(4)) {
    case 0: // Top
      puzzle.end.x = 0
      puzzle.end.y = 2*_randint(height)
      break
    case 1: // Left
      puzzle.end.x = 2*_randint(height)
      puzzle.end.y = 0
      break
    case 2: // Bottom
      puzzle.end.x = 2*width
      puzzle.end.y = 2*_randint(height)
      break
    case 3: // Right
      puzzle.end.x = 2*_randint(height)
      puzzle.end.y = 2*height
      break
  }

  var edges = []
  var corners = []
  var cells = []
  for (var x=0; x<2*width+1; x++) {
    for (var y=0; y<2*height+1; y++) {
      if (x%2 == 0 && y%2 == 0) {
        corners.push({'x':x, 'y':y})
      } else if (x%2 == 1 && y%2 == 1) {
        cells.push({'x':x, 'y':y})
      } else {
        edges.push({'x':x, 'y':y})
      }
    }
  }

  // Place a number of elements according to the set distribution
  for (var type in style['distribution']) {
    for (var i=0; i<style['distribution'][type]; i++) {
      if (type == 'dots') {
        var index = _randint(edges.length + dots.length)
        if (index < edges.length) {
          puzzle.dots.push(edges.splice(index, 1)[0])
        } else {
          puzzle.dots.push(corners.splice(index - edges.length, 1)[0])
        }
      } else if (type == 'gaps') {
        puzzle.gaps.push(edges.splice(_randint(edges.length), 1)[0])
      } else if (type == 'negations') {
        var color = ['white', RED, GREEN, BLUE, PURPLE][_randint(style['colors'])]
        var pos = cells.splice(_randint(cells.length), 1)[0]
        puzzle.grid[pos.x][pos.y] = {'type':'nega', 'color':color}
      } else if (type == 'squares') {
        var color = [RED, ORANGE, GREEN, BLUE, PURPLE][_randint(style['colors'])]
        var pos = cells.splice(_randint(cells.length), 1)[0]
        puzzle.grid[pos.x][pos.y] = {'type':'square', 'color':color}
      } else if (type == 'stars') {
        var color = [RED, ORANGE, GREEN, BLUE, PURPLE][_randint(style['colors'])]
        var pos = cells.splice(_randint(cells.length), 1)[0]
        puzzle.grid[pos.x][pos.y] = {'type':'star', 'color':color}
      } else if (type == 'triangles') {
        var pos = cells.splice(_randint(cells.length), 1)[0]
        puzzle.grid[pos.x][pos.y] = {'type':'triangle', 'color':'orange'}
      } else if (type == 'polyominos' || type == 'onimolyps') {
        var size = _randint(Math.min(width, height))+1
        var shapes = getPolyomino(size)
        var shape = shapes[_randint(shapes.length)]
        var numRotations = getPolyomino(size, shape)
        if (numRotations == 1) {
          var rotation = 0
        } else {
          var rotation = _randint(numRotations+1)
          if (rotation == numRotations) { // Selected a rotation poly
            rotation = 'all'
          }
        }
        var pos = cells.splice(_randint(cells.length), 1)[0]
        if (type == 'polyominos') {
          var color = ['yellow', RED, GREEN, BLUE, PURPLE][_randint(style['colors'])]
          puzzle.grid[pos.x][pos.y] = {'type':'poly', 'color':color, 'size':size, 'shape':shape, 'rot':rotation}
        } else {
          puzzle.grid[pos.x][pos.y] = {'type':'ylop', 'color':'blue', 'size':size, 'shape':shape, 'rot':rotation}
        }
      }
    }
  }
  return puzzle
}

// When the page is done loading, generate a puzzle
window.onload = function () {
  seed = parseInt(location.hash.substring(1))
  if (!seed) {
    seed = Math.floor(Math.random() * (1 << 30))
  }
  generatePuzzle()
}

function generatePuzzle() {
  if ('style' in urlParams) {
    if (urlParams['style'] in styles) {
      var style = styles[urlParams['style']]
    } else {
      var style = JSON.parse(urlParams['style'])
    }
  } else {
    var day = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday'][(new Date()).getDay()]
    var style = styles[day]
    location.query = 'style='+style
  }
  var solutions = []
  // Require a puzzle with not too many solutions
  while (solutions.length == 0 || solutions.length > style['difficulty']) {
    solutions = []
    var puzzleSeed = seed
    var puzzle = _randomize(style)
    solve(puzzle, {'x':puzzle.start.x, 'y':puzzle.start.y}, solutions)
    console.info('Solved', puzzle, 'found', solutions.length, 'solutions')
  }
  var solution = solutions[_randint(solutions.length)]
  var hints = []
  for (var x=0; x<solution.grid.length; x++) {
    for (var y=0; y<solution.grid[x].length; y++) {
      if (x%2 + y%2 == 1 && !solution.grid[x][y]) {
        hints.push({'x':x, 'y':y})
      }
    }
  }
  window['showHint'] = function() {
    if (hints.length <= 0) return
    var hint = hints.splice(_randint(hints.length), 1)[0]
    puzzle.gaps.push(hint)
    solution.gaps.push(hint)
    draw(puzzle)
  }
  window['showSolution'] = function() {
    draw(solution)
  }

  location.hash = puzzleSeed
  draw(puzzle)
  // draw(solutions[0])
}
