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
  var puzzle = new Puzzle(width, height)

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
        if (style['distribution'][type] == corners.length) {
          puzzle.dots = corners // Style requests all corners filled
          corners = []
          break
        } else {
          var index = _randint(edges.length + corners.length)
          if (index < edges.length) {
            puzzle.dots.push(edges.splice(index, 1)[0])
          } else {
            puzzle.dots.push(corners.splice(index - edges.length, 1)[0])
          }
        }
      } else if (type == 'gaps') {
        puzzle.gaps.push(edges.splice(_randint(edges.length), 1)[0])
      } else if (type == 'negations') {
        var color = [PURPLE, RED, ORANGE, GREEN, BLUE][_randint(style['colors'])]
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
        // If the distribution has more stars, place another of the same color
        // This should reduce the likelihood of unsolvable puzzles
        if (i < style['distribution'][type]-1) {
          i++
          var pos2 = cells.splice(_randint(cells.length), 1)[0]
          puzzle.grid[pos2.x][pos2.y] = {'type':'star', 'color':color}
        }
      } else if (type == 'triangles') {
        var pos = cells.splice(_randint(cells.length), 1)[0]
        var count = _randint(3)+1
        puzzle.grid[pos.x][pos.y] = {'type':'triangle', 'color':ORANGE, 'count':count}
      } else { // Polyominos
        var size = _randint(Math.min(width, height))+1
        var shapes = getPolyomino(size)
        var shape = shapes[_randint(shapes.length)]
        var numRotations = getPolyomino(size, shape)
        var rotation = _randint(numRotations)
        var color = [ORANGE, GREEN, BLUE, PURPLE, RED][_randint(style['colors'])]
        var obj = {'color':color, 'size':size, 'shape':shape, 'rot':rotation}
        if (type == 'polyominos') {
          Object.assign(obj, {'type':'poly'})
        } else if (type == 'rpolyominos') {
          if (numRotations == 1) {
            i--
            continue
          }
          Object.assign(obj, {'type':'poly', 'rot':'all'})
        } else if (type == 'onimoylops') {
          Object.assign(obj, {'type':'ylop', 'color':'blue'})
        } else if (type == 'ronimoylops') {
          if (numRotations == 1) {
            i--
            continue
          }
          Object.assign(obj, {'type':'ylop', 'color':'blue', 'rot':'all'})
        }
        var pos = cells.splice(_randint(cells.length), 1)[0]
        puzzle.grid[pos.x][pos.y] = obj
      }
    }
  }
  return puzzle
}

// When the page is done loading, generate a puzzle
window.onload = function() {
  seed = parseInt(location.hash.substring(1))
  if (!seed) {
    seed = Math.floor(Math.random() * (1 << 30))
  }
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
    location.search = 'style='+day
  }
  var solutions = []
  // Require a puzzle with not too many solutions
  while (true) {
    solutions = []
    var puzzleSeed = seed
    var puzzle = _randomize(style)
    solve(puzzle, {'x':puzzle.start.x, 'y':puzzle.start.y}, solutions)
    if (solutions.length == 0) {
      console.info('Puzzle', puzzle, 'has no solution')
      solutions = [puzzle]
      // break
    } else if (solutions.length < style['difficulty'][0]) {
      console.info('Puzzle', puzzle, 'has', solutions.length, 'solutions: Too Hard')
    } else if (solutions.length > style['difficulty'][1]) {
      console.info('Puzzle', puzzle, 'has', solutions.length, 'solutions: Too Easy')
    } else {
      console.info('Puzzle', puzzle, 'has', solutions.length, 'solutions: Just Right')
      break
    }
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
