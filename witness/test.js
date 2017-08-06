var tests = [
  function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.start = {'x':4, 'y':4}
    puzzle.end   = {'x':2, 'y':0}
    return {'puzzle':puzzle, 'solutions':10}
  }, function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.start = {'x':0, 'y':4}
    puzzle.end   = {'x':4, 'y':2}
    return {'puzzle':puzzle, 'solutions':10}
  }, function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.start = {'x':0, 'y':0}
    puzzle.end   = {'x':2, 'y':4}
    return {'puzzle':puzzle, 'solutions':10}
  }, function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.start = {'x':4, 'y':0}
    puzzle.end   = {'x':0, 'y':2}
    return {'puzzle':puzzle, 'solutions':10}
  }, function() {
    var puzzle = new Puzzle(3, 3)
    puzzle.grid[1][3] = {'type':'nega', 'color':'white'}
    puzzle.dots = [
      {'x':1, 'y':2},
      {'x':1, 'y':4}, 
      {'x':0, 'y':3},
      {'x':2, 'y':3}
    ]
    return {'puzzle':puzzle, 'solutions':0}
  }, function() {
    var puzzle = new Puzzle(1, 3)
    puzzle.grid[1][1] = {'type':'nega', 'color':'white'}
    puzzle.grid[1][3] = {'type':'square', 'color':'red'}
    puzzle.grid[1][5] = {'type':'square', 'color':'blue'}
    return {'puzzle':puzzle, 'solutions':2}
  }, function() {
    var puzzle = new Puzzle(3, 3)
    puzzle.grid[1][5] = {'type':'nega', 'color':'white'}
    puzzle.grid[5][5] = {'type':'nega', 'color':'white'}
    puzzle.grid[1][1] = {'type':'square', 'color':'red'}
    puzzle.grid[1][3] = {'type':'square', 'color':'blue'}
    puzzle.grid[5][3] = {'type':'poly', 'color': 'yellow', 'size':1, 'shape':'O', 'rot':0}
    return {'puzzle':puzzle, 'solutions':41}
  }, function () {
    var puzzle = new Puzzle(3, 3)
    puzzle.grid[1][1] = {'type':'nega', 'color':'white'}
    puzzle.grid[1][3] = {'type':'nega', 'color':'white'}
    puzzle.grid[3][1] = {'type':'square', 'color':'red'}
    puzzle.grid[3][3] = {'type':'square', 'color':'blue'}
    puzzle.grid[3][5] = {'type':'square', 'color':'blue'}
    return {'puzzle':puzzle, 'solutions':62}
  }, function () {
    var puzzle = new Puzzle(3, 3)
    puzzle.grid[1][1] = {'type':'nega', 'color':'white'}
    puzzle.grid[1][3] = {'type':'nega', 'color':'white'}
    puzzle.grid[3][1] = {'type':'square', 'color':'red'}
    puzzle.grid[3][3] = {'type':'square', 'color':'blue'}
    puzzle.grid[3][5] = {'type':'square', 'color':'blue'}
    puzzle.dots = [{'x':2, 'y':2}]
    return {'puzzle':puzzle, 'solutions':38}
  }, function () {
    var puzzle = new Puzzle(3, 3)
    puzzle.grid[1][1] = {'type':'poly', 'color':'yellow', 'size':1, 'shape':'O', 'rot':0}
    puzzle.grid[1][3] = {'type':'poly', 'color':'yellow', 'size':2, 'shape':'I', 'rot':1}
    return {'puzzle':puzzle, 'solutions':14}
  }, function () {
    var puzzle = new Puzzle(3, 3)
    puzzle.grid[1][5] = {'type':'poly', 'color':'yellow', 'size':3, 'shape':'I', 'rot':1}
    puzzle.grid[3][3] = {'type':'poly', 'color':'yellow', 'size':3, 'shape':'L', 'rot':3}
    return {'puzzle':puzzle, 'solutions':1}
  }, function () {
    var puzzle = new Puzzle(3, 3)
    puzzle.grid[1][1] = {'type':'nega', 'color':'white'}
    puzzle.grid[1][3] = {'type':'poly', 'color':'yellow', 'size':3, 'shape':'L', 'rot':0}
    puzzle.grid[3][1] = {'type':'poly', 'color':'yellow', 'size':3, 'shape':'L', 'rot':1}
    return {'puzzle':puzzle, 'solutions':5}
  }, function () {
    var puzzle = new Puzzle(2, 2)
    puzzle.grid[1][1] = {'type':'star', 'color':'red'}
    puzzle.grid[1][3] = {'type':'star', 'color':'blue'}
    puzzle.grid[3][1] = {'type':'star', 'color':'red'}
    puzzle.grid[3][3] = {'type':'star', 'color':'blue'}
    return {'puzzle':puzzle, 'solutions':4}
  }, function () {
    var puzzle = new Puzzle(2, 2)
    puzzle.grid[1][1] = {'type':'star', 'color':'red'}
    puzzle.grid[1][3] = {'type':'square', 'color':'red'}
    puzzle.grid[3][1] = {'type':'square', 'color':'red'}
    puzzle.grid[3][3] = {'type':'star', 'color':'red'}
    return {'puzzle':puzzle, 'solutions':4}
  }, function () {
    var puzzle = new Puzzle(2, 2)
    puzzle.grid[1][1] = {'type':'star', 'color':'red'}
    puzzle.grid[1][3] = {'type':'poly', 'color':'red'   , 'size':2, 'shape':'I', 'rot':1}
    return {'puzzle':puzzle, 'solutions':2}
  }, function() {
    var puzzle = new Puzzle(2, 3)
    puzzle.grid[1][1] = {'type':'poly', 'color':'yellow', 'size':3, 'shape':'I', 'rot':1}
    puzzle.grid[3][1] = {'type':'poly', 'color':'yellow', 'size':3, 'shape':'I', 'rot':1}
    puzzle.start = {'x':2, 'y':2}
    return {'puzzle':puzzle, 'solutions':12}
  }, function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.grid[1][1] = {'type':'square', 'color':'red'}
    puzzle.grid[1][3] = {'type':'square', 'color':'blue'}
    puzzle.grid[3][1] = {'type':'square', 'color':'blue'}
    puzzle.grid[3][3] = {'type':'square', 'color':'red'}
    return {'puzzle':puzzle, 'solutions':0}
  }, function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.dots = [
      {'x':0, 'y':1},
      {'x':0, 'y':3},
      {'x':1, 'y':0},
      {'x':3, 'y':0}
    ]
    puzzle.gaps = [
      {'x':1, 'y':2},
      {'x':2, 'y':1},
      {'x':2, 'y':3},
      {'x':3, 'y':2}
    ]
    return {'puzzle':puzzle, 'solutions':1}
  }, function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.grid[1][1] = {'type':'poly', 'color':'yellow', 'size':2, 'shape':'I', 'rot':0}
    puzzle.grid[3][3] = {'type':'ylop', 'color':'blue', 'size':2, 'shape':'I', 'rot':0}
    return {'puzzle':puzzle, 'solutions':6}
  }, function() {
    var puzzle = new Puzzle(2, 4)
    puzzle.grid[3][1] = {'type':'poly', 'color':'yellow', 'size':4, 'shape':'J', 'rot':1}
    puzzle.grid[3][3] = {'type':'ylop', 'color':'blue'  , 'size':4, 'shape':'O', 'rot':0}
    puzzle.grid[3][7] = {'type':'poly', 'color':'yellow', 'size':4, 'shape':'L', 'rot':3}
    return {'puzzle':puzzle, 'solutions':2}
  }, function() {
    var puzzle = new Puzzle(1, 3)
    puzzle.grid[1][1] = {'type':'poly', 'color':'yellow', 'size':1, 'shape':'O', 'rot':0}
    puzzle.grid[1][3] = {'type':'ylop', 'color':'blue'  , 'size':2, 'shape':'I', 'rot':1}
    puzzle.grid[1][5] = {'type':'poly', 'color':'yellow', 'size':1, 'shape':'O', 'rot':0}
    return {'puzzle':puzzle, 'solutions':2}
  }, function() {
    var puzzle = new Puzzle(4, 4)
    puzzle.grid[1][1] = {'type':'poly', 'color':'yellow', 'size':4, 'shape':'O', 'rot':0}
    puzzle.grid[1][7] = {'type':'poly', 'color':'yellow', 'size':1, 'shape':'O', 'rot':0}
    puzzle.grid[3][3] = {'type':'ylop', 'color':'blue'  , 'size':1, 'shape':'O', 'rot':0}
    puzzle.grid[3][5] = {'type':'poly', 'color':'yellow', 'size':1, 'shape':'O', 'rot':0}
    puzzle.grid[3][7] = {'type':'poly', 'color':'yellow', 'size':1, 'shape':'O', 'rot':0}
    puzzle.grid[5][3] = {'type':'ylop', 'color':'blue'  , 'size':1, 'shape':'O', 'rot':0}
    puzzle.grid[5][5] = {'type':'ylop', 'color':'blue'  , 'size':1, 'shape':'O', 'rot':0}
    puzzle.grid[7][1] = {'type':'poly', 'color':'yellow', 'size':3, 'shape':'L', 'rot':3}
    puzzle.grid[7][7] = {'type':'poly', 'color':'yellow', 'size':4, 'shape':'O', 'rot':0}
    puzzle.gaps = [{'x':4, 'y':5}]
    return {'puzzle':puzzle, 'solutions':17}
  }, function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.grid[1][1] = {'type':'poly', 'color':'yellow', 'size':3, 'shape':'L', 'rot':'all'}
    return {'puzzle':puzzle, 'solutions':5}
  }, function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.grid[1][1] = {'type':'star', 'color':'red'}
    puzzle.grid[3][3] = {'type':'nega', 'color':'white'}
    return {'puzzle':puzzle, 'solutions':6}
  }, function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.grid[1][1] = {'type':'star', 'color':'red'}
    puzzle.grid[3][3] = {'type':'nega', 'color':'red'}
    return {'puzzle':puzzle, 'solutions':0}
  }, function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.grid[1][1] = {'type':'star', 'color':'red'}
    puzzle.grid[1][3] = {'type':'star', 'color':'red'}
    puzzle.grid[3][1] = {'type':'star', 'color':'red'}
    puzzle.grid[3][3] = {'type':'nega', 'color':'red'}
    return {'puzzle':puzzle, 'solutions':2}
  }, function() {
    var puzzle = new Puzzle(1, 5)
    puzzle.grid[1][1] = {'type':'triangle', 'color':'orange', 'count':1}
    puzzle.grid[1][5] = {'type':'triangle', 'color':'orange', 'count':2}
    puzzle.grid[1][9] = {'type':'triangle', 'color':'orange', 'count':3}
    return {'puzzle':puzzle, 'solutions':2}
  }, function() {
    var puzzle = new Puzzle(3, 3)
    puzzle.grid[1][1] = {'type':'nega', 'color':'white'}
    puzzle.grid[3][3] = {'type':'nega', 'color':'white'}
    puzzle.grid[5][5] = {'type':'nega', 'color':'white'}
    return {'puzzle':puzzle, 'solutions':0}
  }
]

window.onload = function() {
  for (var i=0; i<tests.length; i++) {
    try {
      var solutions = []
      var puzzleData = tests[i]()
      solve(puzzleData.puzzle, puzzleData.puzzle.start, solutions)
      if (solutions.length != puzzleData.solutions) {
        document.getElementById('test'+i).parentElement.bgColor = 'red'
      }
      draw(puzzleData.puzzle, 'test'+i)
    } catch (e) {
      document.getElementById('test'+i).innerHTML = e.stack || 'ERROR: '+e
      continue
    }
  }
}
