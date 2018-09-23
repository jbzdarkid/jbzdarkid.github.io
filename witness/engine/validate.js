// Settings (todo: Expose to the user/puzzlemaker?)
window.NEGATIONS_CANCEL_NEGATIONS = true

// Puzzle = {grid, start, end, dots, gaps}
// Determines if the current grid state is solvable. Modifies the puzzle element with:
// valid: Whether or not the puzzle is valid
// negations: Negation symbols and their targets (for the purpose of darkening)
// invalids: Symbols which are invalid (for the purpose of flashing)
function validate(puzzle) {
  // console.log('Validating', puzzle)
  puzzle.valid = true // Assume valid until we find an invalid element
  puzzle.negations = []

  // Check that all dots are covered
  // FIXME: Check for invalid dot placement?
  // FIXME: Code in such a way that this works with negation?
  for (var dot of puzzle.dots) {
    if (!puzzle.getCell(dot.x, dot.y)) {
      // console.log('Dot at grid['+dot.x+']['+dot.y+'] is not covered')
      puzzle.valid = false
    }
  }
  // Check that all gaps are not covered
  // FIXME: Check for invalid gap placement?
  for (var gap of puzzle.gaps) {
    if (puzzle.getCell(gap.x, gap.y)) {
      // console.log('Gap at grid['+gap.x+']['+gap.y+'] is covered')
      puzzle.valid = false
    }
  }
  // Check that individual regions are valid
  var regions = puzzle.getRegions()
  for (var region of regions) {
    var key = region.grid.toString()
    var regionData = puzzle.regionCache[key]
    if (regionData == undefined) {
      // console.log('Cache miss for region', region, 'key', key)
      regionData = _regionCheckNegations(puzzle, region)
      // Entirely for convenience
      regionData.valid = (regionData.invalidElements.length == 0)
      // console.log('Region valid:', regionData.valid)

      if (!window.DISABLE_CACHE) {
        puzzle.regionCache[key] = regionData
      }
      // FIXME: Can't cache regions with triangles because the edges matter, not just the cells.
      for (var pos of region.cells) {
        if (puzzle.getCell(pos.x, pos.y).type == 'triangle') {
          puzzle.regionCache[key] = undefined
          break
        }
      }
    }
    puzzle.negations = puzzle.negations.concat(regionData.negations)
    puzzle.valid &= regionData.valid
  }
}

function _regionCheckNegations(puzzle, region) {
  // console.log('Validating region of length', region.cells.length)

  // Get a list of negation symbols in the grid, and set them to 'nonce'
  var negationSymbols = []
  for (var pos of region.cells) {
    var cell = puzzle.getCell(pos.x, pos.y)
    if (cell == false) continue
    if (cell.type == 'nega') {
      cell.type = 'nonce'
      puzzle.setCell(pos.x, pos.y, cell)
      negationSymbols.push({'x':pos.x, 'y':pos.y, 'cell':cell})
    }
  }
  // console.log('Found negation symbols:', negationSymbols)
  // Get a list of elements that are currently invalid (before any negations are applied)
  var invalidElements = _regionCheck(puzzle, region)
  // console.log('Negation-less regioncheck returned invalid elements:', JSON.stringify(invalidElements))
  // Set 'nonce' back to 'nega' for the negation symbols
  for (var nega of negationSymbols) {
    nega.cell.type = 'nega'
    puzzle.setCell(nega.x, nega.y, nega.cell)
  }

  // If there are not enough elements to pair, return
  if (negationSymbols.length == 0 ||
     (invalidElements.length == 0 && (negationSymbols.length < 2 || !window.NEGATIONS_CANCEL_NEGATIONS))) {
    // console.log('Not enough elements left to create a pair')
    invalidElements = invalidElements.concat(negationSymbols)
    return {'invalidElements':invalidElements, 'negations':[]}
  }
  // Else, there are invalid elements and negations, try to pair them up
  var source = negationSymbols[0]
  puzzle.setCell(source.x, source.y, false)
  // console.log('Using negation symbol at', source.x, source.y)

  // Logic is duplicate of below
  if (window.NEGATIONS_CANCEL_NEGATIONS) {
    for (var i=1; i<negationSymbols.length; i++) {
      var target = negationSymbols[i]
      puzzle.setCell(target.x, target.y, false)
      // console.log('Negating other negation symbol at', target.x, target.y)
      var regionData = _regionCheckNegations(puzzle, region)
      puzzle.setCell(target.x, target.y, target.cell)

      if (regionData.invalidElements.length == 0) {
        // console.log('Negation pair valid')
        // Restore negation symbol, add to list of negation pairs
        puzzle.setCell(source.x, source.y, source.cell)
        regionData.negations.push({'source':source, 'target':target})
        return regionData
      }
    }
  }

  for (var invalidElement of invalidElements) {
    invalidElement.cell = puzzle.getCell(invalidElement.x, invalidElement.y)
    puzzle.setCell(invalidElement.x, invalidElement.y, false)
    // console.log('Negating other negation symbol at', invalidElement.x, invalidElement.y)
    // Remove the negation and target, then recurse
    var regionData = _regionCheckNegations(puzzle, region)
    // Restore the target
    puzzle.setCell(invalidElement.x, invalidElement.y, invalidElement.cell)

    // No invalid elements after negation is applied, so the region validates
    if (regionData.invalidElements.length == 0) {
      // console.log('Negation pair valid')
      // Restore negation symbol, add to list of negation pairs
      puzzle.setCell(source.x, source.y, source.cell)
      regionData.negations.push({'source':source, 'target':invalidElement})
      return regionData
    }
  }

  // console.log('All pairings failed')
  // All negation pairings failed, select one possible pairing and return it
  // FIXME: Random? This is currently the last possible negation
  puzzle.setCell(source.x, source.y, source.cell)
  return regionData
}

// Checks if a region (series of cells) is valid.
// Since the path must be complete at this point, returns only true or false
function _regionCheck(puzzle, region) {
  var invalidElements = []

  // Check for triangles
  for (var pos of region.cells) {
    if (puzzle.getCell(pos.x, pos.y).type == 'triangle') {
      var count = 0
      if (puzzle.getCell(pos.x - 1, pos.y)) count++
      if (puzzle.getCell(pos.x + 1, pos.y)) count++
      if (puzzle.getCell(pos.x, pos.y - 1)) count++
      if (puzzle.getCell(pos.x, pos.y + 1)) count++
      if (count != puzzle.getCell(pos.x, pos.y).count) {
        // console.log('Triangle at grid['+pos.x+']['+pos.y+'] has', count, 'borders')
        invalidElements.push(pos)
      }
    }
  }

  // Check for color-based elements
  var coloredObjects = {}
  var squareColors = {}
  for (var pos of region.cells) {
    var cell = puzzle.getCell(pos.x, pos.y)
    if (coloredObjects[cell.color] == undefined) {
      coloredObjects[cell.color] = 0
    }
    coloredObjects[cell.color]++
    if (cell.type == 'square') {
      squareColors[cell.color] = true
    }
  }
  var squareColorCount = Object.keys(squareColors).length

  for (var pos of region.cells) {
    var cell = puzzle.getCell(pos.x, pos.y)
    if (cell == false) continue
    if (cell.type == 'square') {
      if (squareColorCount > 1) {
        // console.log('Found a', cell.color, 'square in a region with', squareColorCount, 'square colors')
        invalidElements.push(pos)
      }
    } else if (cell.type == 'star') {
      if (coloredObjects[cell.color] != 2) {
        // console.log('Found a', cell.color, 'star in a region with', coloredObjects[cell.color], cell.color, 'objects')
        invalidElements.push(pos)
      }
    }
  }

  var polys = []
  var ylops = []
  for (var pos of region.cells) {
    var cell = puzzle.getCell(pos.x, pos.y)
    if (cell != false) {
      if (cell.type == 'poly') {
        polys.push(cell)
      } else if (cell.type == 'ylop') {
        ylops.push(cell)
      }
    }
  }

  if (!_polyWrapper(polys, ylops, region, puzzle)) {
    for (var pos of region.cells) {
      var cell = puzzle.getCell(pos.x, pos.y)
      if (cell == false) continue
      if (cell.type == 'poly' || cell.type == 'ylop') {
        invalidElements.push(pos)
      }
    }
  }
  // console.log('Region has', invalidElements.length, 'invalid elements')
  return invalidElements
}

function _polyWrapper(polys, ylops, region, puzzle) {
  // For polyominos, we construct a grid to place them on
  // The grid is 1 inside the region, and undefined outside.
  var polyCount = 0
  for (var poly of polys) {
    polyCount += getPolySize(poly.polyshape)
  }
  for (var ylop of ylops) {
    polyCount -= getPolySize(ylop.polyshape)
  }

  if (polys.length + ylops.length > 0) { // Some polys/ylops exist in the region
    if (polyCount < 0) {
      // console.log('More onimoylops than polyominos by', -polyCount)
      return false
    } else if (polyCount > 0 && polyCount < region.cells.length) {
      // console.log('Combined size of polyominos', polyCount, 'does not match region size', region.length)
      return false
    }
    var savedGrid = puzzle.copyGrid()
    puzzle.grid = puzzle.newGrid(puzzle.grid.length, puzzle.grid[0].length, puzzle.pillar)
    // If polyCount == 0, then ylops cancel polys, and we should present the
    // region as nonexistant, thus forcing all the shapes to cancel.
    if (polyCount == 0) {
      region = new Region()
    }
    for (var cell of region.cells) {
      puzzle.setCell(cell.x, cell.y, true)
    }
    var polyFits = _polyFit(polys, ylops, puzzle.grid)
    puzzle.grid = savedGrid
    return polyFits
  }
  return true
}

// Returns whether or not a set of polyominos fit into a region.
// The region is represented on a grid to facilitate checking.
// Solves via recursive backtracking: Some piece must fill the top left square,
// so try every piece to fill it, then recurse.
// Onimoylops are complex, and basically can be placed anywhere, once placed
// they act as an extra count for that square.
function _polyFit(polys, ylops, grid) {
  if (polys.length + ylops.length == 0) {
    for (var x=1; x<grid.length; x+=2) {
      for (var y=1; y<grid[x].length; y+=2) {
        if (grid[x][y] != 0) {
          // console.log('All polys placed, but grid not full')
          return false
        }
      }
    }
    // console.log('All polys placed, and grid full')
    return true
  }

  if (ylops.length > 0) {
    ylop = ylops.pop()
    var ylopRotations = getRotations(ylop.polyshape, ylop.rot)
    for (var _ylopCells of ylopRotations) {
      var ylopCells = polyominoFromPolyshape(_ylopCells)
      for (var x=1; x<grid.length; x+=2) {
        nextPos: for (var y=1; y<grid[x].length; y+=2) {
          for (var cell of ylopCells) { // Check if the ylop fits
            if (cell.x + x < 0 || cell.x + x > grid.length-1) {
              continue nextPos
            } else if (cell.y + y < 0 || cell.y + y > grid[cell.x + x].length-1) {
              continue nextPos
            }
          }
          for (var cell of ylopCells) { // Place in the grid
            grid[cell.x + x][cell.y + y]++
          }
          var ret = _polyFit(polys, ylops, grid)
          for (var cell of ylopCells) { // Restore the grid
            grid[cell.x + x][cell.y + y]--
          }
          if (ret) return true
        }
      }
    }
    // console.log('Ylop found, but no placement valid')
    ylops.push(ylop)
    return false
  }

  var first = undefined
  firstLoop: for (var x=1; x<grid.length; x+=2) {
    for (var y=1; y<grid[x].length; y+=2) {
      if (grid[x][y] >= 1) {
        first = {'x':x, 'y':y}
        break firstLoop
      }
    }
  }
  if (first == undefined) {
    // console.log('Polys remaining but grid full')
    return false
  }

  for (var i=0; i<polys.length; i++) {
    var poly = polys.splice(i, 1)[0]
    var polyRotations = getRotations(poly.polyshape, poly.rot)
    var polyFits = false
    nextRotation: for (var _polyCells of polyRotations) {
      var polyCells = polyominoFromPolyshape(_polyCells)
      for (var cell of polyCells) {
        // Check if the poly is off the grid or extends out of region
        if (cell.x + first.x < 0 || cell.x + first.x > grid.length-1) {
          continue nextRotation
        } else if (cell.y + first.y < 0 || cell.y + first.y > grid[cell.x + first.x].length-1) {
          continue nextRotation
        } else if (grid[cell.x + first.x][cell.y + first.y] <= 0) {
          continue nextRotation
        }
      }
      // Poly fits, place it in the grid, update first empty cell, and recurse.
      for (var cell of polyCells) {
        grid[cell.x + first.x][cell.y + first.y]--
      }
      if (_polyFit(polys, ylops, grid)) {
        polyFits = true
      }
      // Restore grid and poly list for the next poly choice
      for (var cell of polyCells) {
        grid[cell.x + first.x][cell.y + first.y]++
      }
      if (polyFits) break
    }
    polys.splice(i, 0, poly)
    if (polyFits) return true
  }
  // console.log('Poly found, but no placement valid')
  return false
}
