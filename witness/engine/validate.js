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
      var hasNega = false
      for (var pos of region.cells) {
        var cell = puzzle.getCell(pos.x, pos.y)
        if (cell != false && cell.type == 'nega') {
          hasNega = true
          break
        }
      }
      if (hasNega) {
        regionData = _regionCheckNegations(puzzle, region)
      } else {
        regionData = {'valid':_regionCheck(puzzle, region), 'negations':[]}
      }
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
  // console.log('Validating region of length', region.length)
  // Iterate over all possible ways of applying negations
  var combinations = _combinations(puzzle, region)
  for (var combination of combinations) {
    // console.log('Validating combination', combination)
    for (var negation of combination) {
      puzzle.setCell(negation.source.x, negation.source.y, false)
      puzzle.setCell(negation.target.x, negation.target.y, false)
    }
    if (!_regionCheck(puzzle, region)) {
      // console.log('Region is invalid with negations applied, so the combination is invalid')
      for (var negation of combination) {
        puzzle.setCell(negation.source.x, negation.source.y, negation.source.cell)
        puzzle.setCell(negation.target.x, negation.target.y, negation.target.cell)
      }
      continue
    }

    var combinationIsValid = true
    // Verify that each negation is valid, i.e. removes an incorrect element
    for (var negation of combination) {
      // console.log('Un-doing negation', negation, 'and re-validating')
      puzzle.setCell(negation.target.x, negation.target.y, negation.target.cell)
      negation.source.cell.type = 'nonce'
      puzzle.setCell(negation.source.x, negation.source.y, negation.source.cell)
      var regionCheck = _regionCheckNegations(puzzle, region)
      puzzle.setCell(negation.target.x, negation.target.y, false)
      negation.source.cell.type = 'nega'
      puzzle.setCell(negation.source.x, negation.source.y, false)

      if (regionCheck.valid) {
        // console.log('Region still valid with element removed, so the combination is invalid')
        combinationIsValid = false
        break
      }
    }
    for (var negation of combination) {
      puzzle.setCell(negation.source.x, negation.source.y, negation.source.cell)
      puzzle.setCell(negation.target.x, negation.target.y, negation.target.cell)
    }
    if (combinationIsValid) {
      // console.log('Valid combination: ', combination)
      var cells = []
      for (var negation of combination) {
        cells.push(negation.source)
        cells.push(negation.target)
      }
      return {'valid':true, 'negations':cells}
    }
  }
  // console.log('Unable to find valid negation, but negation symbols exist')
  var cells = []
  if (combinations.length > 0) {
    for (var negation of combinations[0]) { // TODO: Random negation?
      cells.push(negation.source)
      cells.push(negation.target)
    }
  }
  return {'valid':false, 'negations':cells}
}

// Returns all the different ways to negate elements.
function _combinations(puzzle, region, regionStart=0) {
  // Find the first negation element (may be part of cells already considered)
  var nega = undefined
  for (var i=0; i<region.cells.length; i++) {
    var pos = region.cells[i]
    var cell = puzzle.getCell(pos.x, pos.y)
    if (cell == false) continue
    if (cell.type == 'nega') {
      nega = {'x':pos.x, 'y':pos.y, 'cell':cell}
      puzzle.setCell(nega.x, nega.y, false)
      break
    }
  }
  if (nega == undefined) {
    // No more negation elements -> No ways to combine negation elements
    return [[]]
  }

  var combinations = []
  // All elements before regionStart have been considered, so don't try negating them again.
  for (var i=regionStart; i<region.cells.length; i++) {
    var pos = region.cells[i]
    var cell = puzzle.getCell(pos.x, pos.y)
    if (cell == false) continue
    puzzle.setCell(pos.x, pos.y, false)
    // Find all combinations of later items
    for (var comb of _combinations(puzzle, region, i+1)) {
      // Combine this negation with each later combination
      combinations.push([{
        'source':{'x':nega.x, 'y':nega.y, 'cell':nega.cell},
        'target':{'x':pos.x, 'y':pos.y, 'cell':cell}
      }].concat(comb))
    }
    // Restore the negated element
    puzzle.setCell(pos.x, pos.y, cell)
  }
  // Restore the negation symbol
  puzzle.setCell(nega.x, nega.y, nega.cell)
  return combinations
}

// Checks if a region (series of cells) is valid.
// Since the path must be complete at this point, returns only true or false
function _regionCheck(puzzle, region) {
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
        return false
      }
    }
  }

  // Check for color-based elements
  var colors = {}
  for (var pos of region.cells) {
    var cell = puzzle.getCell(pos.x, pos.y)
    if (cell != 0) {
      if (colors[cell.color] == undefined) {
        colors[cell.color] = {'squares':0, 'stars':0, 'other':0}
      }
      if (cell.type == 'square') {
        colors[cell.color]['squares']++
      } else if (cell.type == 'star') {
        colors[cell.color]['stars']++
      } else if (cell.type == 'poly' || cell.type == 'nega' || cell.type == 'nonce' || cell.type == 'triangle') {
        colors[cell.color]['other']++
      }
    }
  }

  var colorKeys = Object.keys(colors) // FIXME: Object.values might be cleaner
  for (var i=0; i<colorKeys.length; i++) {
    var objects = colors[colorKeys[i]]
    if (objects['squares'] > 0) {
      // Squares can only be in a region with same colored squares
      for (var j=i+1; j<colorKeys.length; j++) {
        if (colors[colorKeys[j]]['squares'] > 0) {
          // console.log('Found a '+colorKeys[i]+' and '+colorKeys[j]+' square in the same region')
          return false
        }
      }
    }
    if (objects['stars'] > 0) {
      // Stars must be in a region with exactly one other element of their color
      var count = objects['squares']+objects['stars']+objects['other']
      if (count != 2) {
        // console.log('Found a '+colorKeys[i]+' star in a region with '+count+' total '+colorKeys[i]+' objects')
        return false
      }
    }
  }

  // For polyominos, we construct a grid to place them on
  // The grid is 1 inside the region, and undefined outside.
  var polys = []
  var ylops = []
  var polyCount = 0
  for (var pos of region.cells) {
    var cell = puzzle.getCell(pos.x, pos.y)
    if (cell != 0) {
      if (cell.type == 'poly') {
        polys.push(cell)
        polyCount += getPolySize(cell.polyshape)
      } else if (cell.type == 'ylop') {
        ylops.push(cell)
        polyCount -= getPolySize(cell.polyshape)
      }
    }
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
  // console.info('Region', region, 'is valid')
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
