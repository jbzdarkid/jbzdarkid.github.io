class Puzzle {
  constructor(width, height, pillar=false) {
    if (pillar) {
      height -= 0.5
    }
    this.grid  = this.newGrid(2*width+1, 2*height+1)
    this.start = {'x':2*width, 'y':0}
    this.end   = {'x':0, 'y':2*height}
    this.dots  = []
    this.gaps  = []
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
    if (this.pillar) {
      var mod = this.grid[0].length
      return ((val % mod) + mod) % mod
    } else {
      return val
    }
  }

  getCell(x, y) {
    if (x < 0 || x >= this.grid.length) return undefined
    return this.grid[x][this._mod(y)]
  }

  setCell(x, y, value) {
    if (x < 0 || x >= this.grid.length) throw 'grid['+x+']['+y+'] is out of bounds'
    this.grid[x][this._mod(y)] = value
  }

  isEndpoint(x, y) {
    return (x == this.end.x && this._mod(y) == this.end.y)
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
    delete potentialRegions[x+'_'+y]
    if (this.getCell(x, y) == true) return
    region.push({'x':x, 'y':y})
    this.setCell(x, y, true)

    if (this.getCell(x-2, y) == false) { // Unvisited cell left
      if (this.getCell(x-1, y) == false) { // Connected
        this._innerLoop(x-2, y, region, potentialRegions)
      } else { // Disconnected, potential new region
        potentialRegions[(x-2)+'_'+y] = true
      }
    }
    if (this.getCell(x+2, y) == false) { // Unvisited cell right
      if (this.getCell(x+1, y) == false) { // Connected
        this._innerLoop(x+2, y, region, potentialRegions)
      } else { // Disconnected, potential new region
        potentialRegions[(x+2)+'_'+y] = true
      }
    }
    if (this.getCell(x, y-2) == false) { // Unvisited cell above
      if (this.getCell(x, y-1) == false) { // Connected
        this._innerLoop(x, y-2, region, potentialRegions)
      } else { // Disconnected, potential new region
        potentialRegions[x+'_'+(y-2)] = true
      }
    }
    if (this.getCell(x, y+2) == false) { // Unvisited cell below
      if (this.getCell(x, y+1) == false) { // Connected
        this._innerLoop(x, y+2, region, potentialRegions)
      } else { // Disconnected, potential new region
        potentialRegions[x+'_'+(y+2)] = true
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
    var potentialRegions = {'1_1': true}
    var regions = []
    while (Object.keys(potentialRegions).length > 0) {
      var pos = Object.keys(potentialRegions)[0]
      var x = parseInt(pos.split('_')[0])
      var y = parseInt(pos.split('_')[1])
      var region = []
      this._innerLoop(x, y, region, potentialRegions)
      regions.push(region)
    }
    this.grid = savedGrid
    if (window.debug) console.log(regions)
    return regions
  }
}

