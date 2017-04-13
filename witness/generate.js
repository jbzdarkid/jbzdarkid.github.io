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

  // Dots must be on edges or corners
  var dots = []
  for (var i=0; i<style['dots']; i++) {
    var index = _randint(edges.length+dots.length)
    if (index < edges.length) {
      dots.push(edges.splice(index, 1)[0])
    } else {
      dots.push(corners.splice(index-edges.length, 1)[0])
    }
  }
  // Gaps must be on edges
  var gaps = []
  for (var i=0; i<style['gaps']; i++) {
    gaps.push(edges.splice(_randint(edges.length), 1)[0])
  }
  // All other objects must be in cells
  function _randObject(type) {
    var obj = {'type':type}
    if (type == 'square') {
      obj.color = ['red', 'blue', 'green', 'orange'][_randint(style['colors'])]
    } else if (type == 'star') {
      obj.color = ['red', 'blue', 'green', 'orange'][_randint(style['colors'])]
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
      obj.color = ['white', 'white', 'white', 'white'][_randint(style['colors'])]
    }
    return obj
  }
  for (var i=0; i<style['count']; i++) {
    var rand = _randint(100)
    for (var type in style['dist']) {
      if (rand < style['dist'][type]) {
        var cell = cells.splice(_randint(cells.length), 1)[0]
        grid[cell.x][cell.y] = _randObject(type)
        break
      }
      rand -= style['dist'][type]
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

function generatePuzzle() {
  if ('style' in urlParams) {
    if (urlParams['style'] in styles) {
      var style = styles[urlParams['style']]
    } else {
      var style = JSON.parse(urlParams['style'])
    }
  } else {
    // var day = [
      // 'sunday',
      // 'monday',
      // 'tuesday',
      // 'wednesday',
      // 'thursday',
      // 'friday',
      // 'saturday'][(new Date()).getDay()]
    // var style = styles[day]
    // FIXME: Think about full range of options
    var style = {
      'width':4, 'height':4,
      'dist':{'square': 25, 'star':25, 'poly':25, 'ylop':20, 'nega':5,},
      'count':7,
      'dots':0, 'gaps':0, 'colors':2,
    }
  }
  var solutions = []
  // Require a puzzle with not too many solutions
  while (solutions.length == 0 || solutions.length > 100) {
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
    var hint = hints.splice(_randint(hints.length), 1)[0]
    puzzle.gaps.push(hint)
    solution.gaps.push(hint)
    draw(puzzle)
  }
  window['showSolution'] = function() {
    draw(solution)
  }
  
  location.hash = puzzleSeed
  var mailer = document.getElementById('mailto')
  mailer.href = "mailto:jbzdarkid@gmail.com?subject=The Witness Random Puzzles&body=Puzzle id " + location.hash
  draw(puzzle)
  // draw(solutions[0])
}