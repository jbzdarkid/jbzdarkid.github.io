/**
 * A 2x2 grid is listed as a 5x5:
 * Corner, edge, corner, edge, corner
 * Edge,   cell, edge,   cell, edge
 * Corner, edge, corner, edge, corner
 * Edge,   cell, edge,   cell, edge
 * Corner, edge, corner, edge, corner
 *
 * Each corner has a value of 0, 1, 2 (for the number of connections)
 * Each edge has a value of 0 or 1 (enabled or disabled)
 * Each cell has a value of 0 or an object (if it has an element)
 **/

// Returns a random integer in [0, n)
// Uses a set seed so puzzles can be regenerated
var seed = 42
function _randint(n) {
  seed = ((seed << 13) ^ seed) - (seed >> 21)
  return Math.abs(seed) % Math.floor(n)
}

// Generates a random puzzle for a given size.
function _randomize(width, height) {
  var grid = []
  for (var i=0; i<width; i++) {
    grid[i] = []
    for (var j=0; j<height; j++) {
      grid[i][j] = false
    }
  }

  // Both start and end must be on corners
  /*
  var start = {'x':2*_randint(width/2), 'y':2*_randint(height/2)}
  var end = {}
  switch (_randint(4)) {
    case 0:
      end.x = 0
      end.y = 2*_randint(height/2)
      break;
    case 1:
      end.x = 2*_randint(height/2)
      end.y = 0
      break;
    case 2:
      end.x = width-1
      end.y = 2*_randint(height/2)
      break;
    case 3:
      end.x = 2*_randint(height/2)
      end.y = height-1
      break;
  }
  */
  var start = {'x':width-1, 'y':0}
  grid[start.x][start.y] = true
  var end = {'x':0, 'y':height-1}

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
    'square': 10,
    'star': 10,
    'poly': 10,
    'nega': 2,
  }
  function _randObject(type) {
    var obj = {'type':type}
    if (type == 'square') {
      obj.color = ['red', 'blue', 'green', 'orange'][_randint(2)]
    } else if (type == 'star') {
      obj.color = ['red', 'blue', 'green', 'orange'][_randint(2)]
    } else if (type == 'poly') {
      var polys = Object.keys(POLY_DICT)
      obj.shape = polys[_randint(polys.length)]
      obj.color = ['yellow', 'yellow', 'red', 'blue'][_randint(2)]
    } else if (type == 'nega') {
      obj.color = 'white'
    }
    return obj
  }

  for (var x=1; x<width; x+=2) {
    for (var y=1; y<height; y+=2) {
      var rand = _randint(100)
      for (var type in distribution) {
        if (rand < distribution[type]) {
          grid[x][y] = _randObject(type)
          break
        }
        rand -= distribution[type]
      }
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
  var solutions
  while (true) {
    solutions = []
    var puzzleSeed = seed
    var puzzle = _randomize(width, height)
    solve(puzzle, puzzle.start, solutions)
    if (solutions.length == 0) {
      continue
    } else if (solutions.length == 1) {
      break // Unique solution, valid puzzle
    } else {
      var targetSolution = solutions.splice(_randint(solutions.length), 1)
      // for (var cell of targetSolution) {
      //   for (var solution of solutions) {
      //
      //   }
      // }
      console.log(solutions.length)
      console.log(solutions)
      break // Multiple solutions, force only one via dots & breaks
    }
  }
  location.hash = seed
  var mailer = document.getElementById('mailto')
  mailer.href = "mailto:jbzdarkid@gmail.com?subject=The Witness Random Puzzles&body=Puzzle id " + location.hash
  draw(puzzle)
  // draw(solutions[0])
}