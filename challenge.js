namespace(function() {

var seed = 0
var unique = false
var scrambleOrder = []
var possibleTriples = []
var leftPillarSymmetry = 0
var rightPillarSymmetry = 0
var solvedPuzzles = []

// TODO: Doors is hiding solution viewer by calling showScene. Sigh.
// TODO: Doors needs to force solve exit when the panel closes.
// TODO: Doors needs to put the cover *over* the panel. Somehow.
// TODO: Mobile layout -- flexbox should work here, just set a flex-basis or whaever
// TODO: Game-accurate RNG? It's not too hard.
// - Actual RNG generator (instead of hash function -- should still use rngContext via hash function, but increment using pure RNG)
// - Fix the Poly puzzle to match game logic
// - Confirm the right door code
// - Possibly change the RNG context for pillar symmetry and scramble.
// TODO: puzzle.settings.MONOCHROME_SYMMETRY?

window.onload = function() {
  var params = new URLSearchParams(window.location.search)
  seed = parseInt(params.get('seed')) || 0
  if (seed === 0) {
    seed = crypto.getRandomValues(new Uint32Array(1))[0]
    params.set('seed', seed)
    window.location.search = params.toString()
    return // Changing window.location triggers a refresh, so we're all done here.
  }

  // Create svgs for all of the puzzles
  var puzzles = document.getElementById('puzzles')
  for (var puzzleName in puzzleGenerators) {
    var parentDiv = document.createElement('div')
    parentDiv.id = puzzleName + '-parent'
    parentDiv.style.display = 'none'
    puzzles.appendChild(parentDiv)

    var panel = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    panel.id = puzzleName
    parentDiv.appendChild(panel)

    var solutionViewer = document.createElement('div')
    solutionViewer.id = 'solutionViewer-' + puzzleName
    solutionViewer.style = 'margin-top: 4px; opacity: 0'
    parentDiv.appendChild(solutionViewer)

    var previousSolution = document.createElement('button')
    previousSolution.id = 'previousSolution-' + puzzleName
    previousSolution.innerHTML = '&larr;'
    solutionViewer.appendChild(previousSolution)

    var solutionCount = document.createElement('label')
    solutionCount.id = 'solutionCount-' + puzzleName
    solutionCount.style = 'padding: 6px'
    solutionViewer.appendChild(solutionCount)

    var nextSolution = document.createElement('button')
    nextSolution.id = 'nextSolution-' + puzzleName
    nextSolution.innerHTML = '&rarr;'
    solutionViewer.appendChild(nextSolution)
  }

  unique = (params.get('difficulty') == 'hard')
  generate(location.hash.substring(1))
}

var sceneToPuzzles = {
  'intro': ['easy-maze', 'hard-maze', 'stones'],
  'scramble-polyominos': ['scramble-polyominos'],
  'scramble-stars': ['scramble-stars'],
  'scramble-symmetry': ['scramble-symmetry'],
  'scramble-maze': ['scramble-maze'],
  'triple2': ['triple-twocolor-0', 'triple-twocolor-1', 'triple-twocolor-2'],
  'triple3': ['triple-threecolor-0', 'triple-threecolor-1', 'triple-threecolor-2'],
  'triangles': ['triangle-left', 'triangle-right'],
  'pillars': ['pillar-left', 'pillar-right'],
  'fanfare': [],

  'full': ['easy-maze', 'hard-maze', 'stones', 'scramble-polyominos', 'scramble-stars', 'scramble-symmetry', 'scramble-maze', 'triple-twocolor-0', 'triple-twocolor-1', 'triple-twocolor-2', 'triple-threecolor-0', 'triple-threecolor-1', 'triple-threecolor-2', 'triangle-left', 'triangle-right', 'pillar-left', 'pillar-right'],

  'doors': ['door-left', 'door-right'],
}

window.generate = function(scene) {
  var puzzlesToGenerate = sceneToPuzzles[scene]
  if (puzzlesToGenerate == null) {
    scene = 'full'
    puzzlesToGenerate = sceneToPuzzles['full']
  }

  var challengeType = document.getElementById('challengeType')
  var found = false
  for (var option of challengeType.getElementsByTagName('option')) {
    if (option.value == scene) found = true
  }

  if (found) {
    challengeType.value = scene
    location.hash = scene
  }

  setRngContext('meta')
  scrambleOrder = shuffle(['scramble-stars', 'scramble-maze', 'scramble-polyominos', 'scramble-symmetry'])
  possibleTriples = ['triple-twocolor-' + randInt(3), 'triple-threecolor-' + randInt(3)]
  leftPillarSymmetry = randInt(4)
  rightPillarSymmetry = randInt(4)
  solvedPuzzles = []

  console.info('Generating...')
  document.getElementById('progressBox').style.display = null

  var generateNew = document.getElementById('generateNew')
  var showSolutions = document.getElementById('showSolutions')

  generateNew.disable()
  generateNew.innerText = 'Generating:'
  challengeType.disable() // Changing type while solving is very damaging
  showSolutions.disable() // Meaningless until regenerated

  generatePuzzlesAsync(puzzlesToGenerate, 0, function() {
    setLogLevel('info')
    document.getElementById('progressBox').style.display = 'none'
    console.info('All done!')

    generateNew.enable()
    generateNew.innerText = 'Generate New'
    challengeType.enable()
    showSolutions.enable()

    showScene(scene) // From outer scope
  })
}

window.showSolutions = function() {
  for (var puzzleName in puzzleGenerators) {
    var parentDiv = document.getElementById(puzzleName + '-parent')
    if (parentDiv.style.display != 'none') { // If the puzzle is in this scene
      var panel = document.getElementById(puzzleName)
      var panelCover = document.getElementById(puzzleName + '-cover')
      var solutionViewer = document.getElementById('solutionViewer-' + puzzleName)

      panelCover.style.opacity = 0
      panelCover.style.pointerEvents = 'none'

      if (solutionViewer.style.opacity == '0') { // If the solution viewer is hidden
        solutionViewer.style.opacity = null
        window.showSolution(panel.puzzle, solutionViewer.paths, 0, puzzleName)
      }
    }
  }
}

function show(id, coverOpacity, pointerEvents, coverAnimation) {
  var parentDiv = document.getElementById(id + '-parent')
  parentDiv.style.display = null

  var panelCover = document.getElementById(id + '-cover')
  panelCover.setAttribute('opacity', coverOpacity)
  panelCover.setAttribute('style', 'pointer-events: ' + pointerEvents)
  panelCover.style.animation = coverAnimation
}

function showScene(scene) {
  // Hide all puzzles and solutions
  for (var puzzleName in puzzleGenerators) {
    document.getElementById(puzzleName + '-parent').style.display = 'none'
    document.getElementById('solutionViewer-' + puzzleName).style.opacity = '0'
  }

  if (scene == 'full' || scene == 'intro') {
    show('easy-maze', 0, 'none')
    show('hard-maze', 1, 'all')
    show('stones', 1, 'all')
  } else if (scene == 'scramble-polyominos') {
    show('scramble-polyominos', 0, 'none')
  } else if (scene == 'scramble-stars') {
    show('scramble-stars', 0, 'none')
  } else if (scene == 'scramble-symmetry') {
    show('scramble-symmetry', 0, 'none')
  } else if (scene == 'scramble-maze') {
    show('scramble-maze', 0, 'none')
  } else if (scene == 'triple2') {
    show('triple-twocolor-1', 1, 'none', 'turnOn 1s linear 0s 1 forwards')
    show('triple-twocolor-0', 1, 'none', 'turnOn 1s linear 1s 1 forwards')
    show('triple-twocolor-2', 1, 'none', 'turnOn 1s linear 2s 1 forwards')
  } else if (scene == 'triple3') {
    show('triple-threecolor-1', 1, 'none', 'turnOn 1s linear 0s 1 forwards')
    show('triple-threecolor-2', 1, 'none', 'turnOn 1s linear 1s 1 forwards')
    show('triple-threecolor-0', 1, 'none', 'turnOn 1s linear 2s 1 forwards')
  } else if (scene == 'triangles') {
    show('triangle-left', 0, 'none')
    show('triangle-right', 0, 'none')
  } else if (scene == 'pillars') {
    show('pillar-left', 0, 'none')
    show('pillar-right', 0, 'none')
  } else if (scene == 'fanfare') {
    var parentDiv = document.getElementById('fanfare-parent')
    parentDiv.style.width = '100%'
    parentDiv.style.height = '100%'
    parentDiv.style.display = null

    var panel = document.getElementById('fanfare')
    panel.setAttribute('viewBox', '0 0 100 100')
    panel.setAttribute('width', '100%')
    panel.setAttribute('height', '100%')

    var text = createElement('text')
    text.setAttribute('x', 15)
    text.setAttribute('y', 25)
    text.setAttribute('style', 'font-family: Constantia-Bold; font-variant: small-caps')
    text.setAttribute('fill', window.TEXT_COLOR)
    text.innerHTML = 'You win!'
    panel.appendChild(text)

    var panelCover = window.createElement('rect')
    panelCover.setAttribute('id', puzzleName + '-cover')
    panel.appendChild(panelCover)
  } else if (scene == 'doors') {
    // 00.000 -- start slideup anim (panel is powering on, immediately interactable)
    // 01.000 -- panel completely powered on
    // 04.500 -- end slideup anim
    // 17.000 -- start slidedown anim (panel is powering off, immediately non-interactable)
    // 18.000 -- panel completely powered off
    // 21.500 -- end slidedown anim
    // 23.000 -- start slideup anim

    var leftSlider = document.getElementById('door-left-cover2')
    var rightSlider = document.getElementById('door-right-cover2')

    show('door-left', 1, 'none', 'turnOn 1s linear 0s 1 forwards')
    show('door-right', 1, 'none', 'turnOn 1s linear 0s 1 forwards')
    leftSlider.style.animation = 'slideUp 4.5s linear 0s 1 forwards'
    rightSlider.style.animation = 'slideUp 4.5s linear 0s 1 forwards'

    // We need to clear the animations to play new ones, for some reason
    setTimeout(function() {
      show('door-left', 0, 'none', null)
      show('door-right', 0, 'none', null)
      leftSlider.style.height = '0%'
      leftSlider.style.animation = null
      rightSlider.style.height = '0%'
      rightSlider.style.animation = null
    }, 5000)

    setTimeout(function() {
      console.info('Stand clear of the closing doors, please')
      show('door-left', 0, 'all', 'turnOn 1s linear reverse 0s 1 forwards')
      show('door-right', 0, 'all', 'turnOn 1s linear reverse 0s 1 forwards')
      leftSlider.style.animation = 'slideUp 4.5s linear reverse 0s 1 forwards'
      rightSlider.style.animation = 'slideUp 4.5s linear reverse 0s 1 forwards'

      // We need to clear the animations to play new ones, for some reason
      setTimeout(function() {
        show('door-left', 1, 'all', null)
        show('door-right', 1, 'all', null)
        leftSlider.style.height = '100%'
        leftSlider.style.animation = null
        rightSlider.style.height = '100%'
        rightSlider.style.animation = null
      }, 5000)

      setTimeout(function() {
        showScene('doors')
      }, 6000)
    }, 17000)
  }
}

window.TRACE_COMPLETION_FUNC = function(puzzle, rawPath) {
  // These 3 mazes always progress like this, regardless of scene
  if (puzzle.name == 'easy-maze') {
    show('hard-maze', 0, 'none', 'turnOn 1s linear 0s 1 forwards')
  } else if (puzzle.name == 'hard-maze') {
    show('stones', 0, 'none', 'turnOn 1s linear 0s 1 forwards')
  }

  var challengeType = document.getElementById('challengeType').value
  if (challengeType == 'full') {
    var sceneMap = {}
    sceneMap['stones'] = scrambleOrder[0]
    sceneMap[scrambleOrder[0]] = scrambleOrder[1]
    sceneMap[scrambleOrder[1]] = scrambleOrder[2]
    sceneMap[scrambleOrder[2]] = scrambleOrder[3]
    sceneMap[scrambleOrder[3]] = 'triple2'
    sceneMap['triple-twocolor-0'] = 'triple3'
    sceneMap['triple-twocolor-1'] = 'triple3'
    sceneMap['triple-twocolor-2'] = 'triple3'
    sceneMap['triple-threecolor-0'] = 'triangles'
    sceneMap['triple-threecolor-1'] = 'triangles'
    sceneMap['triple-threecolor-2'] = 'triangles'

    var nextScene = sceneMap[puzzle.name]

    // Handle two scenes which have no explicit ordering
    solvedPuzzles.push(puzzle.name)
    if (puzzle.name == 'triangle-left' || puzzle.name == 'triangle-right') {
      if (solvedPuzzles.includes('triangle-left') && solvedPuzzles.includes('triangle-right')) {
        nextScene = 'pillars'
      }
    } else if (puzzle.name == 'pillar-left' || puzzle.name == 'pillar-right') {
      if (solvedPuzzles.includes('pillar-left') && solvedPuzzles.includes('pillar-right')) {
        nextScene = 'fanfare'
      }
    }

    if (nextScene != null) {
      // Let users look at their solutions for a bit before whisking them away
      window.setTimeout(function() {
        showScene(nextScene)
      }, 2000)
    }

    return // Do not show solutions in 'full challenge' mode.
  }

  // Show solution for the solved puzzle
  var solutionViewer = document.getElementById('solutionViewer-' + puzzle.name)
  solutionViewer.style.opacity = null

  var matchingPath = 0
  for (var i=0; i<solutionViewer.paths.length; i++) {
    var path = solutionViewer.paths[i]
    if (path[0][0] != rawPath[0][0] || path[0][1] != rawPath[0][1]) continue // Different start point
    if (path.length != rawPath.length) continue

    var match = true
    for (var j=1; j<rawPath.length; j++) {
      if (path[j] != rawPath[j]) match = false
    }

    if (match) {
      matchingPath = i
      break
    }
  }

  window.showSolution(puzzle, solutionViewer.paths, matchingPath, puzzle.name)

  if (puzzle.name.includes('triple')) {
    // Show the "solutions" for the other two triples, too.
    window.showSolutions()
  }
}

window.generateNew = function() {
  // Reset the seed and reload the page to get a new seed
  var params = new URLSearchParams(window.location.search)
  params.set('seed', 0)
  window.location.search = params.toString()
}

function generatePuzzlesAsync(puzzlesToGenerate, i, finalCallback) {
  if (i >= puzzlesToGenerate.length) {
    finalCallback()
    return
  }

  var puzzleName = puzzlesToGenerate[i]
  setRngContext(puzzleName)

  percent = Math.floor(100.0 * i / puzzlesToGenerate.length)
  document.getElementById('progressPercent').innerText = percent + '%'
  document.getElementById('progress').style.width = percent + '%'

  generateSinglePuzzleAsync(puzzleName, 1000, function(puzzle, paths) {
    window.draw(puzzle, puzzleName)
    puzzle.name = puzzleName // So that we know what we solved in the trace completion callback

    var panel = document.getElementById(puzzleName)
    panel.puzzle = puzzle // Save the puzzle object so we can draw to it when showing solutions

    // Add a cover to panels, so that they can "power on" in sequence.
    var panelCover = window.createElement('rect')
    panelCover.setAttribute('width', panel.getAttribute('width'))
    panelCover.setAttribute('height', panel.getAttribute('height'))
    panelCover.setAttribute('opacity', 1)
    panelCover.setAttribute('fill', window.BORDER)
    panelCover.setAttribute('style', 'pointer-events: all')
    panelCover.setAttribute('id', puzzleName + '-cover')
    panel.appendChild(panelCover)

    // Doors need a second cover to simulate "sliding open"
    if (puzzleName.includes('door')) {
      var panelCover2 = window.createElement('rect')
      panelCover2.setAttribute('width', panel.getAttribute('width'))
      panelCover2.setAttribute('height', '100%')
      panelCover2.setAttribute('opacity', 1)
      panelCover2.setAttribute('fill', window.BACKGROUND)
      panelCover2.setAttribute('style', 'pointer-events: all')
      panelCover2.setAttribute('id', puzzleName + '-cover2')
      panel.appendChild(panelCover2)
    }

    var solutionViewer = document.getElementById('solutionViewer-' + puzzleName)
    solutionViewer.paths = paths // Save for later when we want to show solutions

    generatePuzzlesAsync(puzzlesToGenerate, i+1, finalCallback)
  })
}

function generateSinglePuzzleAsync(puzzleName, solveAttempts, callback) {
  if (solveAttempts <= 0) {
    console.error('Failed to generate a random puzzle for ' + puzzleName)

    // This is not great -- but we don't want to take forever. Ideally, this wouldn't happen.
    var puzzle = new Puzzle(1, 0)
    puzzle.grid[0][0].start = true
    puzzle.grid[2][0].end = 'right'
    callback(puzzle, [])
    return
  }

  // Generate a random puzzle. The generator returns null when the puzzle is 'trivially invalid' (currently only for L shapes)
  var puzzle = null
  while (puzzle == null) puzzle = puzzleGenerators[puzzleName]()

  window.solve(puzzle, /*partialCallback=*/null, /*finalCallback=*/function(paths) {
    var success = false

    if (puzzleName.startsWith('triple') && !possibleTriples.includes(puzzleName)) {
      success = (paths.length == 0)
    } else if (unique) {
      if (puzzle.symmetry == null || puzzleName == 'scramble-symmetry') {
        success = (paths.length == 1)
      } else if (puzzleName == 'hard-maze' || puzzleName == 'scramble-maze') {
        success = (paths.length <= 50)
      } else {
        success = (paths.length == 2)
      }
    } else {
      success = (paths.length >= 1)
    }

    if (success) {
      console.info('Successfully generated a random puzzle for ' + puzzleName)

      callback(puzzle, paths)
    } else {
      generateSinglePuzzleAsync(puzzleName, solveAttempts - 1, callback)
    }
  })
}

var puzzleGenerators = {
  'easy-maze': function() {
    var puzzle = new Puzzle(3, 3)
    puzzle.grid[0][6].start = true
    puzzle.grid[6][0].end = 'top'

    cutRandomEdges(puzzle, 9)
    return puzzle
  },
  'hard-maze': largeMaze,
  'stones': function() {
    var puzzle = new Puzzle(4, 4)
    puzzle.grid[0][8].start = true
    puzzle.grid[8][0].end = 'top'

    for (var cell of randomCells(puzzle, 7)) {
      puzzle.grid[cell.x][cell.y] = {'type': 'square', 'color': 'white'}
    }
    for (var cell of randomCells(puzzle, 4)) {
      puzzle.grid[cell.x][cell.y] = {'type': 'square', 'color': 'black'}
    }
    cutRandomEdges(puzzle, 5)
    return puzzle
  },
  'scramble-polyominos': polyominosAndStars,
  'scramble-stars': function() {
    var puzzle = new Puzzle(4, 4)
    puzzle.grid[0][8].start = true
    puzzle.grid[8][0].end = 'top'

    for (var cell of randomEmptyCells(puzzle, 4)) {
      puzzle.grid[cell.x][cell.y] = {'type': 'star', 'color': 'green'}
    }
    cutRandomEdges(puzzle, 8)
    placeRandomCornerDots(puzzle, 4, window.DOT_BLACK)
    return puzzle
  }, 'scramble-symmetry': function() {
    var puzzle = new Puzzle(6, 6)
    puzzle.grid[0][0].start = true
    puzzle.grid[12][12].start = true
    puzzle.grid[12][0].end = 'right'
    puzzle.grid[0][12].end = 'left'
    puzzle.symmetry = {'x': true, 'y': true}

    cutRandomEdges(puzzle, 6)
    placeRandomCornerDots(puzzle, 2, window.DOT_BLUE)
    placeRandomCornerDots(puzzle, 2, window.DOT_YELLOW)
    placeRandomCornerDots(puzzle, 2, window.DOT_BLACK)
    return puzzle
  },
  'scramble-maze': largeMaze,
  'triple-twocolor-0': tripleTwoColor,
  'triple-twocolor-1': tripleTwoColor,
  'triple-twocolor-2': tripleTwoColor,
  'triple-threecolor-0': tripleThreeColor,
  'triple-threecolor-1': tripleThreeColor,
  'triple-threecolor-2': tripleThreeColor,
  'triangle-left': function() {return triangles(6)},
  'triangle-right': function() {return triangles(8)},
  'pillar-left': function() {
    var puzzle = new Puzzle(6, 6, true)
    applyRandomPillarSymmetry(puzzle, leftPillarSymmetry)

    for (var i=0; i<8; i++) {
      var horiz = randInt(2)
      var cell = getCells(puzzle, getRandomElement, 1, function(x, y) {
        return (x%2 === horiz && y%2 === 1 - horiz && puzzle.grid[x][y].dot == null)
      })[0]
      puzzle.grid[cell.x][cell.y].dot = window.DOT_BLACK
    }
    return puzzle
  }, 'pillar-right': function() {
    var puzzle = new Puzzle(6, 6, true)
    applyRandomPillarSymmetry(puzzle, rightPillarSymmetry)

    for (var cell of randomEmptyCells(puzzle, 3)) {
      puzzle.grid[cell.x][cell.y] = {'type': 'square', 'color': 'white'}
    }
    for (var cell of randomEmptyCells(puzzle, 3)) {
      puzzle.grid[cell.x][cell.y] = {'type': 'square', 'color': 'black'}
    }
    return puzzle
  }, 'fanfare': function() {
    return null
  },
  'door-left': polyominosAndStars,
  'door-right': function() {
    var puzzle = new Puzzle(4, 4)
    puzzle.grid[0][0].end = 'top'
    puzzle.grid[8][8].start = true

    // TODO: Probably different colors for right door.
    var colors = shuffle(['#052812', '#FFC17A', '#A4C34F', '#B52EBD', '#99EC35'])
    for (var cell of randomEmptyCells(puzzle, 2)) {
      puzzle.grid[cell.x][cell.y] = {'type': 'square', 'color': colors[0]}
    }
    for (var cell of randomEmptyCells(puzzle, 2)) {
      puzzle.grid[cell.x][cell.y] = {'type': 'square', 'color': colors[1]}
    }
    placeRandomCornerDots(puzzle, 2, window.DOT_BLACK)
    cutRandomEdges(puzzle, 8)
    return puzzle
  }
}

// Some puzzle functions, separated out to avoid duplication
function largeMaze() {
  var puzzle = new Puzzle(7, 7)
  puzzle.grid[0][14].start = true
  puzzle.grid[14][0].end = 'top'

  cutRandomEdges(puzzle, 57)
  return puzzle
}

function tripleTwoColor() {
  var puzzle = new Puzzle(4, 4)
  puzzle.grid[0][8].start = true
  puzzle.grid[8][0].end = 'top'

  for (var cell of randomEmptyCells(puzzle, 6)) {
    puzzle.grid[cell.x][cell.y] = {'type': 'square', 'color': 'white'}
  }
  for (var cell of randomEmptyCells(puzzle, 6)) {
    puzzle.grid[cell.x][cell.y] = {'type': 'square', 'color': 'black'}
  }

  // Check for invalid triple L shape in both solvable and unsolvable puzzles.
  if (puzzleHasInvalidTriple(puzzle)) return null

  return puzzle
}

function tripleThreeColor() {
  var puzzle = new Puzzle(4, 4)
  puzzle.grid[0][8].start = true
  puzzle.grid[8][0].end = 'top'

  for (var cell of randomEmptyCells(puzzle, 5)) {
    puzzle.grid[cell.x][cell.y] = {'type': 'square', 'color': 'white'}
  }
  for (var cell of randomEmptyCells(puzzle, 2)) {
    puzzle.grid[cell.x][cell.y] = {'type': 'square', 'color': 'purple'}
  }
  for (var cell of randomEmptyCells(puzzle, 2)) {
    puzzle.grid[cell.x][cell.y] = {'type': 'square', 'color': 'green'}
  }

  // Check for invalid triple L shape in both solvable and unsolvable puzzles.
  if (puzzleHasInvalidTriple(puzzle)) return null

  return puzzle
}

function polyominosAndStars() {
  var puzzle = new Puzzle(4, 4)
  puzzle.grid[0][8].start = true
  puzzle.grid[8][0].end = 'top'

  var colors = shuffle(['#052812', '#FFC17A', '#A4C34F', '#B52EBD', '#99EC35'])
  while (true) {
    var cells = randomEmptyCells(puzzle, 2)
    var manhattanDistance = Math.abs(cells[0].x - cells[1].x) + Math.abs(cells[0].y - cells[1].y)
    if (manhattanDistance >= 6) break
  }
  puzzle.grid[cells[0].x][cells[0].y] = {'type': 'star', 'color': colors[0]}
  puzzle.grid[cells[1].x][cells[1].y] = {'type': 'star', 'color': colors[0]}

  for (var cell of randomEmptyCells(puzzle, 2)) {
    puzzle.grid[cell.x][cell.y] = {'type': 'poly', 'color': colors[1], 'polyshape': randomPolyomino()}
  }
  cutRandomEdges(puzzle, 8)
  return puzzle
}

function triangles(count) {
  var puzzle = new Puzzle(4, 4)
  puzzle.grid[0][8].start = true
  puzzle.grid[8][0].end = 'top'

  for (var cell of randomEmptyCells(puzzle, count)) {
    puzzle.grid[cell.x][cell.y] = {'type': 'triangle', 'color': 'orange', 'count': randomTriangle()}
  }
  return puzzle
}

// Helper functions for RNG, not mimicing the game
function getRandomElement(list) {
  return list[randInt(list.length)]
}

function popRandomElement(list) {
  return list.splice(randInt(list.length), 1)[0]
}

function shuffle(list) {
  for (var i=list.length-1; i>0; i--) { // Knuth randomization
    var j = randInt(i)
    var tmp = list[j]
    list[j] = list[i]
    list[i] = tmp
  }
  return list
}

// We compute different "RNG seeds" per puzzle, which allows us to independently compute RNG without generating the entire sequence.
var contextHash = 0
var seedOffset = 0 // But, we still want to use the same base seed -- so this number increments per puzzle.
function randInt(n) {
  return squirrel3(contextHash + (++seedOffset)) % Math.floor(n)
}

function setRngContext(str) {
  contextHash = seed
  for (var i = 0; i < str.length; i++) {
    contextHash = squirrel3(contextHash + str.charCodeAt(i))
  }

  seedOffset = 0
}

// Credit https://youtu.be/LWFzPP8ZbdU (Squirrel Eiserloh, GDC 2017)
function squirrel3(data) {
  data = (data * 0xB5297A4D) & 0xFFFFFFFF
  data = (data ^ data >> 8)
  data = (data * 0x68E31DA4) & 0xFFFFFFFF
  data = (data ^ data << 8)  & 0xFFFFFFFF
  data = (data * 0x1B56C4E9) & 0xFFFFFFFF
  data = (data ^ data >> 8)
  return data
}

function getCells(puzzle, getter, count, filter) {
  var cells = []
  for (var x=0; x<puzzle.width; x++) {
    for (var y=0; y<puzzle.height; y++) {
      if (filter(x, y)) cells.push({'x':x, 'y':y})
    }
  }
  var output = []
  for (var i=0; i<count; i++) output.push(getter(cells))
  return output
}

function randomEmptyCells(puzzle, count) {
  return getCells(puzzle, popRandomElement, count, function(x, y) {
    return (x%2 === 1 && y%2 === 1 && puzzle.grid[x][y] == null)
  })
}

function randomCells(puzzle, count) {
  return getCells(puzzle, getRandomElement, count, function(x, y) {
    return (x%2 === 1 && y%2 === 1)
  })
}

function cutRandomEdges(puzzle, count) {
  var cells = getCells(puzzle, getRandomElement, count, function(x, y) {
    return (x%2 !== y%2)
  })
  for (var cell of cells) puzzle.grid[cell.x][cell.y].gap = window.GAP_BREAK
}

function placeRandomCornerDots(puzzle, count, dotColor) {
  var cells = getCells(puzzle, popRandomElement, count, function(x, y) {
    if (x%2 === 1 || y%2 === 1) return false
    var cell = puzzle.grid[x][y]
    return (cell.dot == null && cell.start !== true && cell.end == null)
  })
  for (var cell of cells) puzzle.grid[cell.x][cell.y].dot = dotColor
}

function randomTriangle() {
  var rng = randInt(100)
  if (rng >=  0 && rng <= 50) return 1 // 51%
  if (rng >= 51 && rng <= 85) return 2 // 35%
  if (rng >= 86 && rng <= 99) return 3 // 14%
}

function randomPolyomino() {
  // The game generates polyshapes by randomly moving right or down until the shape is generated, then randomly rotating the result.
  // We can be a bit more efficient by precomputing the shapes.
  // Note that diagonal inverses (RR vs DD) do not effect the random results, and are thus not pictured nor included.

  var polyshape = null
  var size = randInt(3) + 3
  if (size === 3) {
    /* RR ###  RD ##
                   # */
    polyshape = getRandomElement([273, 49])
  } else if (size === 4) {
    /* RRR ####  RRD ###  RDR ##   RDD ##
                       #       ##       #
                                        # */
    polyshape = getRandomElement([4369, 785, 561, 113])
  } else if (size === 5) {
    /* RRRR #####  RRRD ####  RRDR ###   RRDD ###  RDRR ##    RDRD ##    RDDR ##   RDDD ##
                           #         ##         #        ###        ##         #         #
                                                #                    #         ##        #
                                                                                         # */
    /* DRRR #    DRRD #   DRDR #   DRDD #  DDRR #   DDRD #  DDDR #  DDDD #
            ####      ###      ##       ##      #        #       #       #
                        #       ##       #      ###      ##      #       #
                                         #                #      ##      #
                                                                         # */

    // NOTE: RRRR and its counterpart DDDD clearly do not fit in a 4x4 grid. The game *does not account for this*,
    // and instead wraps around, resulting in either a 5-J or 4-I, respectively.
    polyshape = getRandomElement([4731, 12561, 8977, 1809, 8753, 1585, 1137, 241,
                                  8739, 1571,  1123, 227,  1095, 199,  143,  15])
  }
  return window.rotatePolyshape(polyshape, randInt(4))
}

function applyRandomPillarSymmetry(puzzle, rng) {
  if (rng === 0) {
    puzzle.symmetry = {'x': false, 'y': false}
    puzzle.grid[2][12].start = true
    puzzle.grid[8][12].start = true
    puzzle.grid[2][0].end = 'top'
    puzzle.grid[8][0].end = 'top'
  } else if (rng === 1) {
    puzzle.symmetry = {'x': false, 'y': true}
    puzzle.grid[2][12].start = true
    puzzle.grid[8][0].start = true
    puzzle.grid[2][0].end = 'top'
    puzzle.grid[8][12].end = 'bottom'
  } else if (rng === 2) {
    puzzle.symmetry = {'x': true, 'y': false}
    puzzle.grid[2][12].start = true
    puzzle.grid[4][12].start = true
    puzzle.grid[2][0].end = 'top'
    puzzle.grid[4][0].end = 'top'
  } else if (rng === 3) {
    puzzle.symmetry = {'x': true, 'y': true}
    puzzle.grid[2][0].start = true
    puzzle.grid[4][12].start = true
    puzzle.grid[2][12].end = 'bottom'
    puzzle.grid[4][0].end = 'top'
  }
}

function puzzleHasInvalidTriple(puzzle) {
  var colorFlags = []
  for (var x=-1; x<puzzle.width+1; x+=2) colorFlags[x] = []

  // Extend each color out in a + (so that we only have to map once)
  for (var x=1; x<puzzle.width-1; x+=2) {
    for (var y=1; y<puzzle.height-1; y+=2) {
      var cell = puzzle.grid[x][y]
      if (cell == null) continue
      var flag = 0
      if      (cell.color == 'white')  flag = 1
      else if (cell.color == 'purple') flag = 2
      else if (cell.color == 'green')  flag = 4
      else continue

      colorFlags[x-2][y] |= flag
      colorFlags[x][y-2] |= flag
      colorFlags[x][y] |= flag
      colorFlags[x][y+2] |= flag
      colorFlags[x+2][y] |= flag
    }
  }

  // Then check to see if any cell has all 3 colors in its adjacency
  for (var x=1; x<puzzle.width-1; x+=2) {
    for (var y=1; y<puzzle.height-1; y+=2) {
      if (colorFlags[x][y] === 7) return true
    }
  }
  return false
}

})
