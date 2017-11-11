class Region {
  constructor(grid) {
    this.grid = grid
    this.cells = []
    for (var i=0; i<grid.length; i++) {
      this.cells.push(0)
    }
    this.hasTriangles = false
    this.invalidTriangles = []
    this.activeNegations = 0
    this.colors = {}
    this.elements = {
      'poly':[],
      'ylop':[],
      'dot':[],
      'gap':[],
    }
  }

  clone() {
    var clone = new Region(this.grid)
    clone.grid = _copyGrid(this.grid)
    clone.cells = this.cells.slice()
    clone.hasTriangles = this.hasTriangles
    clone.invalidTriangles = this.invalidTriangles.slice()
    clone.activeNegations = this.activeNegations
    clone.colors = {}
    for (var color of Object.keys(this.colors)) {
      var objects = this.colors[color]
      clone.colors[color] = {
        'squares':this.colors[color]['squares'],
        'stars':this.colors[color]['stars'],
        'other':this.colors[color]['other']
      }
    }
    clone.elements = {
      'poly': this.elements['poly'].slice(),
      'ylop': this.elements['ylop'].slice(),
      'dot': this.elements['dot'].slice(),
      'gap': this.elements['gap'].slice()
    }
    return clone
  }

  addCell(x, y) {
    this.cells[x] |= (1 << y)
    var cell = this.grid[x][y]
    if (cell != undefined) {
      if (cell.color != undefined) {
        if (this.colors[cell.color] == undefined) {
          this.colors[cell.color] = {'squares':0, 'stars':0, 'other':0}
        }
        if (cell.type == 'square') {
          this.colors[cell.color]['squares']++
        } else if (cell.type == 'star') {
          this.colors[cell.color]['stars']++
        } else {
          this.colors[cell.color]['other']++
        }
      }
      if (cell.type == 'triangle') {
        this.hasTriangles = true
        var count = 0
        if (this.grid[x-1][y]) count++
        if (this.grid[x+1][y]) count++
        if (this.grid[x][y-1]) count++
        if (this.grid[x][y+1]) count++
        if (count != cell.count) {
          // console.log('Triangle at grid['+x+']['+y+'] has', count, 'borders')
          this.invalidTriangles.push({'x':x, 'y':y})
        }
      } else if (cell.type == 'square' || cell.type == 'star') {
        // No need to list these
      } else if (cell.type == 'nonce') {
        // FIXME: Nonce is deprecated
      } else if (cell.type == 'nega') {
        this.activeNegations++
      } else if (cell.type != undefined) {
        this.elements[cell.type].push(cell)
      }
    }
  }

  removeCell(x, y) {
    this.cells[x] &= ~(1 << y)
    var cell = this.grid[x][y]
    if (cell != undefined) {
      if (cell.color != undefined) {
        if (cell.type == 'square') {
          this.colors[cell.color]['squares']--
        } else if (cell.type == 'star') {
          this.colors[cell.color]['stars']--
        } else {
          this.colors[cell.color]['other']--
        }
      }
      if (cell.type == 'triangle') {
        var newList = []
        for (var triangle of this.invalidTriangles) {
          if (triangle.x != x || triangle.y != y) {
            newList.push(triangle)
          }
        }
        this.invalidTriangles = newList
      } else if (cell.type == 'square' || cell.type == 'star') {
        // No need to list these
      } else if (cell.type == 'nonce') {
        // FIXME: Nonce is deprecated
      } else if (cell.type == 'nega') {
        this.activeNegations--
      } else if (cell.type != undefined) {
        if (this.elements[cell.type] == undefined) {
          console.log(cell.type, this.elements[cell.type])
        }
        var newList = []
        for (var elem of this.elements[cell.type]) {
          if (elem.x == x || elem.y == y) continue
          newList.push(elem)
        }
        this.elements[cell.type] = newList
      }
    }
  }
/*
  getCell(x, y) {
    return (this.cells[x] & (1 << y)) != 0
  }
*/
}

Region.prototype.toString = function() {
  var ret = ""
  for (var row of this.cells) {
    ret += row.toString()
  }
  return ret
}

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

  _innerLoop(x, y, region, region2, potentialRegions) {
    delete potentialRegions[x+'_'+y]
    if (this.getCell(x, y) == true) return
    region.push({'x':x, 'y':y})
    region2.addCell(x, y)
    this.setCell(x, y, true)

    if (this.getCell(x-2, y) == false) { // Unvisited cell left
      if (this.getCell(x-1, y) == false) { // Connected
        this._innerLoop(x-2, y, region, region2, potentialRegions)
      } else { // Disconnected, potential new region
        potentialRegions[(x-2)+'_'+y] = true
      }
    }
    if (this.getCell(x+2, y) == false) { // Unvisited cell right
      if (this.getCell(x+1, y) == false) { // Connected
        this._innerLoop(x+2, y, region, region2, potentialRegions)
      } else { // Disconnected, potential new region
        potentialRegions[(x+2)+'_'+y] = true
      }
    }
    if (this.getCell(x, y-2) == false) { // Unvisited cell above
      if (this.getCell(x, y-1) == false) { // Connected
        this._innerLoop(x, y-2, region, region2, potentialRegions)
      } else { // Disconnected, potential new region
        potentialRegions[x+'_'+(y-2)] = true
      }
    }
    if (this.getCell(x, y+2) == false) { // Unvisited cell below
      if (this.getCell(x, y+1) == false) { // Connected
        this._innerLoop(x, y+2, region, region2, potentialRegions)
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
      var region2 = new Region(savedGrid)
      this._innerLoop(x, y, region, region2, potentialRegions)
      regions.push([region, region2])
    }
    this.grid = savedGrid
    return regions
  }
}

