// Returns a random integer in [0, n)
// Uses a set seed so puzzles can be regenerated
var seed = 42
function _randint(n) {
  seed = ((seed << 13) ^ seed) - (seed >> 21)
  return Math.abs(seed) % Math.floor(n)
}

// Generates a random puzzle for a given size.
function _randomize(width, height) {
  var grid = _newGrid(width, height)

  // Both start and end must be on corners
  var start = {'x':2*_randint(width), 'y':2*_randint(height)}
  var end = {}
  switch (_randint(4)) {
    case 0:
      end.x = 0
      end.y = 2*_randint(height)
      break;
    case 1:
      end.x = 2*_randint(height)
      end.y = 0
      break;
    case 2:
      end.x = 2*width
      end.y = 2*_randint(height)
      break;
    case 3:
      end.x = 2*_randint(height)
      end.y = 2*height
      break;
  }
  grid[start.x][start.y] = true

  // Dots must be on edges or corners
  var dots = []
  // var numDots = _randint(width/2)
  // for (var i=0; i<numDots; i++) {
  //   var x = _randint(width)
  //   if (x%2 == 0) {
  //     dots.push({'x':x, 'y':_randint(height)})
  //   } else {
  //     dots.push({'x':x, 'y':2*_randint(width/2)})
  //   }
  // }
  var gaps = []

  var distribution = {
    'square': 30,
    'star': 35,
    'poly': 30,
    'nega': 5,
  }
  function _randObject(type) {
    var obj = {'type':type}
    if (type == 'square') {
      obj.color = ['red', 'blue', 'green', 'orange'][_randint(3)]
    } else if (type == 'star') {
      obj.color = ['red', 'blue', 'green', 'orange'][_randint(3)]
    } else if (type == 'poly') {
      var count = Object.keys(POLYOMINOS)[_randint(Object.keys(POLYOMINOS).length)]
      var kind = Object.keys(POLYOMINOS[count])[_randint(Object.keys(POLYOMINOS[count]).length)]
      var rot = _randint(POLYOMINOS[count][kind].length)
      obj.shape = count+'.'+kind+'.'+rot
      obj.color = ['yellow', 'yellow', 'red', 'blue'][_randint(style['colors'])]
    } else if (type == 'ylop') {
      var count = Object.keys(POLYOMINOS)[_randint(Object.keys(POLYOMINOS).length)]
      var kind = Object.keys(POLYOMINOS[count])[_randint(Object.keys(POLYOMINOS[count]).length)]
      var rot = _randint(POLYOMINOS[count][kind].length)
      obj.shape = count+'.'+kind+'.'+rot
      obj.color = 'blue'
    } else if (type == 'nega') {
      obj.color = 'white'
    }
    return obj
  }
  var cells = []
  for (var x=1; x<grid.length; x+=2) {
    for (var y=1; y<grid[x].length; y+=2) {
      cells.push({'x':x, 'y':y})
    }
  }
  for (var i=0; i<8; i++) {
    var rand = _randint(100)
    for (var type in distribution) {
      if (rand < distribution[type]) {
        var cell = cells.splice(_randint(cells.length), 1)[0]
        grid[cell.x][cell.y] = _randObject(type)
        break
      }
      rand -= distribution[type]
    }
  }
  return {'grid':grid, 'start':start, 'end':end, 'dots':dots, 'gaps':gaps}
}

// When the page is done loading, generate a puzzle
window.onload = function () {
  seed = parseInt(location.hash.substring(1))
  if (!seed) {
    seed = Math.floor(Math.random() * (1 << 30))
  }
  document.getElementById('generate').onclick()
}

function generatePuzzle(width, height) {
  var solutions = []
  // Require a puzzle with not too many solutions
  while (solutions.length == 0 || solutions.length > 100) {
    solutions = []
    var puzzleSeed = seed
    var puzzle = _randomize(width, height)
    solve(puzzle, puzzle.start, solutions)
    console.info('Solved', puzzle, 'found', solutions.length, 'solutions')
  }
  /*
  var targetSolution = solutions.splice(_randint(solutions.length), 1)[0]
  solutionLoop: for (var solution of solutions) {
    // If the solution is already distinguished by the gaps, continue
    for (var gap of puzzle.gaps) {
      if (solution.grid[gap.x][gap.y]) continue solutionLoop
    }
    // Else, find a new gap to separate them
    for (var x=0; x<solution.grid.length; x++) {
      for (var y=0; y<solution.grid[x].length; y++) {
        if (x%2 == y%2) continue // Don't put gaps in corners or cells
        if (solution.grid[x][y] && !targetSolution.grid[x][y]) {
          puzzle.gaps.push({'x':x, 'y':y})
          continue solutionLoop
        }
      }
    }
  }
  */
  location.hash = puzzleSeed
  var mailer = document.getElementById('mailto')
  mailer.href = "mailto:jbzdarkid@gmail.com?subject=The Witness Random Puzzles&body=Puzzle id " + location.hash
  draw(puzzle)
  // draw(solutions[0])
}