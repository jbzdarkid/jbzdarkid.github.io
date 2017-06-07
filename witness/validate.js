// Puzzle = {grid, start, end, dots, gaps}
// Determines if the current grid state is solvable.
function isValid(puzzle) {
  // console.log('Validating', puzzle)

  // Check that all dots are covered
  // FIXME: Check for invalid dot placement?
  // FIXME: Code in such a way that this works with negation?
  for (var dot of puzzle.dots) {
    if (!puzzle.grid[dot.x][dot.y]) {
      // console.log('Dot at grid['+dot.x+']['+dot.y+'] is not covered')
      return false
    }
  }
  // Check that all gaps are not covered
  // FIXME: Check for invalid gap placement?
  for (var gap of puzzle.gaps) {
    if (puzzle.grid[gap.x][gap.y]) {
      // console.log('Gap at grid['+gap.x+']['+gap.y+'] is covered')
      return false
    }
  }
  // Check that individual regions are valid
  for (var region of _getRegions(puzzle.grid)) {
    if (!_regionCheck(puzzle.grid, region)) {
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
function _regionCheck(grid, region) {
  // console.log('Validating region of length', region.length)
  var hasNega = false
  for (var pos of region) {
    var cell = grid[pos.x][pos.y]
    if (cell != 0 && cell.type == 'nega') {
      hasNega = true
      break
    }
  }
  if (hasNega) {
    // Iterate over all possible ways of applying negations
    var combinations = _combinations(grid, region)
    nextCombination: for (var combination of combinations) {
      // Make a copy of the grid and region with negation elements removed
      var new_grid = _copyGrid(grid)
      for (var negation of combination) {
        new_grid[negation.source.x][negation.source.y] = 0
        new_grid[negation.target.x][negation.target.y] = 0
      }
      // Verify that the puzzle solves with negations applied
      if (!_regionCheck(new_grid, region)) {
        continue
      }
      // Verify that each negation is valid, i.e. removes an incorrect element
      for (var negation of combination) {
        new_grid[negation.target.x][negation.target.y] = negation.target.cell
        negation.source.cell.type = 'nonce'
        new_grid[negation.source.x][negation.source.y] = negation.source.cell
        var isValid = _regionCheck(new_grid, region)
        new_grid[negation.target.x][negation.target.y] = 0
        negation.source.cell.type = 'nega'
        new_grid[negation.source.x][negation.source.y] = 0
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
  for (var pos of region) {
    if (grid[pos.x][pos.y].type == 'triangle') {
      var count = 0
      if (grid[pos.x-1][pos.y]) count++
      if (grid[pos.x+1][pos.y]) count++
      if (grid[pos.x][pos.y-1]) count++
      if (grid[pos.x][pos.y+1]) count++
      if (count != grid[pos.x][pos.y].count) {
        // console.log('Triangle at grid['+pos.x+']['+pos.y+'] has', count, 'borders')
        return false
      }
    }
  }

  // Check for color-based elements
  var colors = {}
  for (var pos of region) {
    var cell = grid[pos.x][pos.y]
    if (cell != 0) {
      if (colors[cell.color] == undefined) {
        colors[cell.color] = {'squares':0, 'stars':0, 'other':0}
      }
      if (cell.type == 'square') {
        colors[cell.color]['squares']++
      } else if (cell.type == 'star') {
        colors[cell.color]['stars']++
      } else if (cell.type == 'poly' || cell.type == 'nega' || cell.type == 'nonce' || cell.type == 'tri') {
        colors[cell.color]['other']++
      }
    }
  }

  var colorKeys = Object.keys(colors)
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
  for (var pos of region) {
    var cell = grid[pos.x][pos.y]
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
    } else if (polyCount > 0 && polyCount < region.length) {
      // console.log('Combined size of polyominos', polyCount, 'does not match region size', region.length)
      return false
    }
    var new_grid = []
    for (var x=0; x<grid.length; x++) {
      new_grid[x] = []
      for (var y=0; y<grid[x].length; y++) {
        new_grid[x][y] = 0
      }
    }
    // If polyCount == 0, then ylops cancel polys, and we should present the
    // region as non-existant, thus forcing all the shapes to cancel.
    if (polyCount == 0) {
      region = []
    }
    for (var cell of region) {
      new_grid[cell.x][cell.y] = 1
    }
    if (!_polyFit(polys, ylops, new_grid)) {
      // console.log('Region does not match polyomino shapes', polys, ylops)
      return false
    }
  }
  // console.info('Region valid', region)
  return true
}

// Returns all the different ways to negate elements.
// FIXME: Doesn't remove swaps, i.e. A->i B->j == A->j B->i
function _combinations(grid, region) {
  // Get the first negation symbol
  var nega = undefined
  for (var i=0; i<region.length; i++) {
    var pos = region[i]
    var cell = grid[pos.x][pos.y]
    if (cell != 0) {
      if (cell.type == 'nega') {
        nega = {'x':pos.x, 'y':pos.y, 'cell':cell, 'i':i}
        break
      }
    }
  }
  if (nega == undefined) {
    return [[]]
  } else {
    // Remove it from the region so we don't try and use it
    region.splice(nega.i, 1)
    grid[nega.x][nega.y] = 0
    var combinations = []
    // For each element in the region
    for (var i=0; i<region.length; i++) {
      var pos = region[i]
      var cell = grid[pos.x][pos.y]
      if (cell != 0) {
        // Negate the item
        // FIXME: This is where duplication occurs.
        var new_region = region.slice()
        new_region.splice(i, 1)
        grid[pos.x][pos.y] = 0
        // Find all combinations of later items
        for (var comb of _combinations(grid, new_region)) {
          // Combine this negation with each later combination
          combinations.push([{
            'source':{'x':nega.x, 'y':nega.y, 'cell':nega.cell},
            'target':{'x':pos.x, 'y':pos.y, 'cell':cell}
          }].concat(comb))
        }
        // Undo the negation
        grid[pos.x][pos.y] = cell
      }
    }
    // Restore the negation element too
    region.splice(nega.i, 0, {'x':nega.x, 'y':nega.y})
    grid[nega.x][nega.y] = nega.cell
    return combinations
  }
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
