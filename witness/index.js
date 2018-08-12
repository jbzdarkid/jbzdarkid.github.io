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
    'width':5, 'height':5, 'colors':2, 'difficulty':[0, 99999999],
//    'pillar':1,
    'distribution':{
      'onimoylops':1,
      'polyominos':2,
      'squares':6
    }
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

// Main startup code, detect style + puzzle id, generate, validate, and display puzzle.
if (location.hash == "") {
  // If no seed is provided, choose a random one
  setSeed(Math.floor(Math.random() * (1 << 30)))
} else { // A seed was provided
  setSeed(parseInt(location.hash.substring(1)))
}

// Parse URL params to either load a puzzle, or generate a random one
if ('puzzle' in urlParams) {
  var puzzleData = {'solutions': []}
  puzzleData.puzzle = Puzzle.deserialize(urlParams.puzzle)
  solve(puzzleData.puzzle, puzzleData.puzzle.start.x, puzzleData.puzzle.start.y, puzzleData.solutions)
} else {
  if ('style' in urlParams) {
    if (urlParams.style in styles) {
      var style = styles[urlParams.style]
    } else {
      var style = JSON.parse(urlParams.style)
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
  var puzzleData = validPuzzle(style)
  location.hash = puzzleData.seed
}

// Draw the puzzle
window.onload = function() {
  draw(puzzleData.puzzle)
  window.solution = puzzleData.solutions[_randint(puzzleData.solutions.length)]
  window.hints = solution.hints()
}

function showHint() {
  if (hints.length <= 0) return
  window.hints = puzzleData.puzzle.showHint(window.hints)
  draw(puzzleData.puzzle)
}

function showSolution() {
  draw(solution)
}