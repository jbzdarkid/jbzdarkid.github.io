window.DISABLE_CACHE = true

window.onload = function() {
  recolor()
  var table = document.getElementById('meta')
  for (var i=0; i<tests.length; i+=3) {
    var row = table.insertRow()
    for (var j=i; j<i+3 && j < tests.length; j++) {
      var cell = row.insertCell()
      var puzzle = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      puzzle.id = 'test'+j
      cell.appendChild(puzzle)

      try {
        var solutions = []
        var puzzleData = tests[j]()
        solve(puzzleData.puzzle, puzzleData.puzzle.start.x, puzzleData.puzzle.start.y, solutions)
        draw(puzzleData.puzzle, 'test'+j)
        if (solutions.length != puzzleData.solutions) {
          console.log('Puzzle', j, 'has', solutions.length, 'solutions, should have', puzzleData.solutions)
          for (var solution of solutions) {
            console.log(solution.toString())
          }
          var border = document.getElementById('test'+j).firstChild
          border.setAttribute('stroke', 'red')
        }
      } catch (e) {
        document.getElementById('test'+j).parentElement.innerHTML = e.stack || 'ERROR: '+e
      }
    }
  }
}

tests = [
  function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.start = {'x':4, 'y':4}
    puzzle.end   = {'x':0, 'y':2}
    return {'puzzle':puzzle, 'solutions':10}
  }, function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.start = {'x':4, 'y':0}
    puzzle.end   = {'x':2, 'y':4}
    return {'puzzle':puzzle, 'solutions':10}
  }, function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.start = {'x':0, 'y':0}
    puzzle.end   = {'x':4, 'y':2}
    return {'puzzle':puzzle, 'solutions':10}
  }, function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.start = {'x':0, 'y':4}
    puzzle.end   = {'x':2, 'y':0}
    return {'puzzle':puzzle, 'solutions':10}
  }, function() {
    var puzzle = new Puzzle(3, 3)
    puzzle.grid[3][1] = {'type':'nega', 'color':'white'}
    puzzle.dots = [
      {'x':2, 'y':1},
      {'x':4, 'y':1},
      {'x':3, 'y':0},
      {'x':3, 'y':2}
    ]
    return {'puzzle':puzzle, 'solutions':0}
  }, function() {
    var puzzle = new Puzzle(3, 1)
    puzzle.grid[1][1] = {'type':'nega', 'color':'white'}
    puzzle.grid[3][1] = {'type':'square', 'color':'red'}
    puzzle.grid[5][1] = {'type':'square', 'color':'blue'}
    return {'puzzle':puzzle, 'solutions':2}
  }, function() {
    var puzzle = new Puzzle(3, 3)
    puzzle.grid[5][1] = {'type':'nega', 'color':'white'}
    puzzle.grid[5][5] = {'type':'nega', 'color':'white'}
    puzzle.grid[1][1] = {'type':'square', 'color':'red'}
    puzzle.grid[3][1] = {'type':'square', 'color':'blue'}
    puzzle.grid[3][5] = {'type':'poly', 'color': 'yellow', 'polyshape':1}
    return {'puzzle':puzzle, 'solutions':41}
  }, function() {
    var puzzle = new Puzzle(3, 3)
    puzzle.grid[1][1] = {'type':'nega', 'color':'white'}
    puzzle.grid[3][1] = {'type':'nega', 'color':'white'}
    puzzle.grid[1][3] = {'type':'square', 'color':'red'}
    puzzle.grid[3][3] = {'type':'square', 'color':'blue'}
    puzzle.grid[5][3] = {'type':'square', 'color':'blue'}
    return {'puzzle':puzzle, 'solutions':62}
  }, function() {
    var puzzle = new Puzzle(3, 3)
    puzzle.grid[1][1] = {'type':'nega', 'color':'white'}
    puzzle.grid[3][1] = {'type':'nega', 'color':'white'}
    puzzle.grid[1][3] = {'type':'square', 'color':'red'}
    puzzle.grid[3][3] = {'type':'square', 'color':'blue'}
    puzzle.grid[5][3] = {'type':'square', 'color':'blue'}
    puzzle.dots = [{'x':2, 'y':2}]
    return {'puzzle':puzzle, 'solutions':38}
  }, function() {
    var puzzle = new Puzzle(3, 3)
    puzzle.grid[1][1] = {'type':'poly', 'color':'yellow', 'polyshape':1}
    puzzle.grid[3][1] = {'type':'poly', 'color':'yellow', 'polyshape':17}
    return {'puzzle':puzzle, 'solutions':14}
  }, function() {
    var puzzle = new Puzzle(3, 3)
    puzzle.grid[5][1] = {'type':'poly', 'color':'yellow', 'polyshape':273}
    puzzle.grid[3][3] = {'type':'poly', 'color':'yellow', 'polyshape':50}
    return {'puzzle':puzzle, 'solutions':1}
  }, function() {
    var puzzle = new Puzzle(3, 3)
    puzzle.grid[1][1] = {'type':'nega', 'color':'white'}
    puzzle.grid[1][3] = {'type':'poly', 'color':'yellow', 'polyshape':19}
    puzzle.grid[3][1] = {'type':'poly', 'color':'yellow', 'polyshape':35}
    return {'puzzle':puzzle, 'solutions':5}
  }, function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.grid[1][1] = {'type':'star', 'color':'red'}
    puzzle.grid[1][3] = {'type':'star', 'color':'red'}
    puzzle.grid[3][1] = {'type':'star', 'color':'blue'}
    puzzle.grid[3][3] = {'type':'star', 'color':'blue'}
    return {'puzzle':puzzle, 'solutions':4}
  }, function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.grid[1][1] = {'type':'star', 'color':'red'}
    puzzle.grid[1][3] = {'type':'square', 'color':'red'}
    puzzle.grid[3][1] = {'type':'square', 'color':'red'}
    puzzle.grid[3][3] = {'type':'star', 'color':'red'}
    return {'puzzle':puzzle, 'solutions':4}
  }, function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.grid[1][1] = {'type':'star', 'color':'red'}
    puzzle.grid[3][1] = {'type':'poly', 'color':'red', 'polyshape':17}
    return {'puzzle':puzzle, 'solutions':2}
  }, function() {
    var puzzle = new Puzzle(3, 2)
    puzzle.grid[1][1] = {'type':'poly', 'color':'yellow', 'polyshape':273}
    puzzle.grid[1][3] = {'type':'poly', 'color':'yellow', 'polyshape':273}
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
    puzzle.grid[1][1] = {'type':'poly', 'color':'yellow', 'polyshape':3}
    puzzle.grid[3][3] = {'type':'ylop', 'color':'blue', 'polyshape':3}
    return {'puzzle':puzzle, 'solutions':6}
  }, function() {
    var puzzle = new Puzzle(4, 2)
    puzzle.grid[1][3] = {'type':'poly', 'color':'yellow', 'polyshape':547}
    puzzle.grid[3][3] = {'type':'ylop', 'color':'blue'  , 'polyshape':51}
    puzzle.grid[7][3] = {'type':'poly', 'color':'yellow', 'polyshape':802}
    return {'puzzle':puzzle, 'solutions':2}
  }, function() {
    var puzzle = new Puzzle(3, 1)
    puzzle.grid[1][1] = {'type':'poly', 'color':'yellow', 'polyshape':1}
    puzzle.grid[3][1] = {'type':'ylop', 'color':'blue'  , 'polyshape':17}
    puzzle.grid[5][1] = {'type':'poly', 'color':'yellow', 'polyshape':1}
    return {'puzzle':puzzle, 'solutions':2}
  }, function() {
    var puzzle = new Puzzle(4, 4)
    puzzle.grid[1][1] = {'type':'poly', 'color':'yellow', 'polyshape':51}
    puzzle.grid[7][1] = {'type':'poly', 'color':'yellow', 'polyshape':1}
    puzzle.grid[3][3] = {'type':'ylop', 'color':'blue'  , 'polyshape':1}
    puzzle.grid[5][3] = {'type':'poly', 'color':'yellow', 'polyshape':1}
    puzzle.grid[7][3] = {'type':'poly', 'color':'yellow', 'polyshape':1}
    puzzle.grid[3][5] = {'type':'ylop', 'color':'blue'  , 'polyshape':1}
    puzzle.grid[5][5] = {'type':'ylop', 'color':'blue'  , 'polyshape':1}
    puzzle.grid[1][7] = {'type':'poly', 'color':'yellow', 'polyshape':50}
    puzzle.grid[7][7] = {'type':'poly', 'color':'yellow', 'polyshape':51}
    puzzle.gaps = [{'x':5, 'y':4}]
    return {'puzzle':puzzle, 'solutions':17}
  }, function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.grid[1][1] = {'type':'poly', 'color':'yellow', 'polyshape':35, 'rot':'all'}
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
    var puzzle = new Puzzle(5, 1)
    puzzle.grid[1][1] = {'type':'triangle', 'color':'orange', 'count':1}
    puzzle.grid[5][1] = {'type':'triangle', 'color':'orange', 'count':2}
    puzzle.grid[9][1] = {'type':'triangle', 'color':'orange', 'count':3}
    return {'puzzle':puzzle, 'solutions':2}
  }, function() {
    var puzzle = new Puzzle(3, 3)
    puzzle.grid[1][1] = {'type':'nega', 'color':'white'}
    puzzle.grid[3][3] = {'type':'nega', 'color':'white'}
    puzzle.grid[5][5] = {'type':'nega', 'color':'white'}
    return {'puzzle':puzzle, 'solutions':0}
  }, function() {
    var puzzle = new Puzzle(2, 1, true)
    puzzle.gaps = [
      {'x':1, 'y':0},
      {'x':1, 'y':2}
    ]
    puzzle.end = {'x':2, 'y':0}
    puzzle.start = {'x':0, 'y':2}
    return {'puzzle':puzzle, 'solutions':2}
  }, function() {
    var puzzle = new Puzzle(2, 1, true)
    puzzle.grid[1][1] = {'type':'square', 'color':'white'}
    puzzle.grid[3][1] = {'type':'square', 'color':'black'}
    puzzle.start = {'x':2, 'y':2}
    puzzle.end = {'x':2, 'y':0}
    return {'puzzle':puzzle, 'solutions':0}
  }, function() {
    var puzzle = new Puzzle(2, 2, true)
    puzzle.grid[1][1] = {'type':'poly', 'color':'yellow', 'polyshape':49}
    puzzle.start = {'x':2, 'y':4}
    puzzle.end = {'x':2, 'y':0}
    return {'puzzle':puzzle, 'solutions':0}
  }, function() {
    var puzzle = new Puzzle(2, 1, true)
    puzzle.grid[1][1] = {'type':'star', 'color':'orange'}
    puzzle.grid[3][1] = {'type':'star', 'color':'orange'}
    puzzle.start = {'x':2, 'y':2}
    puzzle.end = {'x':2, 'y':0}
    return {'puzzle':puzzle, 'solutions':5}
  }, function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.grid[1][1] = {'type':'star', 'color':'red'}
    puzzle.grid[1][3] = {'type':'nega', 'color':'red'}
    puzzle.grid[3][3] = {'type':'nega', 'color':'red'}
    return {'puzzle':puzzle, 'solutions':0}
  }, function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.grid[1][1] = {'type':'nega', 'color':'white'}
    puzzle.grid[1][3] = {'type':'square', 'color':'red'}
    puzzle.grid[3][1] = {'type':'square', 'color':'blue'}
    puzzle.grid[3][3] = {'type':'square', 'color':'red'}
    return {'puzzle':puzzle, 'solutions':5}
  }, function() {
    var puzzle = new Puzzle(3, 2)
    puzzle.grid[1][1] = {'type':'nega', 'color':'white'}
    puzzle.grid[3][1] = {'type':'square', 'color':'blue'}
    puzzle.grid[5][1] = {'type':'star', 'color':'blue'}
    puzzle.grid[3][3] = {'type':'square', 'color':'red'}
    puzzle.grid[5][3] = {'type':'square', 'color':'red'}
    return {'puzzle':puzzle, 'solutions':6}
  }, function() {
    var puzzle = new Puzzle(3, 2)
    puzzle.grid[1][1] = {'type':'nega', 'color':'white'}
    puzzle.grid[3][1] = {'type':'square', 'color':'blue'}
    puzzle.grid[5][1] = {'type':'star', 'color':'blue'}
    puzzle.grid[1][3] = {'type':'nega', 'color':'white'}
    puzzle.grid[3][3] = {'type':'square', 'color':'red'}
    puzzle.grid[5][3] = {'type':'square', 'color':'red'}
    return {'puzzle':puzzle, 'solutions':7}
  }, function() {
    var puzzle = new Puzzle(1, 1)
    puzzle.grid[1][1] = {'type':'poly', 'polyshape':0}
    return {'puzzle':puzzle, 'solutions':2}
  }, function() {
    var puzzle = new Puzzle(1, 1)
    puzzle.grid[1][1] = {'type':'ylop', 'polyshape':0}
    return {'puzzle':puzzle, 'solutions':2}
  }, function() {
    var puzzle = new Puzzle(0, 3)
    return {'puzzle':puzzle, 'solutions':1}
  }, function() {
    var puzzle = new Puzzle(3, 0)
    return {'puzzle':puzzle, 'solutions':1}
  }, function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.grid[1][1] = {'type':'star', 'color':'black'}
    puzzle.grid[1][3] = {'type':'nega', 'color':'black'}
    puzzle.grid[3][1] = {'type':'square', 'color':'white'}
    puzzle.grid[3][3] = {'type':'star', 'color':'black'}
    return {'puzzle':puzzle, 'solutions':0}
  }, function() {
    var puzzle = Puzzle.deserialize('{"grid":[[false,false,false,false,false,false,false,false,false],[false,false,false,false,false,{"type":"star"},false,{"type":"nega"},false],[false,false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,{"type":"star"},false],[false,false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false,false]],"start":{"x":0,"y":8},"end":{"x":8,"y":0,"dir":"right"},"dots":[],"gaps":[],"regionCache":{},"pillar":false,"name":"Unnamed Puzzle"}')
    return {'puzzle':puzzle, 'solutions':0}
  }, function() {
    var puzzle = Puzzle.deserialize('{"grid":[[false,false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false,false],[false,{"type":"square"},false,{"type":"square"},false,{"type":"square"},false,{"type":"square"},false],[false,false,false,false,false,false,false,false,false],[false,{"type":"square","color":"white"},false,{"type":"square","color":"white"},false,{"type":"square","color":"white"},false,{"type":"square","color":"white"},false],[false,false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false,false]],"start":{"x":0,"y":8},"end":{"x":0,"y":0,"dir":"top"},"dots":[],"gaps":[],"regionCache":{},"pillar":true,"name":"Unnamed Puzzle","valid":0,"negations":[]}')
    return {'puzzle':puzzle, 'solutions':0}
  }
]
