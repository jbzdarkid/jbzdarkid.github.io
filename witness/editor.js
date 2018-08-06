var puzzle = new Puzzle(4, 4)
window.DISABLE_CACHE = true
var solutions = []
var currentSolution = 0
var symbol = 'none'
var color = 'black'

window.onload = function() {
  redraw(puzzle)
  var symbolButtons = [
    {'type':'start'},
    {'type':'end'},
    {'type':'gap', 'height':84, 'width':84},
    {'type':'dot', 'height':84, 'width':84},
    {'type':'square'},
    {'type':'star'},
    {'type':'nega'},
    {'type':'triangle', 'count':1},
    {'type':'poly', 'size':4, 'shape':'L', 'rot':0},
    {'type':'ylop', 'size':4, 'shape':'L', 'rot':0},
  ]
  var symbolCell = document.getElementById('symbols')
  for (var params of symbolButtons) {
    if (['gap', 'square', 'nega', 'poly'].includes(params.type)) {
      symbolCell.appendChild(document.createElement('br'))
    }
    params['color'] = color

    var buttonElem = document.createElement('button')
    buttonElem.style.width = '100px'
    // buttonElem.style.height = '100px'
    buttonElem.id = params.type
    buttonElem.onclick = function() {symbol = this.id}

    // TODO: Remove this once poly/ylop are implemented
    if (params.type == 'poly' || params.type == 'ylop') {
      params.color = 'gray'
    }
    buttonElem.appendChild(drawSymbol(params))
    symbolCell.appendChild(buttonElem)
  }
  
  var colorButtons = ['black', 'white', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'custom']
  var colorCell = document.getElementById('colors')
  for (var colorName of colorButtons) {
    var colorElem = document.createElement('button')
    colorElem.style.width = '200px'
    colorElem.id = colorName
    colorElem.onclick = function() {color = this.id}
    colorElem.appendChild(_crayon({'color':colorName}))
    colorCell.appendChild(colorElem)
    colorCell.appendChild(document.createElement('br'))
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
  
  if (symbol == 'start' || symbol == 'end') {
    if (x%2 != 0 || y%2 != 0) return
    if (x == 0 || y == 0 || x == puzzle.grid.length - 1 || y == puzzle.grid[x].length - 1) {
      if (symbol == 'start') puzzle.start = {'x':x, 'y':y}
      if (symbol == 'end') puzzle.end = {'x':x, 'y':y}
    }
  } else if (symbol == 'gap') {
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
  } else if (symbol == 'dot') {
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
  } else if (symbol == 'square' || symbol == 'star' || symbol == 'nega') {
    if (x%2 != 1 || y%2 != 1) return
    // Only change one thing at a time -- if you change color, don't toggle the symbol
    if (puzzle.grid[x][y].type == symbol && puzzle.grid[x][y].color == color) {
      puzzle.grid[x][y] = false
    } else {
      puzzle.grid[x][y] = {'type':symbol, 'color':color}
    }
  } else if (symbol == 'triangle') {
    if (x%2 != 1 || y%2 != 1) return
    var count = 0
    if (puzzle.grid[x][y].type == symbol) {
      count = puzzle.grid[x][y].count
      // Only change one thing at a time -- if you change color, count shouldn't change as well.
      if (color != puzzle.grid[x][y].color) {
        count--
      }
    }
    if (puzzle.grid[x][y].count == 3) {
      puzzle.grid[x][y] = false
    } else {
      puzzle.grid[x][y] = {'type':symbol, 'color':color, 'count':count+1}
    }
  }
  
  updatePuzzle()
}
