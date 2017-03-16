var tests = [
  function() {
    var grid = _newGrid(3, 7)
    grid[1][1] = {'type':'nega', 'color':'white'}
    grid[1][3] = {'type':'square', 'color':'red'}
    grid[1][5] = {'type':'square', 'color':'blue'}
    return grid
  }, function() {
    var grid = _newGrid(7, 7)
    grid[1][5] = {'type':'nega', 'color':'white'}
    grid[5][5] = {'type':'nega', 'color':'white'}
    grid[1][1] = {'type':'square', 'color':'red'}
    grid[1][3] = {'type':'square', 'color':'blue'}
    grid[5][3] = {'type':'poly', 'shape':'1.0.0', 'color':'yellow'}
    return grid
  }, function () {
    var grid = _newGrid(7, 7)
    grid[1][1] = {'type':'nega', 'color':'white'}
    grid[1][3] = {'type':'nega', 'color':'white'}
    grid[3][1] = {'type':'square', 'color':'red'}
    grid[3][3] = {'type':'square', 'color':'blue'}
    grid[3][5] = {'type':'square', 'color':'blue'}
    return grid
  }, function () {
    var grid = _newGrid(7, 7)
    grid[1][1] = {'type':'nega', 'color':'white'}
    grid[1][3] = {'type':'nega', 'color':'white'}
    grid[3][1] = {'type':'square', 'color':'red'}
    grid[3][3] = {'type':'square', 'color':'blue'}
    grid[3][5] = {'type':'square', 'color':'blue'}
    return grid
  }, function () {
    var grid = _newGrid(7, 7)
    grid[1][1] = {'type':'poly', 'shape':'1.0.0', 'color':'yellow'}
    grid[1][3] = {'type':'poly', 'shape':'2.0.0', 'color':'yellow'}
    return grid
  }, function () {
    var grid = _newGrid(7, 7)
    grid[1][5] = {'type':'poly', 'shape':'3.0.0', 'color':'yellow'}
    grid[3][3] = {'type':'poly', 'shape':'3.1.1', 'color':'yellow'}
    return grid
  }, function () {
    var grid = _newGrid(7, 7)
    grid[1][1] = {'type':'nega', 'color':'white'}
    grid[1][3] = {'type':'poly', 'shape':'3.1.2', 'color':'yellow'}
    grid[3][1] = {'type':'poly', 'shape':'3.1.3', 'color':'yellow'}
    return grid
  }, function () {
    var grid = _newGrid(5, 5)
    grid[1][1] = {'type':'star', 'color':'red'}
    grid[1][3] = {'type':'star', 'color':'blue'}
    grid[3][1] = {'type':'star', 'color':'red'}
    grid[3][3] = {'type':'star', 'color':'blue'}
    return grid
  }, function () {
    var grid = _newGrid(5, 5)
    grid[1][1] = {'type':'star', 'color':'red'}
    grid[1][3] = {'type':'square', 'color':'red'}
    grid[3][1] = {'type':'square', 'color':'red'}
    grid[3][3] = {'type':'star', 'color':'red'}
    return grid
  }, function () {
    var grid = _newGrid(5, 5)
    grid[1][1] = {'type':'star', 'color':'red'}
    grid[1][3] = {'type':'poly', 'shape':'2.0.0', 'color':'red'}
    return grid
  }, function() {
    var grid = _newGrid(5, 7)
    grid[1][1] = {'type':'poly', 'shape':'3.0.0', 'color':'yellow'}
    grid[3][1] = {'type':'poly', 'shape':'3.0.0', 'color':'yellow'}
    return grid
  }, function() {
    var grid = _newGrid(5, 5)
    grid[1][1] = {'type':'square', 'color':'red'}
    grid[1][3] = {'type':'square', 'color':'blue'}
    grid[3][1] = {'type':'square', 'color':'blue'}
    grid[3][3] = {'type':'square', 'color':'red'}
    return grid
  }, function() {
    return [[2,1,2,1,2,1,2,1,1],[1,0,0,0,0,0,0,{"type":"nega","color":"white"},0],[2,0,2,1,2,1,2,0,0],[1,0,1,{"type":"square","color":"red"},0,0,1,0,0],[2,0,2,1,2,0,2,0,0],[1,{"type":"poly","shape":"3.1.3","color":"yellow"},0,{"type":"square","color":"blue"},1,{"type":"poly","shape":"3.0.0","color":"yellow"},1,0,0],[2,1,2,1,2,0,2,0,0],[0,{"type":"square","color":"red"},0,0,0,{"type":"poly","shape":"3.1.0","color":"yellow"},1,{"type":"star","color":"blue"},0],[1,1,2,1,2,1,2,0,0]]
  }, function() {
    return [[0,0,2,1,2,1,2,1,1],[0,{"type":"poly","shape":"3.0.0","color":"yellow"},1,0,0,0,0,0,0],[0,0,2,0,2,1,2,0,0],[0,{"type":"poly","shape":"3.0.1","color":"yellow"},1,0,1,0,1,0,0],[0,0,2,0,2,0,2,1,2],[0,0,1,0,1,0,0,0,1],[0,0,2,1,2,0,2,1,2],[0,{"type":"poly","shape":"3.1.2","color":"yellow"},0,0,0,0,1,{"type":"square","color":"red"},0],[1,1,2,1,2,1,2,0,0]]
  }
]

function loadTests() {
  var start = (new Date()).getTime()
  for (var i=0; i<tests.length; i++) {
    try {
      var solutions = []
      var puzzle = {'grid':tests[i]()}
      puzzle['start'] = {'x':puzzle.grid.length-1, 'y':0}
      puzzle['end'] = {'x':0, 'y':puzzle.grid[0].length-1}
      console.log(puzzle)
      puzzle['dots'] = []
      solve(puzzle, puzzle.start, solutions)
      draw(puzzle, 'test'+i)
    } catch (e) {
      document.getElementById('test'+i).innerHTML = e.stack
      continue
    }
  }
  var end = (new Date()).getTime()
  document.getElementById('load').innerHTML = (end - start)/1000 + ' seconds'
}