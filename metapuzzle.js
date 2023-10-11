namespace(function() {

window.metapuzzle = null
window.subpuzzles = [null, null, null, null]
var animations = null
window.onload = function() {
  clearPuzzle()
  for (var styleSheet of document.styleSheets) {
    if (styleSheet.title === 'animations') {
      animations = styleSheet
      break
    }
  }
}

window.clearPuzzle = function() {
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

  drawPuzzle()
  document.getElementById('solutionViewer-metapuzzle').style.display = 'none'
}

function drawPuzzle() {
  window.draw(metapuzzle, 'metapuzzle')
  window.clearAnimations()

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
  svg.onpointerdown = function() {
    var chooserTable = document.getElementById('chooserTable-left')
    chooserTable.parent.style.display = null
    window.draw(subpuzzles[0], 'subpuzzle-left')
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

  var svg = createElement('svg')
  puzzleElement.appendChild(svg)
  svg.setAttribute('x', 146)
  svg.setAttribute('y', 310)
  svg.id = 'bottomLeft' // mandatory for drawing purposes
  window.draw(subpuzzles[2], 'bottomLeft')
  svg.setAttribute('width', 58)
  svg.setAttribute('height', 58)
  svg.outerHTML = svg.outerHTML // Force a redraw because resizing doesn't work otherwise.

  var svg = createElement('svg')
  puzzleElement.appendChild(svg)
  svg.setAttribute('x', 310)
  svg.setAttribute('y', 310)
  svg.id = 'bottomRight' // mandatory for drawing purposes
  window.draw(subpuzzles[3], 'bottomRight')
  svg.setAttribute('width', 58)
  svg.setAttribute('height', 58)
  svg.outerHTML = svg.outerHTML // Force a redraw because resizing doesn't work otherwise.

  /*
  svg.class = 'topLeft'
  svg.onpointerdown = function() {
    animations.insertRule('.' + this.id + ' {animation: 150ms 1 forwards popout}\n')
    // animate expansion to full
  }
  */
}

function onElementClicked(event, x, y) {
  // Sanity check input data
  // Adjust puzzle
  // drawPuzzle()
  // metapuzzle.clearLines()
  // document.getElementById('solutionViewer').style.display = null
  // var paths = window.solve(puzzle)
  // metapuzzle.autoSolved = true
  // window.showSolution(window.metapuzzle, paths, 0)
}

function getPolyshapes(puzzle, target) {
  var polyshapes = {}
  
  for (var path of window.solve(puzzle)) {
    window.drawPath(puzzle, path, target)
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
  var polyshapes0 = getPolyshapes(subpuzzles[0], 'topLeft')
  var polyshapes1 = getPolyshapes(subpuzzles[1], 'topRight')
  var polyshapes2 = getPolyshapes(subpuzzles[2], 'bottomLeft')
  var polyshapes3 = getPolyshapes(subpuzzles[3], 'bottomRight')
  
  var allPaths = []
  for (var polyshape0 in polyshapes0) {
    metapuzzle.grid[3][3].polyshape = polyshape0
    for (var polyshape1 in polyshapes1) {
      metapuzzle.grid[7][3].polyshape = polyshape1
      for (var polyshape2 in polyshapes2) {
        metapuzzle.grid[3][7].polyshape = polyshape2
        for (var polyshape3 in polyshapes3) {
          metapuzzle.grid[7][7].polyshape = polyshape3
          
          for (var path of window.solve(metapuzzle)) {
            allPaths.push([
              path,
              polyshapes0[polyshape0],
              polyshapes1[polyshape1],
              polyshapes2[polyshape2],
              polyshapes3[polyshape3],
            ])
          }
        }
      }
    }
  }
  
  document.getElementById('solutionViewer-metapuzzle').style.display = null
  window.showSolution(
    [metapuzzle, subpuzzles[0], subpuzzles[1], subpuzzles[2], subpuzzles[3]],
    allPaths,
    0,
    ['metapuzzle', 'topLeft', 'topRight', 'bottomLeft', 'bottomRight'])
}

})
