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

  setCell(x, y) {
    if (this.getCell(x, y)) return
    this.grid[x] |= (1 << y)
    this.cells.push({'x':x, 'y':y})
  }
  
  getCell(x, y) {
    return (this.cells[x] & (1 << y)) != 0
  }
  
  popCell() {
    this.grid[x] &= ~(1 << y)
    return this.cells.pop()
  }
  
  hash() {
    return this.grid.join('_');
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
      height -= 0.5
    }
    this.grid = this.newGrid(2*width+1, 2*height+1)
    this.start = {'x':2*width, 'y':0}
    this.end = {'x':0, 'y':2*height}
    this.dots = []
    this.gaps = []
    this.regionCache = {}
    this.pillar = pillar
  }

  static deserialize(json) {
    var parsed = JSON.parse(json)
    var puzzle = new Puzzle()
    puzzle.grid = parsed.grid
    puzzle.start = parsed.start
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
    var mod = this.grid[0].length
    return ((val % mod) + mod) % mod
  }

  getCell(x, y) {
    if (x < 0 || x >= this.grid.length) return undefined
    if (this.pillar) {
      y = this._mod(y)
    } else {
      if (y < 0 || y >= this.grid[x].length) return undefined
    }
    return this.grid[x][y]
  }

  setCell(x, y, value) {
    // throw 'grid['+x+']['+y+'] is out of bounds'
    if (x < 0 || x >= this.grid.length) return
    if (this.pillar) {
      y = this._mod(y)
    } else {
      if (y < 0 || y >= this.grid[x].length) return
    }
    this.grid[x][y] = value
  }

  isEndpoint(x, y) {
    if (x != this.end.x) return false
    if (this.pillar) {
      y = this._mod(y)
    }
    return y == this.end.y
  }

  clone() {
    var copy = new Puzzle(0, 0)
    copy.grid = this.copyGrid()
    copy.start = {'x':this.start.x, 'y':this.start.y}
    copy.end = {'x':this.end.x, 'y':this.end.y}
    copy.dots = this.dots.slice()
    copy.gaps = this.gaps.slice()
    copy.regionCache = this.regionCache
    copy.pillar = this.pillar
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

  _innerLoop(x, y, region, potentialRegions) {
    if (this.getCell(x, y) == true) return
    region.setCell(x, y)
    this.setCell(x, y, true)

    if (this.getCell(x - 2, y) == false) { // Unvisited cell left
      if (this.getCell(x - 1, y) == false) { // Connected
        this._innerLoop(x - 2, y, region, potentialRegions)
      } else { // Disconnected, potential new region
        potentialRegions.push({'x':x - 2, 'y':y})
      }
    }
    if (this.getCell(x + 2, y) == false) { // Unvisited cell right
      if (this.getCell(x + 1, y) == false) { // Connected
        this._innerLoop(x + 2, y, region, potentialRegions)
      } else { // Disconnected, potential new region
        potentialRegions.push({'x':x + 2, 'y':y})
      }
    }
    if (this.getCell(x, y - 2) == false) { // Unvisited cell above
      if (this.getCell(x, y - 1) == false) { // Connected
        this._innerLoop(x, y - 2, region, potentialRegions)
      } else { // Disconnected, potential new region
        potentialRegions.push({'x':x, 'y':y - 2})
      }
    }
    if (this.getCell(x, y + 2) == false) { // Unvisited cell below
      if (this.getCell(x, y + 1) == false) { // Connected
        this._innerLoop(x, y + 2, region, potentialRegions)
      } else { // Disconnected, potential new region
        potentialRegions.push({'x':x, 'y':y + 2})
      }
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
    var potentialRegions = [{'x':1, 'y':1}]
    var regions = []
    while (potentialRegions.length > 0) {
      var pos = potentialRegions.pop()
      var region = new Region(this.grid.length)
      this._innerLoop(pos.x, pos.y, region, potentialRegions)
      regions.push(region)
    }
    this.grid = savedGrid
    return regions
  }
}
