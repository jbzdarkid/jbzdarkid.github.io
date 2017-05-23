var tests = [
  function() {
    return {'grid':_newGrid(2, 2), 'start':{'x':4, 'y':4}, 'end':{'x':2, 'y':0}}
  }, function() {
    return {'grid':_newGrid(2, 2), 'start':{'x':0, 'y':4}, 'end':{'x':4, 'y':2}}
  }, function() {
    return {'grid':_newGrid(2, 2), 'start':{'x':0, 'y':0}, 'end':{'x':2, 'y':4}}
  }, function() {
    return {'grid':_newGrid(2, 2), 'start':{'x':4, 'y':0}, 'end':{'x':0, 'y':2}}
  }, function() {
    var grid = _newGrid(3, 3)
    grid[1][3] = {'type':'nega', 'color':'white'}
    return {'grid':grid, 'dots':[{'x':1, 'y':2}, {'x':1,'y':4}, {'x':0, 'y':3}, {'x':2,'y':3}, ]}
  }, function() {
    var grid = _newGrid(1, 3)
    grid[1][1] = {'type':'nega', 'color':'white'}
    grid[1][3] = {'type':'square', 'color':'red'}
    grid[1][5] = {'type':'square', 'color':'blue'}
    return {'grid':grid}
  }, function() {
    var grid = _newGrid(3, 3)
    grid[1][5] = {'type':'nega', 'color':'white'}
    grid[5][5] = {'type':'nega', 'color':'white'}
    grid[1][1] = {'type':'square', 'color':'red'}
    grid[1][3] = {'type':'square', 'color':'blue'}
    grid[5][3] = {'type':'poly', 'color': 'yellow', 'size':1, 'shape':'O', 'rot':0}
    return {'grid':grid}
  }, function () {
    var grid = _newGrid(3, 3)
    grid[1][1] = {'type':'nega', 'color':'white'}
    grid[1][3] = {'type':'nega', 'color':'white'}
    grid[3][1] = {'type':'square', 'color':'red'}
    grid[3][3] = {'type':'square', 'color':'blue'}
    grid[3][5] = {'type':'square', 'color':'blue'}
    return {'grid':grid}
  }, function () {
    var grid = _newGrid(3, 3)
    grid[1][1] = {'type':'nega', 'color':'white'}
    grid[1][3] = {'type':'nega', 'color':'white'}
    grid[3][1] = {'type':'square', 'color':'red'}
    grid[3][3] = {'type':'square', 'color':'blue'}
    grid[3][5] = {'type':'square', 'color':'blue'}
    return {'grid':grid, 'dots':[{'x':2, 'y':2}]}
  }, function () {
    var grid = _newGrid(3, 3)
    grid[1][1] = {'type':'poly','color':'yellow','size':1,'shape':'O','rot':0}
    grid[1][3] = {'type':'poly','color':'yellow','size':2,'shape':'I','rot':1}
    return {'grid':grid}
  }, function () {
    var grid = _newGrid(3, 3)
    grid[1][5] = {'type':'poly','color':'yellow','size':3,'shape':'I','rot':1}
    grid[3][3] = {'type':'poly','color':'yellow','size':3,'shape':'L','rot':3}
    return {'grid':grid}
  }, function () {
    var grid = _newGrid(3, 3)
    grid[1][1] = {'type':'nega', 'color':'white'}
    grid[1][3] = {'type':'poly','color':'yellow','size':3,'shape':'L','rot':0}
    grid[3][1] = {'type':'poly','color':'yellow','size':3,'shape':'L','rot':1}
    return {'grid':grid}
  }, function () {
    var grid = _newGrid(2, 2)
    grid[1][1] = {'type':'star', 'color':'red'}
    grid[1][3] = {'type':'star', 'color':'blue'}
    grid[3][1] = {'type':'star', 'color':'red'}
    grid[3][3] = {'type':'star', 'color':'blue'}
    return {'grid':grid}
  }, function () {
    var grid = _newGrid(2, 2)
    grid[1][1] = {'type':'star', 'color':'red'}
    grid[1][3] = {'type':'square', 'color':'red'}
    grid[3][1] = {'type':'square', 'color':'red'}
    grid[3][3] = {'type':'star', 'color':'red'}
    return {'grid':grid}
  }, function () {
    var grid = _newGrid(2, 2)
    grid[1][1] = {'type':'star', 'color':'red'}
    grid[1][3] = {'type':'poly','color':'red'   ,'size':2,'shape':'I','rot':1}
    return {'grid':grid}
  }, function() {
    var grid = _newGrid(2, 3)
    grid[1][1] = {'type':'poly','color':'yellow','size':3,'shape':'I','rot':1}
    grid[3][1] = {'type':'poly','color':'yellow','size':3,'shape':'I','rot':1}
    return {'grid':grid, 'start':{'x':2, 'y':2}}
  }, function() {
    var grid = _newGrid(2, 2)
    grid[1][1] = {'type':'square', 'color':'red'}
    grid[1][3] = {'type':'square', 'color':'blue'}
    grid[3][1] = {'type':'square', 'color':'blue'}
    grid[3][3] = {'type':'square', 'color':'red'}
    return {'grid':grid}
  }, function() {
    var grid = _newGrid(2, 2)
    var dots = [{'x':0, 'y':1}, {'x':0, 'y':3}, {'x':1, 'y':0}, {'x':3, 'y':0}]
    var gaps = [{'x':1, 'y':2}, {'x':2, 'y':1}, {'x':2, 'y':3}, {'x':3, 'y':2}]
    return {'grid':grid, 'dots':dots, 'gaps':gaps}
  }, function() {
    var grid = _newGrid(2, 2)
    grid[1][1] = {'type':'poly', 'color':'yellow', 'size':2, 'shape':'I', 'rot':0}
    grid[3][3] = {'type':'ylop', 'color':'blue', 'size':2, 'shape':'I', 'rot':0}
    return {'grid':grid}
  }, function() {
    var grid = _newGrid(2, 4)
    grid[3][1] = {'type':'poly','color':'yellow','size':4,'shape':'J','rot':1}
    grid[3][3] = {'type':'ylop','color':'blue'  ,'size':4,'shape':'O','rot':0}
    grid[3][7] = {'type':'poly','color':'yellow','size':4,'shape':'L','rot':3}
    return {'grid':grid}
  }, function() {
    var grid = _newGrid(1, 3)
    grid[1][1] = {'type':'poly','color':'yellow','size':1,'shape':'O','rot':0}
    grid[1][3] = {'type':'ylop','color':'blue'  ,'size':2,'shape':'I','rot':1}
    grid[1][5] = {'type':'poly','color':'yellow','size':1,'shape':'O','rot':0}
    return {'grid':grid}
  }, function() {
    var grid = _newGrid(4, 4)
    grid[1][1] = {'type':'poly','color':'yellow','size':4,'shape':'O','rot':0}
    grid[1][7] = {'type':'poly','color':'yellow','size':1,'shape':'O','rot':0}
    grid[3][3] = {'type':'ylop','color':'blue'  ,'size':1,'shape':'O','rot':0}
    grid[3][5] = {'type':'poly','color':'yellow','size':1,'shape':'O','rot':0}
    grid[3][7] = {'type':'poly','color':'yellow','size':1,'shape':'O','rot':0}
    grid[5][3] = {'type':'ylop','color':'blue'  ,'size':1,'shape':'O','rot':0}
    grid[5][5] = {'type':'ylop','color':'blue'  ,'size':1,'shape':'O','rot':0}
    grid[7][1] = {'type':'poly','color':'yellow','size':3,'shape':'L','rot':3}
    grid[7][7] = {'type':'poly','color':'yellow','size':4,'shape':'O','rot':0}
    return {'grid':grid, 'gaps':[{'x':4, 'y':5}]}
  }, function() {
    var grid = _newGrid(2, 2)
    grid[1][1] = {'type':'poly','color':'yellow','size':3,'shape':'L','rot':'all'}
    return {'grid':grid}
  }, function() {
    var grid = _newGrid(2, 2)
    grid[1][1] = {'type':'star', 'color':'red'}
    grid[3][3] = {'type':'nega', 'color':'white'}
    return {'grid':grid}
  }, function() {
    var grid = _newGrid(2, 2)
    grid[1][1] = {'type':'star', 'color':'red'}
    grid[3][3] = {'type':'nega', 'color':'red'}
    return {'grid':grid}
  }, function() {
    var grid = _newGrid(2, 2)
    grid[1][1] = {'type':'star', 'color':'red'}
    grid[1][3] = {'type':'star', 'color':'red'}
    grid[3][1] = {'type':'star', 'color':'red'}
    grid[3][3] = {'type':'nega', 'color':'red'}
    return {'grid':grid}
  }, function() {
    var grid = _newGrid(1, 5)
    grid[1][1] = {'type':'tri', 'color':'orange', 'count':1}
    grid[1][5] = {'type':'tri', 'color':'orange', 'count':2}
    grid[1][9] = {'type':'tri', 'color':'orange', 'count':3}
    return {'grid':grid}
  }
]

window.onload = function() {
  for (var i=0; i<tests.length; i++) {
    try {
      var solutions = []
      var puzzle = tests[i]()
      if (puzzle['start'] == undefined) {
        puzzle['start'] = {'x':puzzle.grid.length-1, 'y':0}
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
      console.log('Solving', puzzle)
      solve(puzzle, puzzle.start, solutions)
      console.log('Found', solutions.length, 'solutions') // FIXME: Display somewhere?
      draw(puzzle, 'test'+i)
    } catch (e) {
      document.getElementById('test'+i).innerHTML = e.stack || 'ERROR: '+e
      continue
    }
  }
}
