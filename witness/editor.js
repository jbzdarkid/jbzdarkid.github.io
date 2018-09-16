window.DISABLE_CACHE = true
var customColor = 'gray'
var activeParams = {'id':'', 'polyshape': 71}
var puzzle
var dragging = false
var solutions = []

window.onload = function() {
  recolor()
  var activePuzzle = window.localStorage.getItem('activePuzzle')
  var serialized = window.localStorage.getItem(activePuzzle)

  newPuzzle() // Load an empty puzzle so that we have a fall-back
  if (_tryUpdatePuzzle(serialized)) {
    window.localStorage.setItem('activePuzzle', activePuzzle)
  }

  _drawSymbolButtons()
  _drawColorButtons()
  var puzzleName = document.getElementById('puzzleName')
  puzzleName.oninput = function() {savePuzzle()}
  puzzleName.onkeypress = function(event) {
    if (event.key == 'Enter') {
      event.preventDefault()
      this.blur()
    }
    if (this.innerText.length >= 50) {
      event.preventDefault()
    }
  }

  for (var resize of document.getElementsByClassName('resize')) {
    resize.onmousedown = function(event) {_dragStart(event, this)}
  }
}

function newPuzzle() {
  puzzle = new Puzzle(4, 4)
  puzzle.name = 'Unnamed Puzzle'
  _redraw(puzzle)
  window.localStorage.setItem('activePuzzle', '')
}

function savePuzzle() {
  // Delete the old puzzle & add the current
  var activePuzzle = window.localStorage.getItem('activePuzzle')
  window.localStorage.removeItem(activePuzzle)
  _removePuzzleFromList(activePuzzle)

  // Save the new version
  puzzle.name = document.getElementById('puzzleName').innerText
  // console.log('Saving puzzle', puzzle.name)
  // TODO: Some intelligence about showing day / month / etc depending on date age
  var savedPuzzle = puzzle.name + ' on ' + (new Date()).toLocaleString()
  _addPuzzleToList(savedPuzzle)
  window.localStorage.setItem(savedPuzzle, puzzle.serialize())
}

function loadPuzzle() {
  var puzzleList = JSON.parse(window.localStorage.getItem('puzzleList'))
  if (!puzzleList) return

  var buttons = document.getElementById('metaButtons')
  var loadList = document.createElement('select')
  document.body.insertBefore(loadList, buttons)
  loadList.style.width = buttons.offsetWidth
  buttons.style.display = 'none'

  for (var puzzleName of puzzleList) {
    var option = document.createElement('option')
    option.innerText = puzzleName
    loadList.appendChild(option)
  }

  loadList.value = '' // Forces onchange to fire for any selection
  loadList.onchange = function() {
    _removePuzzleFromList(this.value)
    _addPuzzleToList(this.value)

    var serialized = window.localStorage.getItem(this.value)
    if (!_tryUpdatePuzzle(serialized)) {
      deletePuzzleAndLoadNext()
    }

    document.body.removeChild(buttons.previousSibling)
    document.getElementById('metaButtons').style.display = 'inline'
  }
}

function deletePuzzleAndLoadNext() {
  var activePuzzle = window.localStorage.getItem('activePuzzle')
  // console.log('Deleting', activePuzzle)
  window.localStorage.removeItem(activePuzzle)
  _removePuzzleFromList(activePuzzle)

  var puzzleList = JSON.parse(window.localStorage.getItem('puzzleList'))
  while (puzzleList.length > 0) {
    var serialized = window.localStorage.getItem(puzzleList[0])
    if (_tryUpdatePuzzle(serialized)) break
    puzzleList.shift()
  }

  if (puzzleList.length == 0) {
    window.localStorage.clear()
    newPuzzle()
    return
  }
  window.localStorage.setItem('activePuzzle', puzzleList[0])
}

function importPuzzle() {
  var serialized = prompt('Paste your puzzle here:')
  if (!_tryUpdatePuzzle(serialized)) {
    // Only alert if user tried to enter data
    if (serialized) alert('Not a valid puzzle!')
    return
  }
  var savedPuzzle = puzzle.name + ' on ' + (new Date()).toLocaleString()
  _addPuzzleToList(savedPuzzle)
  window.localStorage.setItem(savedPuzzle, serialized)
}

function exportPuzzle() {
  var elem = document.getElementById('export')
  elem.value = puzzle.serialize()
  elem.style.display = null
  elem.select()
  document.execCommand('copy')
  elem.style.display = 'none'
  alert('Puzzle copied to clipboard.')
}

function playPuzzle() {
  window.location.href = 'index.html?puzzle=' + puzzle.serialize()
}

function solvePuzzle() {
  if (puzzle.grid.length * puzzle.grid[0].length > 121) {
    // Larger than 5x5 (internal 11x11)
    if (!confirm('Caution: You are solving a large puzzle (>25 cells). This will take more than 5 minutes to run.')) {
      return
    }
  }
  solutions = []
  solve(puzzle, puzzle.start.x, puzzle.start.y, solutions)
  _showSolution(0, puzzle)
}

function _showSolution(num, puzzle) {
  if (num < 0) num = solutions.length - 1
  if (num >= solutions.length) num = 0

  var previousSolution = document.getElementById('previousSolution')
  var solutionCount = document.getElementById('solutionCount')
  var nextSolution = document.getElementById('nextSolution')

  // Buttons & text
  if (solutions.length < 2) { // 0 or 1 solution(s), arrows are useless
    solutionCount.innerText = solutions.length + ' of ' + solutions.length
    previousSolution.disabled = true
    nextSolution.disabled = true
  } else {
    solutionCount.innerText = (num + 1) + ' of ' + solutions.length
    previousSolution.disabled = null
    nextSolution.disabled = null
    previousSolution.onclick = function() {_showSolution(num - 1, puzzle)}
    nextSolution.onclick = function() {_showSolution(num + 1, puzzle)}
  }
  if (solutions[num] != undefined) {
    solutions[num].name = puzzle.name
    _redraw(solutions[num])
  }
  document.getElementById('solutionViewer').style.display = null
}

function _addPuzzleToList(puzzleName) {
  var puzzleList = JSON.parse(window.localStorage.getItem('puzzleList'))
  if (!puzzleList) puzzleList = []
  puzzleList.unshift(puzzleName)
  window.localStorage.setItem('puzzleList', JSON.stringify(puzzleList))
  window.localStorage.setItem('activePuzzle', puzzleName)
}

function _removePuzzleFromList(puzzleName) {
  // console.log('Removing puzzle', puzzleName)
  var puzzleList = JSON.parse(window.localStorage.getItem('puzzleList'))
  if (!puzzleList) puzzleList = []
  var index = puzzleList.indexOf(puzzleName)
  if (index == -1) return
  puzzleList.splice(index, 1)
  window.localStorage.setItem('puzzleList', JSON.stringify(puzzleList))
}

function _tryUpdatePuzzle(serialized) {
  if (!serialized) return false
  var savedPuzzle = puzzle
  try {
    puzzle = Puzzle.deserialize(serialized)
    _redraw(puzzle) // Will throw for most invalid puzzles
    document.getElementById('puzzleName').innerText = puzzle.name
    return true
  } catch (e) {
    console.log(e)
    puzzle = savedPuzzle
    _redraw(puzzle)
    return false
  }
}

function _redraw(puzzle) {
  document.getElementById('puzzleName').innerText = puzzle.name
  draw(puzzle)
  var puzzleElement = document.getElementById('puzzle')
  document.getElementById('solutionViewer').style.display = 'none'

  var xPos = 40
  var topLeft = {'x':40, 'y':40}
  for (var x=0; x<puzzle.grid.length; x++) {
    var yPos = 40
    for (var y=0; y<puzzle.grid[x].length; y++) {
      var width = (x%2 == 0 ? 24 : 58)
      var height = (y%2 == 0 ? 24 : 58)
      var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      puzzleElement.appendChild(rect)
      rect.setAttribute('x', xPos)
      rect.setAttribute('y', yPos)
      rect.setAttribute('width', width)
      rect.setAttribute('height', height)
      rect.setAttribute('fill', 'white')
      rect.setAttribute('opacity', 0)
      yPos += height
      rect.id = x + '_' + y
      rect.onclick = function() {_onElementClicked(this)}
      rect.onmouseover = function() {this.setAttribute('opacity', 0.1)}
      rect.onmouseout = function() {this.setAttribute('opacity', 0)}
    }
    xPos += width
  }
}

function _onElementClicked(elem) {
  var x = parseInt(elem.id.split('_')[0])
  var y = parseInt(elem.id.split('_')[1])

  if (['start', 'end'].includes(activeParams.type)) {
    if (x%2 != 0 || y%2 != 0) return
    if (x == 0 || y == 0 || x == puzzle.grid.length - 1 || y == puzzle.grid[x].length - 1) {
      if (activeParams.type == 'start') puzzle.start = {'x':x, 'y':y}
      if (activeParams.type == 'end') puzzle.end = {'x':x, 'y':y}
    }
  } else if (['gap', 'dot'].includes(activeParams.type)) {
    if (x%2 == 1 && y%2 == 1) return
    if (activeParams.type == 'gap' && x%2 == 0 && y%2 == 0) return
    var foundGap = false
    for (var i=0; i < puzzle.gaps.length; i++) {
      if (puzzle.gaps[i].x == x && puzzle.gaps[i].y == y) {
        puzzle.gaps.splice(i, 1)
        foundGap = true
        break
      }
    }
    var foundDot = false
    for (var i=0; i < puzzle.dots.length; i++) {
      if (puzzle.dots[i].x == x && puzzle.dots[i].y == y) {
        puzzle.dots.splice(i, 1)
        foundDot = true
        break
      }
    }
    if (activeParams.type == 'gap' && !foundGap) puzzle.gaps.push({'x':x, 'y':y})
    if (activeParams.type == 'dot' && !foundDot) puzzle.dots.push({'x':x, 'y':y})
  } else if (['square', 'star', 'nega'].includes(activeParams.type)) {
    if (x%2 != 1 || y%2 != 1) return
    // Only change one thing at a time -- if you change color, don't toggle the symbol
    if (puzzle.grid[x][y].type == activeParams.type
     && puzzle.grid[x][y].color == activeParams.color) {
      puzzle.grid[x][y] = false
    } else {
      puzzle.grid[x][y] = {
        'type': activeParams.type,
        'color': activeParams.color,
      }
    }
  } else if (['poly', 'ylop'].includes(activeParams.type)) {
    if (x%2 != 1 || y%2 != 1) return
    // Only change one thing at a time -- if you change color, don't toggle the symbol
    if (puzzle.grid[x][y].type == activeParams.type
     && puzzle.grid[x][y].color == activeParams.color
     && puzzle.grid[x][y].polyshape == activeParams.polyshape
     && puzzle.grid[x][y].rot == activeParams.rot) {
      puzzle.grid[x][y] = false
    } else {
      puzzle.grid[x][y] = {
        'type': activeParams.type,
        'color': activeParams.color,
        'polyshape': activeParams.polyshape,
        'rot': activeParams.rot,
      }
    }
  } else if (activeParams.type == 'triangle') {
    if (x%2 != 1 || y%2 != 1) return
    var count = 0
    if (puzzle.grid[x][y].type == activeParams.type) {
      count = puzzle.grid[x][y].count
      // Only change one thing at a time -- if you change color, count shouldn't change as well.
      if (activeParams.color != puzzle.grid[x][y].color) {
        count--
      }
    }
    if (puzzle.grid[x][y].count == 3) {
      puzzle.grid[x][y] = false
    } else {
      puzzle.grid[x][y] = {
        'type': activeParams.type,
        'color': activeParams.color,
        'count': count+1,
      }
    }
  }

  savePuzzle()
  _redraw(puzzle)
}

function _drawSymbolButtons() {
  var symbolData = {
    'start': {'type':'start'},
    'end': {'type':'end', 'y':18, 'dir':'top'},
    'gap': {'type':'gap'},
    'dot': {'type':'dot'},
    'square': {'type':'square'},
    'star': {'type':'star'},
    'nega': {'type':'nega'},
    'triangle': {'type':'triangle', 'count':1},
    'poly': {'type':'poly', 'rot':0, 'polyshape':71},
    'rpoly': {'type':'poly', 'rot':'all', 'polyshape':71},
    'ylop': {'type':'ylop', 'rot':0, 'polyshape':71},
    'rylop': {'type':'ylop', 'rot':'all', 'polyshape':71},
  }
  var symbolTable = document.getElementById('symbolButtons')
  for (var button of symbolTable.getElementsByTagName('button')) {
    var params = symbolData[button.id]
    params.id = button.id
    params.height = 64
    params.width = 64
    params.border = 2
    if (activeParams.id == button.id) {
      button.parentElement.style.background = BORDER
    } else {
      button.parentElement.style.background = null
    }
    button.style.padding = 0
    button.style.border = params.border
    button.style.height = params.height + 2*params.border
    button.style.width = params.width + 2*params.border
    button.params = params
    if (['poly', 'rpoly', 'ylop', 'rylop'].includes(button.id)) {
      button.params.polyshape = activeParams.polyshape
      button.onclick = function() {
        if (activeParams.id == this.id) {
          activeParams = Object.assign(activeParams, this.params)
          _shapeChooser()
        } else {
          activeParams = Object.assign(activeParams, this.params)
          _drawSymbolButtons()
        }
      }
    } else {
      button.onclick = function() {
        activeParams = Object.assign(activeParams, this.params)
        _drawSymbolButtons()
      }
    }
    while (button.firstChild) button.removeChild(button.firstChild)
    button.appendChild(drawSymbol(params))
  }
}

function _drawColorButtons() {
  var colorTable = document.getElementById('colorButtons')
  for (var button of colorTable.getElementsByTagName('button')) {
    var params = {'width':146, 'height':45, 'border':2}
    params.text = button.id
    params.color = button.id
    if (activeParams.color == button.id) {
      button.parentElement.style.background = BORDER
    } else {
      button.parentElement.style.background = null
    }
    button.style.padding = 0
    button.style.border = params.border
    button.style.height = params.height + 2*params.border
    button.style.width = params.width + 2*params.border
    button.onclick = function() {
      activeParams.color = this.id
      _drawColorButtons()
    }
    while (button.firstChild) button.removeChild(button.firstChild)
    params.type = 'crayon'
    button.appendChild(drawSymbol(params))
  }
}

function _shapeChooser() {
  var puzzle = document.getElementById('puzzle')
  puzzle.style.opacity = 0

  var anchor = document.createElement('div')
  anchor.id = 'anchor'
  anchor.style.width = '99%'
  anchor.style.height = '100%'
  anchor.style.position = 'absolute'
  anchor.style.top = 0
  anchor.onmousedown = function(event) {_shapeChooserClick(event)}
  document.body.appendChild(anchor)

  var chooser = document.createElement('table')
  puzzle.parentElement.insertBefore(chooser, puzzle)
  chooser.id = 'chooser'
  chooser.setAttribute('cellspacing', '24px')
  chooser.setAttribute('cellpadding', '0px')
  chooser.style.zIndex = 1 // Position in front of the puzzle
  chooser.style.position = 'absolute'
  chooser.style.padding = 25
  chooser.style.background = BACKGROUND
  chooser.style.border = BORDER
  chooser.onmousedown = function(event) {_shapeChooserClick(event, this)}
  for (var x=0; x<4; x++) {
    var row = chooser.insertRow(x)
    for (var y=0; y<4; y++) {
      var cell = row.insertCell(y)
      cell.id = 'chooser_' + x + '_' + y
      cell.powerOfTwo = 1 << (x + y*4)
      cell.onmousedown = function(event) {_shapeChooserClick(event, this)}
      cell.style.width = 58
      cell.style.height = 58
      if ((activeParams.polyshape & cell.powerOfTwo) != 0) {
        cell.clicked = true
        cell.style.background = 'black'
      } else {
        cell.clicked = false
        cell.style.background = FOREGROUND
      }
    }
  }
}

function _shapeChooserClick(event, cell) {
  if (cell == undefined) {
    var chooser = document.getElementById('chooser')
    var anchor = document.getElementById('anchor')
    var puzzle = document.getElementById('puzzle')

    chooser.parentElement.removeChild(chooser)
    anchor.parentElement.removeChild(anchor)
    puzzle.style.opacity = null
    event.stopPropagation()
    return
  }
  // Clicks inside the chooser box are non-closing
  if (cell.id == 'chooser') {
    event.stopPropagation()
    return
  }
  var x = cell.id.split('_')[1]
  var y = cell.id.split('_')[2]
  cell.clicked = !cell.clicked
  var chooser = document.getElementById('chooser')
  activeParams.polyshape ^= cell.powerOfTwo
  if (cell.clicked) {
    cell.style.background = 'black'
  } else {
    cell.style.background = FOREGROUND
  }
  _drawSymbolButtons()
}

function resizePuzzle(dx, dy, id) {
  var newWidth = puzzle.grid.length + 2 * dx
  var newHeight = puzzle.grid[0].length + 2 * dy

  if (newWidth < 0 || newHeight < 0) return false
  // TODO: Maximum size goes here

  if (id.includes('left')) {
    while (puzzle.grid.length > newWidth) puzzle.grid.shift()
    while (puzzle.grid.length < newWidth) {
      puzzle.grid.unshift((new Array(newHeight)).fill(false))
    }
  }
  if (id.includes('right')) {
    while (puzzle.grid.length > newWidth) puzzle.grid.pop()
    while (puzzle.grid.length < newWidth) {
      puzzle.grid.push((new Array(newHeight)).fill(false))
    }
  }
  if (id.includes('top')) {
    for (var row of puzzle.grid) {
      while (row.length > newHeight) row.shift()
      while (row.length < newHeight) row.unshift(false)
    }
  }
  if (id.includes('bottom')) {
    for (var row of puzzle.grid) {
      while (row.length > newHeight) row.pop()
      while (row.length < newHeight) row.push(false)
    }
  }

  var newDots = []
  for (var dot of puzzle.dots) {
    if (id.includes('right')) dot.x += 2 * dx
    if (id.includes('bottom')) dot.y += 2 * dy
    if (dot.x < newWidth && dot.y < newHeight) newDots.push(dot)
  }
  puzzle.dots = newDots
  var newGaps = []
  for (var gap of puzzle.gaps) {
    if (id.includes('right')) gap.x += 2 * dx
    if (id.includes('bottom')) gap.y += 2 * dy
    if (gap.x < newWidth && gap.y < newHeight) newGaps.push(gap)
  }
  puzzle.gaps = newGaps

  if (id.includes('left')) {
    puzzle.start.x += 2 * dx
  }
  // Endpoint needs to be dragged always, so it doesn't fall into the center.
  puzzle.end.x += 2 * dx
  if (id.includes('top')) {
    puzzle.start.y += 2 * dy
    puzzle.end.y += 2 * dy
  }
  if (puzzle.start.x < 0) puzzle.start.x = 0
  if (puzzle.start.x >= newWidth) puzzle.start.x = newWidth - 1
  if (puzzle.start.y < 0) puzzle.start.y = 0
  if (puzzle.start.y >= newHeight) puzzle.start.y = newHeight - 1
  if (puzzle.end.x < 0) puzzle.end.x = 0
  if (puzzle.end.x >= newWidth) puzzle.end.x = newWidth - 1
  if (puzzle.end.y < 0) puzzle.end.y = 0
  if (puzzle.end.y >= newHeight) puzzle.end.y = newHeight - 1

  savePuzzle()
  _redraw(puzzle)
  return true
}

function _dragStart(event, elem) {
  dragging = {'x':event.clientX, 'y':event.clientY}

  var anchor = document.createElement('div')
  document.body.appendChild(anchor)

  anchor.id = 'anchor'
  anchor.style.position = 'absolute'
  anchor.style.top = 0
  anchor.style.width = '99%'
  anchor.style.height = '100%'
  anchor.style.cursor = elem.style.cursor
  anchor.onmousemove = function(event) {_dragMove(event, elem)}
  anchor.onmouseup = function() {
    dragging = false
    var anchor = document.getElementById('anchor')
    anchor.parentElement.removeChild(anchor)
  }
}

function _dragMove(event, elem) {
  if (!dragging) return
  if (elem.id.includes('left')) {
    var dx = dragging.x - event.clientX
  } else if (elem.id.includes('right')) {
    var dx = event.clientX - dragging.x
  } else {
    var dx = 0
  }
  if (elem.id.includes('top')) {
    var dy = dragging.y - event.clientY
  } else if (elem.id.includes('bottom')) {
    var dy = event.clientY - dragging.y
  } else {
    var dy = 0
  }

  if (Math.abs(dx) >= 82 || Math.abs(dy) >= 82) {
    if (!resizePuzzle(Math.round(dx/82), Math.round(dy/82), elem.id)) return
    // If resize succeeded, set a new reference point for future drag operations
    dragging.x = event.clientX
    dragging.y = event.clientY
  }
}
