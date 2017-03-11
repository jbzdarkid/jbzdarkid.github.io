function newGrid(width, height) {
  var grid = []
  for (var i=0; i<width; i++) {
    grid[i] = []
    for (var j=0; j<height; j++) {
      grid[i][j] = 0
    }
  }
  return grid
}

var tests = [
  function() {
    var grid = newGrid(3, 7)
    grid[1][1] = {'type':'nega', 'color':'white'}
    grid[1][3] = {'type':'square', 'color':'red'}
    grid[1][5] = {'type':'square', 'color':'blue'}
    return {'grid':grid,'start':{'x':2,'y':0},'end':{'x':2,'y':6},'dots':[]}
  }, function() {
    var grid = newGrid(7, 7)
    grid[1][5] = {'type':'nega', 'color':'white'}
    grid[5][5] = {'type':'nega', 'color':'white'}
    grid[1][1] = {'type':'square', 'color':'red'}
    grid[1][3] = {'type':'square', 'color':'blue'}
    grid[5][3] = {'type':'poly', 'shape':'1.0.0', 'color':'yellow'}
    return {'grid':grid,'start':{'x':6,'y':0},'end':{'x':0,'y':0},'dots':[]}
  }, function () {
    var grid = newGrid(7, 7)
    grid[1][1] = {'type':'nega', 'color':'white'}
    grid[1][3] = {'type':'nega', 'color':'white'}
    grid[3][1] = {'type':'square', 'color':'red'}
    grid[3][3] = {'type':'square', 'color':'blue'}
    grid[3][5] = {'type':'square', 'color':'blue'}
    return {'grid':grid,'start':{'x':6,'y':0},'end':{'x':6,'y':6},'dots':[]}
  }, function () {
    var grid = newGrid(7, 7)
    grid[1][1] = {'type':'nega', 'color':'white'}
    grid[1][3] = {'type':'nega', 'color':'white'}
    grid[3][1] = {'type':'square', 'color':'red'}
    grid[3][3] = {'type':'square', 'color':'blue'}
    grid[3][5] = {'type':'square', 'color':'blue'}
    return {'grid':grid,'start':{'x':6,'y':0},'end':{'x':6,'y':6},'dots':[{'x':2,'y':2}]}
  }, function () {
    var grid = newGrid(7, 7)
    grid[1][1] = {'type':'poly', 'shape':'1.0.0', 'color':'yellow'}
    grid[1][3] = {'type':'poly', 'shape':'2.0.0', 'color':'yellow'}
    return {'grid':grid,'start':{'x':6,'y':0},'end':{'x':6,'y':6},'dots':[]}
  }, function () {
    var grid = newGrid(7, 7)
    grid[1][5] = {'type':'poly', 'shape':'3.0.0', 'color':'yellow'}
    grid[3][3] = {'type':'poly', 'shape':'3.1.1', 'color':'yellow'}
    return {'grid':grid,'start':{'x':6,'y':0},'end':{'x':6,'y':6},'dots':[]}
  }, function () {
    var grid = newGrid(7, 7)
    grid[1][1] = {'type':'nega', 'color':'white'}
    grid[1][3] = {'type':'poly', 'shape':'3.1.2', 'color':'yellow'}
    grid[3][1] = {'type':'poly', 'shape':'3.1.3', 'color':'yellow'}
    return {'grid':grid,'start':{'x':6,'y':0},'end':{'x':6,'y':6},'dots':[]}
  }, function () {
    var grid = newGrid(5, 5)
    grid[1][1] = {'type':'star', 'color':'red'}
    grid[1][3] = {'type':'star', 'color':'blue'}
    grid[3][1] = {'type':'star', 'color':'red'}
    grid[3][3] = {'type':'star', 'color':'blue'}
    return {'grid':grid,'start':{'x':4,'y':2},'end':{'x':0,'y':2},'dots':[]}
  }, function () {
    var grid = newGrid(5, 5)
    grid[1][1] = {'type':'star', 'color':'red'}
    grid[1][3] = {'type':'square', 'color':'red'}
    grid[3][1] = {'type':'square', 'color':'red'}
    grid[3][3] = {'type':'star', 'color':'red'}
    return {'grid':grid,'start':{'x':4,'y':2},'end':{'x':0,'y':2},'dots':[]}
  }, function () {
    var grid = newGrid(5, 5)
    grid[1][1] = {'type':'star', 'color':'red'}
    grid[1][3] = {'type':'poly', 'shape':'2.0.0', 'color':'red'}
    return {'grid':grid,'start':{'x':0,'y':0},'end':{'x':4,'y':4},'dots':[]}
  }, function() {
    var grid = newGrid(5, 7)
    grid[1][1] = {'type':'poly', 'shape':'3.0.0', 'color':'yellow'}
    grid[3][1] = {'type':'poly', 'shape':'3.0.0', 'color':'yellow'}
    return {'grid':grid,'start':{'x':2,'y':2},'end':{'x':0,'y':6},'dots':[]}
  }
]

function loadTests() {
  var start = (new Date()).getTime()
  for (var i=0; i<tests.length; i++) {
    try {
      var solutions = []
      var puzzle = tests[i]()
      solve(puzzle, puzzle.start, solutions)
      if (solutions.length > 0) {
        draw(solutions[0], 'test'+i)
      } else {
        draw(puzzle, 'test'+i)
      }
    } catch (e) {
      document.getElementById('test'+i).innerHTML = e.stack
      continue
    }
  }
  var end = (new Date()).getTime()
  document.getElementById('load').innerHTML = (end - start)/1000 + ' seconds'
}