var tests = [
  function() {
    var grid = _newGrid(3, 7)
    grid[1][1] = {'type':'nega', 'color':'white'}
    grid[1][3] = {'type':'square', 'color':'red'}
    grid[1][5] = {'type':'square', 'color':'blue'}
    return {'grid':grid}
  }, function() {
    var grid = _newGrid(7, 7)
    grid[1][5] = {'type':'nega', 'color':'white'}
    grid[5][5] = {'type':'nega', 'color':'white'}
    grid[1][1] = {'type':'square', 'color':'red'}
    grid[1][3] = {'type':'square', 'color':'blue'}
    grid[5][3] = {'type':'poly', 'shape':'1.0.0', 'color':'yellow'}
    return {'grid':grid}
  }, function () {
    var grid = _newGrid(7, 7)
    grid[1][1] = {'type':'nega', 'color':'white'}
    grid[1][3] = {'type':'nega', 'color':'white'}
    grid[3][1] = {'type':'square', 'color':'red'}
    grid[3][3] = {'type':'square', 'color':'blue'}
    grid[3][5] = {'type':'square', 'color':'blue'}
    return {'grid':grid}
  }, function () {
    var grid = _newGrid(7, 7)
    grid[1][1] = {'type':'nega', 'color':'white'}
    grid[1][3] = {'type':'nega', 'color':'white'}
    grid[3][1] = {'type':'square', 'color':'red'}
    grid[3][3] = {'type':'square', 'color':'blue'}
    grid[3][5] = {'type':'square', 'color':'blue'}
    return {'grid':grid, 'dots':[{'x':2, 'y':2}]}
  }, function () {
    var grid = _newGrid(7, 7)
    grid[1][1] = {'type':'poly', 'shape':'1.0.0', 'color':'yellow'}
    grid[1][3] = {'type':'poly', 'shape':'2.0.0', 'color':'yellow'}
    return {'grid':grid}
  }, function () {
    var grid = _newGrid(7, 7)
    grid[1][5] = {'type':'poly', 'shape':'3.0.0', 'color':'yellow'}
    grid[3][3] = {'type':'poly', 'shape':'3.1.1', 'color':'yellow'}
    return {'grid':grid}
  }, function () {
    var grid = _newGrid(7, 7)
    grid[1][1] = {'type':'nega', 'color':'white'}
    grid[1][3] = {'type':'poly', 'shape':'3.1.2', 'color':'yellow'}
    grid[3][1] = {'type':'poly', 'shape':'3.1.3', 'color':'yellow'}
    return {'grid':grid}
  }, function () {
    var grid = _newGrid(5, 5)
    grid[1][1] = {'type':'star', 'color':'red'}
    grid[1][3] = {'type':'star', 'color':'blue'}
    grid[3][1] = {'type':'star', 'color':'red'}
    grid[3][3] = {'type':'star', 'color':'blue'}
    return {'grid':grid}
  }, function () {
    var grid = _newGrid(5, 5)
    grid[1][1] = {'type':'star', 'color':'red'}
    grid[1][3] = {'type':'square', 'color':'red'}
    grid[3][1] = {'type':'square', 'color':'red'}
    grid[3][3] = {'type':'star', 'color':'red'}
    return {'grid':grid}
  }, function () {
    var grid = _newGrid(5, 5)
    grid[1][1] = {'type':'star', 'color':'red'}
    grid[1][3] = {'type':'poly', 'shape':'2.0.0', 'color':'red'}
    return {'grid':grid}
  }, function() {
    var grid = _newGrid(5, 7)
    grid[1][1] = {'type':'poly', 'shape':'3.0.0', 'color':'yellow'}
    grid[3][1] = {'type':'poly', 'shape':'3.0.0', 'color':'yellow'}
    return {'grid':grid}
  }, function() {
    var grid = _newGrid(5, 5)
    grid[1][1] = {'type':'square', 'color':'red'}
    grid[1][3] = {'type':'square', 'color':'blue'}
    grid[3][1] = {'type':'square', 'color':'blue'}
    grid[3][3] = {'type':'square', 'color':'red'}
    return {'grid':grid}
  },/* function() {
    var grid = _newGrid(9, 9)
    grid[1][7] = {'type':'nega','color':'white'}
    grid[3][3] = {'type':'square','color':'red'}
    grid[5][1] = {'type':'poly','shape':'3.1.3','color':'yellow'}
    grid[5][3] = {'type':'square','color':'blue'}
    grid[5][5] = {'type':'poly','shape':'3.0.0','color':'yellow'}
    grid[7][1] = {'type':'square','color':'red'}
    grid[7][5] = {'type':'poly','shape':'3.1.0','color':'yellow'}
    grid[7][7] = {'type':'star','color':'blue'}
    return grid
  }, function() {
    var grid = _newGrid(9, 9)
    grid[1][1] = {'type':'poly','shape':'3.0.0','color':'yellow'}
    grid[3][1] = {'type':'poly','shape':'3.0.1','color':'yellow'}
    grid[7][1] = {'type':'poly','shape':'3.1.2','color':'yellow'}
    grid[7][7] = {'type':'square','color':'red'}
    return grid
  }*/
  function() {
    var grid = _newGrid(5, 3)
    var gaps = [{'x':0, 'y':1}, {'x':2, 'y':1}, {'x':4, 'y':1}]
    var dots = [{'x':1, 'y':0}, {'x':1, 'y':2}, {'x':3, 'y':0}, {'x':3, 'y':2}]
    return {'grid':grid, 'dots':dots, 'gaps':gaps}
  }
]

function loadTests() {
  var start = (new Date()).getTime()
  for (var i=0; i<tests.length; i++) {
    try {
      var solutions = []
      var puzzle = tests[i]()
      if (puzzle['start'] == undefined) {
        puzzle['start'] = {'x':puzzle.grid.length-1, 'y':0}
        puzzle.grid[puzzle.start.x][puzzle.start.y] = true
      }
      if (puzzle['end'] == undefined) {
        puzzle['end'] = {'x':0, 'y':puzzle.grid[0].length-1}
      }
      if (puzzle['dots'] == undefined) {
        puzzle['dots'] = []
      }
      if (puzzle['gaps'] == undefined) {
        puzzle['gaps'] = []
      }
      solve(puzzle, puzzle.start, solutions)
      console.log('Solved', puzzle)
      console.log('Found', solutions.length, 'solutions') // FIXME: Display somewhere?
      draw(puzzle, 'test'+i)
    } catch (e) {
      document.getElementById('test'+i).innerHTML = e.stack
      continue
    }
  }
  var end = (new Date()).getTime()
  document.getElementById('load').innerHTML = (end - start)/1000 + ' seconds'
}