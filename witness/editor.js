window.DISABLE_CACHE = true
var customColor = 'gray'
var activeParams = {'id':'', 'polyshape': 785}
var puzzle, solutions, currentSolution
var dragging = false

window.onload = function() {
  var activePuzzle = window.localStorage.getItem('activePuzzle')
  var serialized = window.localStorage.getItem(activePuzzle)

  newPuzzle() // Load an empty puzzle so that we have a fall-back
  if (_tryUpdatePuzzle(serialized)) {
    window.localStorage.setItem('activePuzzle', activePuzzle)
  }

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
  
  for (var resize of document.getElementsByClassName('resize')) {
    resize.onmousedown = function(event) {dragStart(event, this)}
  }
}

function dragStart(event, elem) {
  dragging = {'x':event.clientX, 'y':event.clientY}

  var anchor = document.createElement('div')
  document.body.appendChild(anchor)

  anchor.id = 'anchor'
  anchor.style.position = 'absolute'
  anchor.style.top = 0
  anchor.style.width = '99%'
  anchor.style.height = '100%'
  anchor.style.cursor = elem.style.cursor
  anchor.onmousemove = function(event) {dragMove(event, elem)}
  anchor.onmouseup = function() {
    dragging = false
    var anchor = document.getElementById('anchor')
    anchor.parentElement.removeChild(anchor)
  }
}

function dragMove(event, elem) {
  if (!dragging) return

  // Inverted because the table is stored inverted
  var dy = Math.round((event.clientX - dragging.x) / 58)
  var dx = Math.round((dragging.y - event.clientY) / 58)
  var height = puzzle.grid.length
  var width = puzzle.grid[0].length
  
  if (dx != 0 || dy != 0) {
    if (width < 0 || height < 0) return
    // TODO: Maximum grid dimensions?
    // Set a new reference point for future drag operations
    dragging.x = event.clientX
    dragging.y = event.clientY
  }
  
  if (elem.id == 'resize-topleft') resizePuzzle(dx, -dy, elem.id)
  if (elem.id == 'resize-top') resizePuzzle(dx, 0, elem.id)
  if (elem.id == 'resize-topright') resizePuzzle(dx, dy, elem.id)
  if (elem.id == 'resize-right') resizePuzzle(0, dy, elem.id)
  if (elem.id == 'resize-bottomright') resizePuzzle(-dx, dy, elem.id)
  if (elem.id == 'resize-bottom') resizePuzzle(-dx, 0, elem.id)
  if (elem.id == 'resize-bottomleft') resizePuzzle(-dx, -dy, elem.id)
  if (elem.id == 'resize-left') resizePuzzle(0, -dy, elem.id)
}

// Caution: Will loop forever if height is modified in a non top/bottom elem
// Similarly for width & left/right
function resizePuzzle(dx, dy, id) {
  var height = puzzle.grid.length + 2 * dx
  var width = puzzle.grid[0].length + 2 * dy
  
  for (var row of puzzle.grid) {
    while (row.length > width) {
      if (id.includes('left')) row.shift()
      if (id.includes('right')) row.pop()
    }
    while (row.length < width) {
      if (id.includes('left')) row.unshift(false)
      if (id.includes('right')) row.push(false)
    }
  }
  while (puzzle.grid.length > height) {
    if (id.includes('top')) puzzle.grid.shift()
    if (id.includes('bottom')) puzzle.grid.pop()
  }
  while (puzzle.grid.length < height) {
    var newRow = (new Array(width)).fill(false)
    if (id.includes('top')) puzzle.grid.unshift(newRow)
    if (id.includes('bottom')) puzzle.grid.push(newRow)
  }
  
  var newDots = []
  for (var dot of puzzle.dots) {
    if (id.includes('left')) dot.y += 2 * dy
    if (id.includes('top')) dot.x += 2 * dx
    if (dot.x < height && dot.y < width) newDots.push(dot)
  }
  puzzle.dots = newDots
  var newGaps = []
  for (var gap of puzzle.gaps) {
    if (id.includes('left')) gap.y += 2 * dy
    if (id.includes('top')) gap.y += 2 * dx
    if (gap.y < width) newGaps.push(gap)
  }
  puzzle.gaps = newGaps

  if (id.includes('left')) {
    puzzle.start.y += 2 * dy
    puzzle.end.y += 2 * dy
  }
  if (id.includes('top')) {
    puzzle.start.x += 2 * dx
    puzzle.end.x += 2 * dx
  }
  if (puzzle.start.x < 0) puzzle.start.x = 0
  if (puzzle.start.x >= height) puzzle.start.x = height - 1
  if (puzzle.start.y < 0) puzzle.start.y = 0
  if (puzzle.start.y >= width) puzzle.start.y = width - 1
  if (puzzle.end.x < 0) puzzle.end.x = 0
  if (puzzle.end.x >= height) puzzle.end.x = height - 1
  if (puzzle.end.y < 0) puzzle.end.y = 0
  if (puzzle.end.y >= width) puzzle.end.y = width - 1

  savePuzzle()
  updatePuzzle()
}

function _addPuzzleToList(puzzleName) {
  var puzzleList = JSON.parse(window.localStorage.getItem('puzzleList'))
  if (!puzzleList) puzzleList = []
  puzzleList.unshift(puzzleName)
  window.localStorage.setItem('puzzleList', JSON.stringify(puzzleList))
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
  // console.log('Saving puzzle', puzzle.name)
  // TODO: Some intelligence about showing day / month / etc depending on date age
  var savedPuzzle = puzzle.name + ' on ' + (new Date()).toLocaleString()
  _addPuzzleToList(savedPuzzle)
  window.localStorage.setItem(savedPuzzle, puzzle.serialize())
  window.localStorage.setItem('activePuzzle', savedPuzzle)
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
    window.localStorage.setItem('activePuzzle', this.value)
    
    var serialized = window.localStorage.getItem(this.value)
    if (!_tryUpdatePuzzle(serialized)) {
      deletePuzzleAndLoadNext()
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
  var symbolData = {
    'start': {'type':'start'},
    'end': {'type':'end'},
    'gap': {'type':'gap', 'rot':0},
    'dot': {'type':'dot'},
    'square': {'type':'square'},
    'star': {'type':'star'},
    'nega': {'type':'nega'},
    'triangle': {'type':'triangle', 'count':1},
    'poly': {'type':'poly', 'rot':0, 'polyshape':785},
    'rpoly': {'type':'poly', 'rot':'all', 'polyshape':785},
    'ylop': {'type':'ylop', 'rot':0, 'polyshape':785},
    'rylop': {'type':'ylop', 'rot':'all', 'polyshape':785},
  }
  var symbolTable = document.getElementById('symbolButtons')
  for (var button of symbolTable.getElementsByTagName('button')) {
    var params = symbolData[button.id]
    params.id = button.id
    params.height = 64
    params.width = 64
    params.border = 2
    if (activeParams.id == button.id) {
      button.parentElement.style.background = 'black'
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
          shapeChooser()
        } else {
          activeParams = Object.assign(activeParams, this.params)
          drawSymbolButtons()
        }
      }
    } else {
      button.onclick = function() {
        activeParams = Object.assign(activeParams, this.params)
        drawSymbolButtons()
      }
    }
    while (button.firstChild) button.removeChild(button.firstChild)
    button.appendChild(drawSymbol(params))
  }
}

function drawColorButtons() {
  var colorTable = document.getElementById('colorButtons')
  for (var button of colorTable.getElementsByTagName('button')) {
    var params = {'width':146, 'height':45, 'border':2}
    params.text = button.id
    params.color = button.id
    if (activeParams.color == button.id) {
      button.parentElement.style.background = 'black'
    } else {
      button.parentElement.style.background = null
    }
    button.style.padding = 0
    button.style.border = params.border
    button.style.height = params.height + 2*params.border
    button.style.width = params.width + 2*params.border
    button.params = params
    button.onclick = function() {
      activeParams = Object.assign(activeParams, this.params)
      drawColorButtons()
    }
    while (button.firstChild) button.removeChild(button.firstChild)
    button.appendChild(_crayon(params))
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
        cell.style.background = 'black'
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
    cell.style.background = 'black'
  } else {
    cell.style.background = FOREGROUND
  }
  drawSymbolButtons()
}

function updatePuzzle() {
  document.getElementById('puzzleName').innerText = puzzle.name
  redraw(puzzle)
  solutions = []
//  solve(puzzle, puzzle.start.x, puzzle.start.y, solutions)
//  document.getElementById('solutionCount').innerText = solutions.length
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
  updatePuzzle()
}
