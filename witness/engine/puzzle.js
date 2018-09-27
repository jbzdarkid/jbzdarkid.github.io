class Region {
  constructor(length) {
    this.grid = []
    for (var i=0; i<length; i++) {
      this.grid.push(0)
    }
    this.cells = []
  }

  clone() {
    var clone = new Region(this.grid.length)
    this.grid = this.grid.slice()
    this.cells = this.cells.slice()
    return clone
  }

  _mod(val) {
    var mod = this.grid.length
    return ((val % mod) + mod) % mod
  }

  setCell(x, y) {
    x = this._mod(x)
    if ((this.grid[x] & (1 << y)) != 0) return
    this.grid[x] |= (1 << y)
    if (x%2 == 1 && y%2 == 1) { // TODO: Validate handles center cells only!
      this.cells.push({'x':x, 'y':y})
    }
  }

  merge(other) {
    this.cells = this.cells.concat(other.cells)
    for (var i=0; i<this.grid.length; i++) {
      this.grid[i] += other.grid[i]
    }
  }
}

// A 2x2 grid is internally a 5x5:
// corner, edge, corner, edge, corner
// edge,   cell, edge,   cell, edge
// corner, edge, corner, edge, corner
// edge,   cell, edge,   cell, edge
// corner, edge, corner, edge, corner
//
// Corners and edges will have a value of true if the line passes through them
// Cells will contain an object if there is an element in them
class Puzzle {
  constructor(width, height, pillar=false) {
    if (pillar) {
      width -= 0.5
      this.end = {'x':0, 'y':0, 'dir':'top'}
    } else {
      this.end = {'x':2*width, 'y':0, 'dir':'right'}
    }
    this.grid = this.newGrid(2*width+1, 2*height+1)
    this.startPoints = []
    this.dots = []
    this.gaps = []
    this.regionCache = {}
    this.pillar = pillar
  }

  static deserialize(json) {
    var parsed = JSON.parse(json)
    var puzzle = new Puzzle()
    puzzle.name = parsed.name
    puzzle.grid = parsed.grid
    if (parsed.startPoints) {
      puzzle.startPoints = parsed.startPoints
    } else {
      puzzle.startPoints = [parsed.start]
    }
    puzzle.end = parsed.end
    puzzle.dots = parsed.dots
    puzzle.gaps = parsed.gaps
    puzzle.regionCache = parsed.regionCache
    puzzle.pillar = parsed.pillar
    return puzzle
  }

  serialize() {
    return JSON.stringify(this)
  }

  newGrid(width, height) { // FIXME: Should this just be puzzle.clearGrid?
    var grid = []
    for (var i=0; i<width; i++) {
      grid[i] = []
      for (var j=0; j<height; j++) {
        grid[i][j] = false
      }
    }
    return grid
  }

  copyGrid() {
    var new_grid = []
    for (var row of this.grid) {
      new_grid.push(row.slice())
    }
    return new_grid
  }

  // Wrap a value around at the width of the grid.
  _mod(val) {
    var mod = this.grid.length
    return ((val % mod) + mod) % mod
  }

  getCell(x, y) {
    if (this.pillar) {
      x = this._mod(x)
    } else {
      if (x < 0 || x >= this.grid.length) return undefined
    }
    if (y < 0 || y >= this.grid[x].length) return undefined
    return this.grid[x][y]
  }

  setCell(x, y, value) {
    // throw 'grid['+x+']['+y+'] is out of bounds'
    if (this.pillar) {
      x = this._mod(x)
    } else {
      if (x < 0 || x >= this.grid.length) return
    }
    if (y < 0 || y >= this.grid[x].length) return
    this.grid[x][y] = value
  }

  toggleStart(x, y) {
    for (var startPoint of this.startPoints) {
      if (startPoint.x == x && startPoint.y == y) {
        this.startPoints.remove(startPoint)
        return
      }
    }
    this.startPoints.push({'x':x, 'y':y})
  }

  isEndpoint(x, y) {
    if (this.pillar) x = this._mod(x)
    if (x != this.end.x) return false
    if (y != this.end.y) return false
    return true
  }

  clone() {
    var copy = new Puzzle(0, 0)
    copy.grid = this.copyGrid()
    copy.startPoints = this.startPoints.slice()
    copy.end = this.end
    copy.dots = this.dots.slice()
    copy.gaps = this.gaps.slice()
    copy.regionCache = this.regionCache
    copy.pillar = this.pillar
    copy.hints = this.hints
    return copy
    /*
    return {
      'grid':this.copyGrid(this.grid),
      'start':{'x':this.start.x, 'y':this.start.y},
      'end':{'x':this.end.x, 'y':this.end.y},
      'dots':this.dots.slice(),
      'gaps':this.gaps.slice(),
      'regionCache':this.regionCache,
      'pillar':this.pillar
    }
    */
  }

  // Called on a solution. Computes a list of gaps to show as hints which *do not*
  // break the path.
  loadHints() {
    this.hints = []
    for (var x=0; x<this.grid.length; x++) {
      for (var y=0; y<this.grid[x].length; y++) {
        if (x%2 + y%2 == 1 && !this.getCell(x, y)) {
          this.hints.push({'x':x, 'y':y})
        }
      }
    }
  }

  // Show a hint on the grid.
  // If no hint is provided, will select the best one it can find,
  // prioritizing breaking current lines on the grid.
  // Returns the shown hint.
  showHint(hint) {
    if (hint != undefined) {
      this.gaps.push(hint)
      return
    }

    var goodHints = []
    var badHints = []

    for (var hint of this.hints) {
      if (this.getCell(hint.x, hint.y) == true) {
        // Solution will be broken by this hint
        goodHints.push(hint)
      } else {
        badHints.push(hint)
      }
    }
    if (goodHints.length > 0) {
      var hint = goodHints.splice(_randint(goodHints.length), 1)[0]
    } else if (badHints.length > 0) {
      var hint = badHints.splice(_randint(badHints.length), 1)[0]
    } else {
      return
    }
    this.gaps.push(hint)
    this.hints = badHints.concat(goodHints)
    return hint
  }

  clearLines() {
    for (var x=0; x<this.grid.length; x++) {
      for (var y=0; y<this.grid[x].length; y++) {
        if (x%2 == 1 && y%2 == 1) continue
        this.grid[x][y] = false
      }
    }
  }

  _innerLoop(x, y, region) {
    region.setCell(x, y)
    this.setCell(x, y, true)

    if (this.getCell(x, y + 1) == false) {
      this._innerLoop(x, y + 1, region)
    }
    if (this.getCell(x + 1, y) == false) {
      this._innerLoop(x + 1, y, region)
    }
    if (this.getCell(x, y - 1) == false) {
      this._innerLoop(x, y - 1, region)
    }
    if (this.getCell(x - 1, y) == false) {
      this._innerLoop(x - 1, y, region)
    }
  }

  getRegions() {
    var savedGrid = this.copyGrid()
    // Temporarily remove all elements from the grid
    for (var x=1; x<this.grid.length; x+=2) {
      for (var y=1; y<this.grid[x].length; y+=2) {
        this.grid[x][y] = false
      }
    }
    var regions = []
    var pos = {'x':0, 'y':0}
    while (true) {
      // Find the next open cell
      while (this.getCell(pos.x, pos.y) != false) {
        pos.x++
        if (pos.x >= this.grid.length) {
          pos.x = 0
          pos.y++
        }
        if (pos.y >= this.grid[0].length) {
          this.grid = savedGrid
          return regions
        }
      }

      var region = new Region(this.grid.length)
      this._innerLoop(pos.x, pos.y, region)
      regions.push(region)
    }
  }
}

Puzzle.prototype.toString = function() {
  var output = ''
  for (var y=0; y<this.grid[0].length; y++) {
    for (var x=0; x<this.grid.length; x++) {
      cell = this.getCell(x, y)
      if (cell == false) output += '0'
      else if (cell == true) output += '1'
      else output += '#'
    }
    output += '\n'
  }
  return output
}
