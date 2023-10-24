namespace(function() {

var metapuzzle = null
var subpuzzles = []
var activePolyshape = {'left': 0, 'right': 0}
var hardModeEnabled = false
window.onload = function() {
  try {
    metapuzzle = Puzzle.deserialize(window.localStorage.getItem('metapuzzle'))
    subpuzzles[0] = Puzzle.deserialize(window.localStorage.getItem('subpuzzle0'))
    subpuzzles[1] = Puzzle.deserialize(window.localStorage.getItem('subpuzzle1'))
    subpuzzles[2] = Puzzle.deserialize(window.localStorage.getItem('subpuzzle2'))
    subpuzzles[3] = Puzzle.deserialize(window.localStorage.getItem('subpuzzle3'))
  } catch (e) {
    console.error('Deserialization failed, restoring defaults' + e)

    metapuzzle = new Puzzle(5, 5)
    metapuzzle.symmetry = {'x': true}
    metapuzzle.grid[0][10].start = true
    metapuzzle.grid[3][3] = {'type': 'poly', 'polyshape': 1, 'color': 'red'}
    metapuzzle.grid[3][7] = {'type': 'poly', 'polyshape': 1, 'color': 'yellow'}
    metapuzzle.grid[4][0].end = 'top'
    metapuzzle.grid[7][3] = {'type': 'poly', 'polyshape': 1, 'color': 'green'}
    metapuzzle.grid[7][7] = {'type': 'poly', 'polyshape': 1, 'color': 'blue'}
    metapuzzle.grid[6][0].end = 'top'
    metapuzzle.grid[10][10].start = true

    var topLeft = new Puzzle(4, 4)
    topLeft.grid[0][8].start = true
    topLeft.grid[3][3] = {'type': 'poly', 'polyshape': 50, 'color': 'yellow'}
    topLeft.grid[5][3] = {'type': 'nega', 'color': 'white'}
    topLeft.grid[5][5] = {'type': 'poly', 'polyshape': 35, 'color': 'yellow'}
    topLeft.grid[8][0].end = 'top'

    var topRight = new Puzzle(4, 4)
    topRight.grid[0][0].end = 'top'
    topRight.grid[1][1] = {'type': 'poly', 'polyshape': 19, 'color': 'yellow'}
    topRight.grid[1][5] = {'type': 'poly', 'polyshape': 785, 'color': 'yellow'}
    topRight.grid[3][3] = {'type': 'nega', 'color': 'white'}
    topRight.grid[8][8].start = true

    var bottomLeft = new Puzzle(4, 4)
    bottomLeft.grid[0][8].start = true
    bottomLeft.grid[1][5] = {'type': 'poly', 'polyshape': 51, 'color': 'yellow'}
    bottomLeft.grid[3][5] = {'type': 'nega', 'color': 'white'}
    bottomLeft.grid[3][7] = {'type': 'poly', 'polyshape': 273, 'color': 'yellow'}
    bottomLeft.grid[8][0].end = 'top'

    var bottomRight = new Puzzle(4, 4)
    bottomRight.grid[0][0].end = 'top'
    bottomRight.grid[3][3] = {'type': 'poly', 'polyshape': 1049361, 'color': 'yellow'}
    bottomRight.grid[5][3] = {'type': 'poly', 'polyshape': 1048851, 'color': 'yellow'}
    bottomRight.grid[5][5] = {'type': 'nega', 'color': 'white'}
    bottomRight.grid[8][8].start = true

    subpuzzles = [topLeft, topRight, bottomLeft, bottomRight]
  }

  var hardModeBox = document.getElementById('hardModeBox')

  var hardMode = createCheckbox()
  hardModeBox.appendChild(hardMode)
  hardMode.id = 'hardMode'
  hardMode.onpointerdown = function() {
    this.checked = !this.checked
    this.style.background = (this.checked ? window.BORDER : window.PAGE_BACKGROUND)
    setHardMode(this.checked)
  }

  var hardModeLabel = document.createElement('label')
  hardModeBox.appendChild(hardModeLabel)
  hardModeLabel.innerText = 'Sigma hard mode'
  hardModeLabel.onpointerdown = function() {hardMode.onpointerdown()}
  hardModeLabel.style.marginRight = '14px'
  hardModeLabel.className = 'noselect'

  drawChooserTable('left')
  drawChooserTable('right')
  leftActivePolyshape = 0
  rightActivePolyshape = 0

  if (window.localStorage.getItem('hardMode') == 'true') {
    // Also calls drawPuzzle
    hardMode.onpointerdown()
  } else {
    drawPuzzle()
  }
}

function setHardMode(enable) {
  if (enable) {
    hardModeEnabled = true
    window.localStorage.setItem('hardMode', true)
    metapuzzle.symmetry = {'x': true, 'y': true}
    metapuzzle.grid[0][0]   = {'type': 'line', 'line': 0, 'end': 'top'}
    metapuzzle.grid[0][10]  = {'type': 'line', 'line': 0, 'start': true}
    metapuzzle.grid[4][0]   = {'type': 'line', 'line': 0}
    metapuzzle.grid[6][0]   = {'type': 'line', 'line': 0}
    metapuzzle.grid[10][0]  = {'type': 'line', 'line': 0, 'start': true}
    metapuzzle.grid[10][10] = {'type': 'line', 'line': 0, 'end': 'bottom'}
  } else {
    hardModeEnabled = false
    window.localStorage.setItem('hardMode', false)
    metapuzzle.symmetry = {'x': true}
    metapuzzle.grid[0][0]   = {'type': 'line', 'line': 0}
    metapuzzle.grid[0][10]  = {'type': 'line', 'line': 0, 'start': true}
    metapuzzle.grid[4][0]   = {'type': 'line', 'line': 0, 'end': 'top'}
    metapuzzle.grid[6][0]   = {'type': 'line', 'line': 0, 'end': 'top'}
    metapuzzle.grid[10][0]  = {'type': 'line', 'line': 0}
    metapuzzle.grid[10][10] = {'type': 'line', 'line': 0, 'start': true}
  }
  drawPuzzle()
}

function drawChooserTable(side) {
  var chooserTable = document.getElementById('chooserTable-' + side)
  chooserTable.setAttribute('cellspacing', '24px')
  chooserTable.setAttribute('cellpadding', '0px')
  chooserTable.style.padding = 25
  chooserTable.style.background = window.BACKGROUND
  chooserTable.style.border = window.BORDER
  // Clicks inside the green box are non-closing but don't do anything
  chooserTable.onpointerdown = function(event) {event.stopPropagation()}

  // This needs to be declared outside of the loop
  var shapeChooserClick = function(event, cell) {
    cell.clicked = !cell.clicked
    activePolyshape[side] ^= cell.powerOfTwo
    if (cell.clicked) {
      cell.style.background = 'black'
    } else {
      cell.style.background = window.FOREGROUND
    }
  }

  for (var x=0; x<4; x++) {
    var row = chooserTable.insertRow(x)
    for (var y=0; y<4; y++) {
      var cell = row.insertCell(y)
      cell.powerOfTwo = 1 << (x + y*4)
      cell.onpointerdown = function(event) {shapeChooserClick(event, this)}
      cell.style.width = 58
      cell.style.height = 58
      if ((activePolyshape[side] & cell.powerOfTwo) !== 0) {
        cell.clicked = true
        cell.style.background = 'black'
      } else {
        cell.clicked = false
        cell.style.background = window.FOREGROUND
      }
    }
  }
}

function drawPuzzle() {
  document.getElementById('solutionViewer-metapuzzle').style.display = 'none'
  document.getElementById('solve').innerText = 'Solve'
  document.getElementById('solve').enable()

  window.draw(metapuzzle, 'metapuzzle')
  window.clearAnimations()
  window.localStorage.setItem('metapuzzle', metapuzzle.serialize())
  window.localStorage.setItem('subpuzzle0', subpuzzles[0].serialize())
  window.localStorage.setItem('subpuzzle1', subpuzzles[1].serialize())
  window.localStorage.setItem('subpuzzle2', subpuzzles[2].serialize())
  window.localStorage.setItem('subpuzzle3', subpuzzles[3].serialize())

  // @Robustness: Maybe I should be cleaning house more thoroughly? A class or something would let me just remove these...
  var puzzleElement = document.getElementById('metapuzzle')
  // Remove all 'onTraceStart' calls, we don't want users clicking on the startpoint manually
  for (var child of puzzleElement.children) {
    child.onpointerdown = null
  }

  var svg = createElement('svg')
  puzzleElement.appendChild(svg)
  svg.setAttribute('x', 146)
  svg.setAttribute('y', 146)
  svg.id = 'topLeft' // mandatory for drawing purposes
  window.draw(subpuzzles[0], 'topLeft')
  svg.setAttribute('width', 58)
  svg.setAttribute('height', 58)
  svg.outerHTML = svg.outerHTML // Force a redraw because resizing doesn't work otherwise.
  document.getElementById('topLeft').onpointerdown = function() {
    drawSubpuzzle(subpuzzles[0], 'left')
    document.getElementById('chooserTable-left').style.display = null
    drawAnchor()
  }

  var svg = createElement('svg')
  puzzleElement.appendChild(svg)
  svg.setAttribute('x', 310)
  svg.setAttribute('y', 146)
  svg.id = 'topRight' // mandatory for drawing purposes
  window.draw(subpuzzles[1], 'topRight')
  svg.setAttribute('width', 58)
  svg.setAttribute('height', 58)
  svg.outerHTML = svg.outerHTML // Force a redraw because resizing doesn't work otherwise.
  document.getElementById('topRight').onpointerdown = function() {
    drawSubpuzzle(subpuzzles[1], 'right')
    document.getElementById('chooserTable-right').style.display = null
    drawAnchor()
  }

  var svg = createElement('svg')
  puzzleElement.appendChild(svg)
  svg.setAttribute('x', 146)
  svg.setAttribute('y', 310)
  svg.id = 'bottomLeft' // mandatory for drawing purposes
  window.draw(subpuzzles[2], 'bottomLeft')
  svg.setAttribute('width', 58)
  svg.setAttribute('height', 58)
  svg.outerHTML = svg.outerHTML // Force a redraw because resizing doesn't work otherwise.
  document.getElementById('bottomLeft').onpointerdown = function() {
    drawSubpuzzle(subpuzzles[2], 'left')
    document.getElementById('chooserTable-left').style.display = null
    drawAnchor()
  }

  var svg = createElement('svg')
  puzzleElement.appendChild(svg)
  svg.setAttribute('x', 310)
  svg.setAttribute('y', 310)
  svg.id = 'bottomRight' // mandatory for drawing purposes
  window.draw(subpuzzles[3], 'bottomRight')
  svg.setAttribute('width', 58)
  svg.setAttribute('height', 58)
  svg.outerHTML = svg.outerHTML // Force a redraw because resizing doesn't work otherwise.
  document.getElementById('bottomRight').onpointerdown = function() {
    drawSubpuzzle(subpuzzles[3], 'right')
    document.getElementById('chooserTable-right').style.display = null
    drawAnchor()
  }
}

function drawSubpuzzle(puzzle, side) {
  target = 'subpuzzle-' + side
  window.draw(puzzle, target)
  var puzzleElement = document.getElementById(target)
  puzzleElement.style.display = null

  // This needs to be declared outside of the loop
  var addOnClick = function(elem, x, y) {
    elem.onpointerdown = function(event) {
      onElementClicked(event, side, puzzle, x, y)
      drawSubpuzzle(puzzle, side)
    }
  }

  var xPos = 40
  for (var x=0; x<puzzle.width; x++) {
    var yPos = 40
    var width = (x%2 === 0 ? 24 : 58)
    for (var y=0; y<puzzle.height; y++) {
      var height = (y%2 === 0 ? 24 : 58)
      var rect = createElement('rect')
      puzzleElement.appendChild(rect)
      rect.setAttribute('x', xPos)
      rect.setAttribute('y', yPos)
      rect.setAttribute('width', width)
      rect.setAttribute('height', height)
      rect.setAttribute('fill', 'white')
      rect.setAttribute('opacity', 0)
      yPos += height
      if (x%2 === 1 && y%2 === 1) {
        addOnClick(rect, x, y)
        rect.onpointerenter = function() {this.setAttribute('opacity', 0.25)}
        rect.onpointerleave = function() {this.setAttribute('opacity', 0)}
      }
    }
    xPos += width
  }
}

function onElementClicked(event, side, puzzle, x, y) {
  if (x%2 !== 1 || y%2 !== 1) return
  var cell = puzzle.grid[x][y]
  var polyshape = activePolyshape[side]

  if (event.isRightClick()) { // Right click: Toggle negation
    if (cell == null) cell = {'type': 'nega', 'color': 'white'}
    else              cell = null
  } else { // Left click: Toggle polyomino
    if (cell != null && cell.type == 'nega')    cell = null
    else if (polyshape === 0)             cell = null
    else if (cell == null)                cell = {'type': 'poly', 'color': 'yellow', 'polyshape': polyshape}
    else if (cell.polyshape != polyshape) cell.polyshape = polyshape
    else if (cell.type == 'ylop')         cell = {'type': 'poly', 'color': 'yellow', 'polyshape': polyshape}
    else if (hardModeEnabled)             cell = {'type': 'ylop', 'color': 'blue', 'polyshape': polyshape}
    else if (!hardModeEnabled)            cell.polyshape = polyshape | window.ROTATION_BIT
  }

  puzzle.grid[x][y] = cell
  drawPuzzle()
}

function drawAnchor() {
  var anchor = document.createElement('div')
  document.body.appendChild(anchor)
  anchor.id = 'anchor'
  anchor.style.width = '100%'
  anchor.style.height = '100%'
  anchor.style.position = 'absolute'
  anchor.style.opacity = '0%'
  anchor.style.background = 'black'
  anchor.style.top = 0
  anchor.style.zIndex = 2 // Position in front of the header bar
  anchor.onpointerdown = function() {
    document.getElementById('subpuzzle-left').style.display = 'none'
    document.getElementById('chooserTable-left').style.display = 'none'
    document.getElementById('chooserTable-right').style.display = 'none'
    document.getElementById('subpuzzle-right').style.display = 'none'
    anchor.parentElement.removeChild(anchor)
  }
}

function getPolyshapes(puzzle, target) {
  var polyshapes = {}

  for (var path of window.solve(puzzle)) {
    window.drawPathNoUI(puzzle, path, target)
    for (var region of puzzle.getRegions()) {
      var numberOfPolys = 0
      for (var pos of region) {
        var cell = puzzle.getCell(pos.x, pos.y)
        if (cell != null && cell.type == 'poly') numberOfPolys++
        if (cell != null && cell.type == 'nega') numberOfPolys--
      }

      if (numberOfPolys > 0) { // Hypothetically there could be 3 polys and 1 cancellation
        var polyshape = window.polyshapeFromPolyomino(region)
        // Always keep the shortest solution
        if (polyshapes[polyshape] == null || path.length < polyshapes[polyshape].length) {
          polyshapes[polyshape] = path
        }
        break // Continue to next path
      }
    }
  }

  window.drawPath(puzzle, null, target) // Clear the temp solution
  return polyshapes
}

window.solvePuzzle = function() {
  var status = document.getElementById('solve')
  status.disable()

  // I couldn't find a way to do this more simply with Promises. I'm sure there is one, but I have only so much mental capacity for learning javascript.
  status.innerText = 'Solving subpuzzle 1 of 4'
  window.setTimeout(() => {
    var polyshapes0 = getPolyshapes(subpuzzles[0], 'topLeft')

    status.innerText = 'Solving subpuzzle 2 of 4'
    window.setTimeout(() => {
      var polyshapes1 = getPolyshapes(subpuzzles[1], 'topRight')

      status.innerText = 'Solving subpuzzle 3 of 4'
      window.setTimeout(() => {
        var polyshapes2 = getPolyshapes(subpuzzles[2], 'bottomLeft')

        status.innerText = 'Solving subpuzzle 4 of 4'
        window.setTimeout(() => {
          var polyshapes3 = getPolyshapes(subpuzzles[3], 'bottomRight')

          var combinations = []
          for (var polyshape0 in polyshapes0) {
            for (var polyshape1 in polyshapes1) {
              for (var polyshape2 in polyshapes2) {
                for (var polyshape3 in polyshapes3) {
                  combinations.push([polyshape0, polyshape1, polyshape2, polyshape3])
                }
              }
            }
          }

          solveMetapuzzle(combinations, polyshapes0, polyshapes1, polyshapes2, polyshapes3, 0, [])
        }, 0)
      }, 0)
    }, 0)
  }, 0)
}

function solveMetapuzzle(combinations, polyshapes0, polyshapes1, polyshapes2, polyshapes3, i, allPaths) {
  if (i < combinations.length) {
    document.getElementById('solve').innerText = 'Solving metapuzzle combination ' + i + ' of ' + combinations.length

    window.setTimeout(function() {
      metapuzzle.grid[3][3].polyshape = combinations[i][0]
      metapuzzle.grid[7][3].polyshape = combinations[i][1]
      metapuzzle.grid[3][7].polyshape = combinations[i][2]
      metapuzzle.grid[7][7].polyshape = combinations[i][3]
      window.solve(metapuzzle, null, function(paths) {
        for (var path of paths) {
          allPaths.push([
            path,
            polyshapes0[combinations[i][0]],
            polyshapes1[combinations[i][1]],
            polyshapes2[combinations[i][2]],
            polyshapes3[combinations[i][3]],
          ])
        }

        solveMetapuzzle(combinations, polyshapes0, polyshapes1, polyshapes2, polyshapes3, i + 1, allPaths)
      })
    }, 0)
  } else {
    document.getElementById('solve').innerText = 'Done!'
    document.getElementById('solutionViewer-metapuzzle').style.display = null
    window.showSolution(
      [metapuzzle, subpuzzles[0], subpuzzles[1], subpuzzles[2], subpuzzles[3]],
      allPaths,
      0,
      ['metapuzzle', 'topLeft', 'topRight', 'bottomLeft', 'bottomRight'])
  }

}

})
