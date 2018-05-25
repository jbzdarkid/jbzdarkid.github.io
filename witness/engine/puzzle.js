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
    var cell = this.cells.pop()
    this.grid[cell.x] &= ~(1 << cell.y)
    return cell
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

  _innerLoop(x, y, region) {
    region.setCell(x, y)
    this.setCell(x, y, true)

    if (this.getCell(x, y + 2) == false && this.getCell(x, y + 1) == false) {
      this._innerLoop(x, y + 2, region)
    }
    if (this.getCell(x + 2, y) == false && this.getCell(x + 1, y) == false) {
      this._innerLoop(x + 2, y, region)
    }
    if (this.getCell(x, y - 2) == false && this.getCell(x, y - 1) == false) {
      this._innerLoop(x, y - 2, region)
    }
    if (this.getCell(x - 2, y) == false && this.getCell(x - 1, y) == false) {
      this._innerLoop(x - 2, y, region)
    }
  }

  _innerLoop2(x, y, region) {
    region.setCell(x, y)
    this.setCell(x, y, true)

    var i = x
    while(this.getCell(i - 2, y) == false && this.getCell(i - 1, y) == false) {
      i -= 2
      region.setCell(i, y)
      this.setCell(i, y, true)
    }
    
    var j = x
    while(this.getCell(j + 2, y) == false && this.getCell(j + 1, y) == false) {
      j += 2
      region.setCell(j, y)
      this.setCell(j, y, true)
    }
    
    for (var above = i; above <= j; above += 2) {
      if (this.getCell(above, y - 2) != false) continue
      if (this.getCell(above, y - 1) != true) {
        this._innerLoop2(above, y - 2, region)
      }
    }
    
    for (var below = i; below <= j; below += 2) {
      if (this.getCell(below, y + 2) != false) continue
      if (this.getCell(below, y + 1) != true) {
        this._innerLoop2(below, y + 2, region)
      }
    }
  }

  _innerLoop3() {
    var regions = [new Region(this.grid.length)]
    var color = 0
    var regionMap = [[]]

    for (var x = 1; x < this.grid.length; x += 2) {
      for (var y = 1; y < this.grid[x].length; y += 2) {
        if (y > 1 && this.getCell(x, y - 1) == false) {
          color = this.getCell(x, y - 2)
          if (x > 1 && this.getCell(x - 1, y) == false) {
            var otherColor = this.getCell(x - 2, y)
            if (otherColor < color) {
              regionMap[otherColor].push(color)
            } else if (color < otherColor) {
              regionMap[color].push(otherColor)
            }
          }
        } else if (x > 1 && this.getCell(x - 1, y) == false) {
          color = this.getCell(x - 2, y)
        } else {
          color = regions.length
          regions.push(new Region(this.grid.length))
          regionMap.push([])
        }
        regions[color].setCell(x, y)
        this.setCell(x, y, color)
      }
    }

    for (var i = regionMap.length - 1; i >= 0; i--) {
      if (regionMap[i] == undefined) continue
      var toVisit = regionMap[i]
      while(toVisit.length > 0) {
        var j = toVisit.pop()
        if (regionMap[j] == undefined) continue
        toVisit = toVisit.concat(regionMap[j])
        regions[i].merge(regions[j])
      }
    }

    // Clean the regions list
    var len = regions.length
    for (var i=0; i < len; i++) {
      if (regions[i] != undefined) regions.push(regions[i])
    }
    regions.splice(0, len)

    return regions
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
    var pos = {'x':1, 'y':1}
    while (true) {
      var region = new Region(this.grid.length)
      this._innerLoop(pos.x, pos.y, region)
      regions.push(region)
      
      // Find the next open cell
      while (this.getCell(pos.x, pos.y) != false) {
        pos.x += 2
        if (pos.x >= this.grid.length) {
          pos.y += 2
          pos.x = 1
        }
        if (pos.y >= this.grid[pos.x].length) {
          this.grid = savedGrid
          return regions
        }
      }
    }
  }
}
