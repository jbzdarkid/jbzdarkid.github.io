window.DISABLE_CACHE = true
var customColor = 'gray'
var activeParams = {'type': 'nonce', 'color':'black', 'polyshape': 785}
var puzzle, solutions, currentSolution

window.onload = function() {
  var activePuzzle = window.localStorage.getItem('activePuzzle')
  var serialized = window.localStorage.getItem(activePuzzle)
  if (!_tryUpdatePuzzle(serialized)) newPuzzle()

  drawSymbolButtons()
  drawColorButtons()
  var puzzleName = document.getElementById('puzzleName')
  puzzleName.oninput = function() {savePuzzle()}
  puzzleName.onkeypress = function(event) {
    if (event.key == "Enter") {
      event.preventDefault()
      this.blur()
    }
    if (this.innerText.length >= 50) {
      event.preventDefault()
    }
  }
}

function _addPuzzleToList(puzzleName) {
  var puzzleList = JSON.parse(window.localStorage.getItem('puzzleList'))
  if (!puzzleList) puzzleList = []
  puzzleList.unshift(puzzleName)
  window.localStorage.setItem('puzzleList', JSON.stringify(puzzleList))
}

function _removePuzzleFromList(puzzleName) {
  console.log('Removing puzzle', puzzleName)
  var puzzleList = JSON.parse(window.localStorage.getItem('puzzleList'))
  if (!puzzleList) puzzleList = []
  var index = puzzleList.indexOf(puzzleName)
  if (index != -1) {
    puzzleList.splice(index, 1)
    window.localStorage.setItem('puzzleList', JSON.stringify(puzzleList))
  }
}

function _tryUpdatePuzzle(serialized) {
  if (!serialized) return false
  var savedPuzzle = puzzle
  try {
    puzzle = Puzzle.deserialize(serialized)
    updatePuzzle() // Will throw for most invalid puzzles
    document.getElementById('puzzleName').innerText = puzzle.name
    return true
  } catch (e) {
    console.log(e)
    puzzle = savedPuzzle
    updatePuzzle()
    return false
  }
}

function newPuzzle() {
  puzzle = new Puzzle(4, 4)
  solutions = []
  currentSolution = 0
  document.getElementById('puzzleName').innerText = 'Unnamed Puzzle'
  window.localStorage.setItem('activePuzzle', '')
  redraw(puzzle)
}

function savePuzzle() {
  // Delete the old puzzle & add the current
  var activePuzzle = window.localStorage.getItem('activePuzzle')
  window.localStorage.removeItem(activePuzzle)
  _removePuzzleFromList(activePuzzle)

  // Save the new version
  puzzle.name = document.getElementById('puzzleName').innerText
  console.log('Saving puzzle', puzzle.name)
  // TODO: Some intelligence about showing day / month / etc depending on date age
  var savedPuzzle = puzzle.name + ' on ' + (new Date()).toLocaleString()
  _addPuzzleToList(savedPuzzle)
  window.localStorage.setItem(savedPuzzle, puzzle.serialize())
  window.localStorage.setItem('activePuzzle', savedPuzzle)
}

function deletePuzzleAndLoadNext() {
  var activePuzzle = window.localStorage.getItem('activePuzzle')
  console.log('Deleting', activePuzzle)
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

function loadPuzzle() {
  var puzzleList = JSON.parse(window.localStorage.getItem('puzzleList'))
  if (!puzzleList) return

  document.getElementById('puzzleMeta').style.opacity = 0
  
  var anchor = document.createElement('div')
  anchor.id = 'anchor'
  anchor.style.position = 'absolute'
  anchor.style.top = 100
  anchor.style.width = '100%'
  document.body.appendChild(anchor)
  
  var loadList = document.createElement('select')
  anchor.appendChild(loadList)
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
      _removePuzzleFromList(this.value)
    }

    var anchor = document.getElementById('anchor')
    anchor.parentElement.removeChild(anchor)
    document.getElementById('puzzleMeta').style.opacity = null
  }
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

function drawSymbolButtons() {
  var symbolButtons = [
    {'type':'start'},
    {'type':'end'},
    {'type':'gap', 'rot':0},
    {'type':'dot'},
    {'type':'square'},
    {'type':'star'},
    {'type':'nega'},
    {'type':'triangle', 'count':1},
    {'type':'poly', 'rot':0},
    {'type':'ylop', 'rot':0},
    {'type':'poly', 'rot':'all'},
    {'type':'ylop', 'rot':'all'},
  ]
  var symbolCell = document.getElementById('symbols')
  while (symbolCell.firstChild) symbolCell.removeChild(symbolCell.firstChild)
  for (var params of symbolButtons) {
    if (['gap', 'square', 'nega', 'poly'].includes(params.type)) {
      symbolCell.appendChild(document.createElement('br'))
    }
    params = Object.assign(JSON.parse(JSON.stringify(activeParams)), params)
    params.height = 76
    params.width = 76
    params.border = 2

    var buttonElem = document.createElement('button')
    buttonElem.style.padding = 0
    buttonElem.style.border = params.border
    buttonElem.style.height = params.height + 2*params.border
    buttonElem.style.width = params.width + 2*params.border
    buttonElem.params = params
    if (['poly', 'ylop'].includes(params.type)) {
      buttonElem.onclick = function() {
        shapeChooser()
        activeParams = Object.assign(activeParams, this.params)
      }
    } else {
      buttonElem.onclick = function() {activeParams = Object.assign(activeParams, this.params)}
    }
    buttonElem.appendChild(drawSymbol(params))
    symbolCell.appendChild(buttonElem)
  }
}

function drawColorButtons() {
  var colorButtons = [
    {'color':'black'},
    {'color':'white'},
    {'color':'red'},
    {'color':'orange'},
    {'color':'yellow'},
    {'color':'green'},
    {'color':'blue'},
    {'color':'purple'}
  ]
  var colorCell = document.getElementById('colors')
  while (colorCell.firstChild) colorCell.removeChild(colorCell.firstChild)
  for (var params of colorButtons) {
    params.text = params.color
    params.width = 196
    params.height = 50
    params.border = 2

    var buttonElem = document.createElement('button')
    buttonElem.style.padding = 0
    buttonElem.style.border = params.border
    buttonElem.style.height = params.height + 2*params.border
    buttonElem.style.width = params.width + 2*params.border
    buttonElem.params = params
    buttonElem.onclick = function() {
      activeParams = Object.assign(activeParams, this.params)
      drawSymbolButtons()
    }
    buttonElem.appendChild(_crayon(params))
    colorCell.appendChild(buttonElem)
    colorCell.appendChild(document.createElement('br'))
  }
}

function shapeChooser() {
  var puzzle = document.getElementById('puzzle')
  puzzle.style.opacity = 0
  
  var anchor = document.createElement('div')
  anchor.id = 'anchor'
  anchor.style.width = '99%'
  anchor.style.height = '100%'
  anchor.style.position = 'absolute'
  anchor.style.top = 0
  anchor.onmousedown = function(event) {shapeChooserClick(event)}
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
  chooser.onmousedown = function(event) {shapeChooserClick(event, this)}
  for (var x=0; x<4; x++) {
    var row = chooser.insertRow(x)
    for (var y=0; y<4; y++) {
      var cell = row.insertCell(y)
      cell.id = 'chooser_' + x + '_' + y
      cell.powerOfTwo = 1 << (x*4 + y)
      cell.onmousedown = function(event) {shapeChooserClick(event, this)}
      cell.style.width = 58
      cell.style.height = 58
      if ((activeParams.polyshape & cell.powerOfTwo) != 0) {
        cell.clicked = true
        cell.style.background = activeParams.color
      } else {
        cell.clicked = false
        cell.style.background = FOREGROUND
      }
    }
  }
}

function shapeChooserClick(event, cell) {
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
    cell.style.background = activeParams.color
  } else {
    cell.style.background = FOREGROUND
  }
  drawSymbolButtons()
}

function updatePuzzle() {
  document.getElementById('puzzleName').innerText = puzzle.name
  redraw(puzzle)
  solutions = []
  solve(puzzle, puzzle.start.x, puzzle.start.y, solutions)
  
  document.getElementById('solutionCount').innerText = solutions.length
  currentSolution = -1
}

function drawSolution(offset) {
  currentSolution += offset
  if (currentSolution < 0) currentSolution = solutions.length - 1
  if (currentSolution >= solutions.length) currentSolution = 0
  redraw(solutions[currentSolution])
}

function redraw(puzzleOrSolution) {
  draw(puzzleOrSolution)
  var puzzleElement = document.getElementById('puzzle')
  for (var elem of puzzleElement.getElementsByTagName('td')) {
    elem.onclick = function() {_onElementClicked(this.id)}
  }
}

function _onElementClicked(id)
{
  var x = parseInt(id.split('_')[1])
  var y = parseInt(id.split('_')[2])
  
  if (['start', 'end'].includes(activeParams.type)) {
    if (x%2 != 0 || y%2 != 0) return
    if (x == 0 || y == 0 || x == puzzle.grid.length - 1 || y == puzzle.grid[x].length - 1) {
      if (activeParams.type == 'start') puzzle.start = {'x':x, 'y':y}
      if (activeParams.type == 'end') puzzle.end = {'x':x, 'y':y}
    }
  } else if (['gap', 'dot'].includes(activeParams.type)) {
    if (x%2 + y%2 != 1) return
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
    console.log(foundGap, foundDot)
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
  updatePuzzle()
}
