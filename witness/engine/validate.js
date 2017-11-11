// Puzzle = {grid, start, end, dots, gaps}
// Determines if the current grid state is solvable.
function isValid(puzzle) {
  // console.log('Validating', puzzle)

  // Check that all dots are covered
  // FIXME: Check for invalid dot placement?
  // FIXME: Code in such a way that this works with negation?
  for (var dot of puzzle.dots) {
    if (!puzzle.getCell(dot.x, dot.y)) {
      // console.log('Dot at grid['+dot.x+']['+dot.y+'] is not covered')
      return false
    }
  }
  // Check that all gaps are not covered
  // FIXME: Check for invalid gap placement?
  for (var gap of puzzle.gaps) {
    if (puzzle.getCell(gap.x, gap.y)) {
      // console.log('Gap at grid['+gap.x+']['+gap.y+'] is covered')
      return false
    }
  }
  // Check that individual regions are valid
  for (var r of puzzle.getRegions()) {
    var key = r[1].toString()
    var regionValid = puzzle.regionCache[key]
    if (regionValid == undefined) {
      // console.log('Cache miss for region', region, 'key', key)
      regionValid = _regionCheck(puzzle, r[0], r[1])
      //puzzle.regionCache[key] = regionValid
      // FIXME: Can't cache regions with triangles because the edges matter, not just the cells.
      if (r[1].hasTriangles) {
        puzzle.regionCache[key] = undefined
      }
    }
    
    if (!regionValid) {
      // console.log('Region', region, 'unsolvable')
      return false // Since the endpoint is filled, regions can't be improved
    }
  }
  // All checks passed
  // console.info('Puzzle', puzzle, 'is valid')
  return true
}

// Checks if a region (series of cells) is valid.
// Since the path must be complete at this point, returns only true or false
function _regionCheck(puzzle, r0, r1) {
  // console.log('Validating region of length', r0.length)
  var hasNega = false
  for (var pos of r0) {
    var cell = puzzle.getCell(pos.x, pos.y)
    if (cell != false && cell.type == 'nega') {
      hasNega = true
      break
    }
  }
  if (r1.activeNegations > 0) {
    // Iterate over all possible ways of applying negations
    var combinations = _combinations(puzzle, r0, r1)
    nextCombination: for (var combination of combinations) {
      // Make a copy of the grid and region with negation elements removed
      var new_puzzle = puzzle.clone()
      var r1c = r1.clone()
      for (var negation of combination) {
        new_puzzle.setCell(negation.source.x, negation.source.y, false)
        new_puzzle.setCell(negation.target.x, negation.target.y, false)
        r1c.removeCell(negation.source.x, negation.source.y)
        r1c.removeCell(negation.target.x, negation.target.y)
      }
      // Verify that the puzzle solves with negations applied
      if (!_regionCheck(new_puzzle, r0, r1c)) {
        continue
      }
      // Verify that each negation is valid, i.e. removes an incorrect element
      for (var negation of combination) {
        r1c.addCell(negation.target.x, negation.target.y)
        r1c.grid[negation.source.x][negation.source.y].type = 'nonce'
        r1c.addCell(negation.source.x, negation.source.y)

        new_puzzle.setCell(negation.target.x, negation.target.y, negation.target.cell)
        negation.source.cell.type = 'nonce'
        new_puzzle.setCell(negation.source.x, negation.source.y, negation.source.cell)
        var isValid = _regionCheck(new_puzzle, r0, r1c)
        new_puzzle.setCell(negation.source.x, negation.source.y, false)
        negation.source.cell.type = 'nega'
        new_puzzle.setCell(negation.target.x, negation.target.y, false)

        r1c.removeCell(negation.source.x, negation.source.y)
        r1c.grid[negation.source.x][negation.source.y].type = 'nega'
        r1c.removeCell(negation.target.x, negation.target.y)
        if (isValid) {
          // Grid is still valid with element removed so the negation is invalid
          continue nextCombination
        }
      }
      // console.info('Valid negation: ', combination)
      return true
    }
    // console.log('Unable to find valid negation, but symbols exist')
    return false
  }

  // Check for triangles
  if (r1.invalidTriangles.length > 0) return false

  // Check for color-based elements
  for (var color of Object.keys(r1.colors)) {
    var objects = r1.colors[color]
    if (objects['squares'] > 0) {
      // Squares can only be in a region with same colored squares
      for (var color2 of Object.keys(r1.colors)) {
        if (color2 != color && r1.colors[color2]['squares'] > 0) {
          // console.log('Found a '+color+' and '+color2+' square in the same region')
          return false
        }
      }
    }
    if (objects['stars'] > 0) {
      // Stars must be in a region with exactly one other element of their color
      var count = objects['squares']+objects['stars']+objects['other']
      if (count != 2) {
        // console.log('Found a '+color+' star in a region with '+count+' total '+color+' objects')
        return false
      }
    }
  }

  // For polyominos, we construct a grid to place them on
  // The grid is 1 inside the region, and undefined outside.
  var polys = []
  var ylops = []
  var polyCount = 0
  for (var pos of r0) {
    var cell = puzzle.getCell(pos.x, pos.y)
    if (cell != 0) {
      if (cell.type == 'poly') {
        polys.push(cell)
        polyCount += cell.size
      } else if (cell.type == 'ylop') {
        ylops.push(cell)
        polyCount -= cell.size
      }
    }
  }
  if (polys.length + ylops.length > 0) { // Some polys/ylops exist in the region
    if (polyCount < 0) {
      // console.log('More onimoylops than polyominos by', -polyCount)
      return false
    } else if (polyCount > 0 && polyCount < r0.length) {
      // console.log('Combined size of polyominos', polyCount, 'does not match region size', region.length)
      return false
    }
    var savedGrid = puzzle.copyGrid()
    puzzle.grid = puzzle.newGrid(puzzle.grid.length, puzzle.grid[0].length, puzzle.pillar)
    // If polyCount == 0, then ylops cancel polys, and we should present the
    // region as nonexistant, thus forcing all the shapes to cancel.
    if (polyCount == 0) {
      r0 = []
    }
    for (var cell of r0) {
      puzzle.setCell(cell.x, cell.y, true)
    }
    if (!_polyFit(polys, ylops, puzzle.grid)) {
      // console.log('Region does not match polyomino shapes', polys, ylops)
      puzzle.grid = savedGrid
      return false
    }
    puzzle.grid = savedGrid
  }
  // console.info('Region valid', region)
  return true
}

// Returns all the different ways to negate elements.
function _combinations(puzzle, r0, r1, regionStart=0) {
  // Find the first negation element (may be part of cells already considered)
  var nega = undefined
  for (var i=0; i<r0.length; i++) {
    var pos = r0[i]
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
  for (var i=regionStart; i<r0.length; i++) {
    var pos = r0[i]
    var cell = puzzle.getCell(pos.x, pos.y)
    if (cell == false) continue
    puzzle.setCell(pos.x, pos.y, false)
    // Find all combinations of later items
    for (var comb of _combinations(puzzle, r0, r1, i+1)) {
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
    var ylopRotations = getPolyomino(ylop.size, ylop.shape, ylop.rot)
    for (var ylopCells of ylopRotations) {
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
            grid[cell.x+x][cell.y+y]++
          }
          var ret = _polyFit(polys, ylops, grid)
          for (var cell of ylopCells) { // Restore the grid
            grid[cell.x+x][cell.y+y]--
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
    var polyRotations = getPolyomino(poly.size, poly.shape, poly.rot)
    var polyFits = false
    nextRotation: for (var polyCells of polyRotations) {
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
