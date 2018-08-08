var puzzle = new Puzzle(4, 4)
window.DISABLE_CACHE = true
var solutions = []
var currentSolution = 0
var color = 'black'
var activeParams = {'type': 'nonce', 'polyshape': 785}

window.onload = function() {
  redraw(puzzle)
  drawButtons()
}

function drawButtons() {
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
    // Deep Copy
    params = Object.assign(JSON.parse(JSON.stringify(activeParams)), params)
    params.color = color
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
      buttonElem.onclick = function() {shapeChooser(this.params)}
    } else {
      buttonElem.onclick = function() {activeParams = Object.assign(activeParams, this.params)}
    }
    buttonElem.appendChild(drawSymbol(params))
    symbolCell.appendChild(buttonElem)
  }
  
  var colorButtons = ['black', 'white', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'custom']
  var colorCell = document.getElementById('colors')
  while (colorCell.firstChild) colorCell.removeChild(colorCell.firstChild)
  for (var colorName of colorButtons) {
    var buttonElem = document.createElement('button')
    buttonElem.style.padding = '0px'
    buttonElem.style.width = '200px'
    buttonElem.id = colorName
    buttonElem.onclick = function() {color = this.id; drawButtons()}
    var crayonSvg = _crayon({'color':colorName})
    if (colorName == 'custom') {
      var foreignObj = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject')
      var input = document.createElement('input')
      input.setAttribute('type', 'color')
//      input.style.opacity = 0
//      input.style.width = '100px'
//      input.style.height = '30px'
      foreignObj.appendChild(input)
      crayonSvg.appendChild(foreignObj)
      buttonElem.onclick = null
      input.onchange = function() {color = this.value; drawButtons()}
    }
    buttonElem.appendChild(crayonSvg)
    colorCell.appendChild(buttonElem)
    colorCell.appendChild(document.createElement('br'))
  }
}

function shapeChooser(params) {
  var puzzle = document.getElementById('puzzle')
  puzzle.style.opacity = '0'
  
  var anchor = document.createElement('div')
  document.body.appendChild(anchor)
  anchor.style.position = 'absolute'
  anchor.style.top = 0
  anchor.style.width = '100%'
  anchor.style.height = '100%'
  anchor.onmousedown = function() {shapeChooserClick()}
  
  var chooser = document.createElement('table')
  anchor.appendChild(chooser)
  chooser.id = 'chooser'
  chooser.params = params
  chooser.style.textAlign = 'center'
  chooser.setAttribute('cellspacing', '24px')
  chooser.setAttribute('cellpadding', '0px')
  chooser.style.padding = 25
  chooser.style.background = BACKGROUND
  chooser.style.border = BORDER
  chooser.onmousedown = function() {shapeChooserClick(event, this)}
  for (var x=0; x<4; x++) {
    var row = chooser.insertRow(x)
    for (var y=0; y<4; y++) {
      var cell = row.insertCell(y)
      cell.id = 'chooser_' + x + '_' + y
      cell.powerOfTwo = 1 << (x*4 + y)
      cell.onmousedown = function() {shapeChooserClick(event, this)}
      cell.style.width = 58
      cell.style.height = 58
      if ((chooser.params.polyshape & cell.powerOfTwo) != 0) {
        cell.clicked = true
        cell.style.background = color
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
    var anchor = chooser.parentElement
    var puzzle = document.getElementById('puzzle')

    activeParams = chooser.params
    anchor.parentElement.removeChild(anchor)
    puzzle.style.opacity = null
    drawButtons()
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
  chooser.params.polyshape ^= cell.powerOfTwo
  if (cell.clicked) {
    cell.style.background = color
  } else {
    cell.style.background = FOREGROUND
  }
}

function updatePuzzle() {
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
  } else if (activeParams.type == 'gap') {
    if (x%2 + y%2 != 1) return
    var found = false
    for (var i=0; i < puzzle.gaps.length; i++) {
      if (puzzle.gaps[i].x == x && puzzle.gaps[i].y == y) {
        puzzle.gaps.splice(i, 1)
        found = true
        break
      }
    }
    if (!found) puzzle.gaps.push({'x':x, 'y':y})
  } else if (activeParams.type == 'dot') {
    if (x%2 == 1 && y%2 == 1) return
    var found = false
    for (var i=0; i < puzzle.dots.length; i++) {
      if (puzzle.dots[i].x == x && puzzle.dots[i].y == y) {
        puzzle.dots.splice(i, 1)
        found = true
        break
      }
    }
    if (!found) puzzle.dots.push({'x':x, 'y':y})
  } else if (['square', 'star', 'nega', 'poly', 'ylop'].includes(activeParams.type)) {
    if (x%2 != 1 || y%2 != 1) return
    // Only change one thing at a time -- if you change color, don't toggle the symbol
    if (puzzle.grid[x][y].type == JSON.parse(JSON.stringify(activeParams.type)) && puzzle.grid[x][y].color == color) {
      puzzle.grid[x][y] = false
    } else {
      puzzle.grid[x][y] = JSON.parse(JSON.stringify(Object.assign(activeParams, {'color':color})))
    }
  } else if (activeParams.type == 'triangle') {
    if (x%2 != 1 || y%2 != 1) return
    var count = 0
    if (puzzle.grid[x][y].type == activeParams.type) {
      count = puzzle.grid[x][y].count
      // Only change one thing at a time -- if you change color, count shouldn't change as well.
      if (color != puzzle.grid[x][y].color) {
        count--
      }
    }
    if (puzzle.grid[x][y].count == 3) {
      puzzle.grid[x][y] = false
    } else {
      puzzle.grid[x][y] = {'type':JSON.parse(JSON.stringify(activeParams.type)), 'color':color, 'count':count+1}
    }
  }
  
  updatePuzzle()
}
