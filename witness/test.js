window.DISABLE_CACHE = true

window.onload = function() {
  recolor()
  var table = document.getElementById('meta')
  for (var i=0; i<tests.length; i+=3) {
    var row = table.insertRow()
    for (var j=i; j<i+3 && j < tests.length; j++) {
      var cell = row.insertCell()
      var puzzleSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      puzzleSvg.id = 'test'+j
      cell.appendChild(puzzleSvg)

      try {
        var puzzleData = tests[j]()
        var puzzle = puzzleData[0]
        var expectedSolutions = puzzleData[1]
        var solutions = solve(puzzle)
        draw(puzzle, 'test'+j)
        if (solutions.length != expectedSolutions) {
          console.error('Puzzle', j, 'has', solutions.length, 'solutions, should have', expectedSolutions)
          for (var solution of solutions) {
            console.log(solution.toString())
          }
          var border = document.getElementById('test'+j).firstChild
          border.setAttribute('stroke', 'red')
        }
      } catch (e) {
        console.error('Puzzle', j, 'errored!')
        document.getElementById('test'+j).parentElement.innerHTML = e.stack || 'ERROR: '+e
      }
    }
  }
}

tests = [
  function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.addStart(4, 4)
    puzzle.addEnd(0, 2, 'left')
    return [puzzle, 10]
  }, function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.addStart(0, 0)
    puzzle.addEnd(4, 2, 'right')
    return [puzzle, 10]
  }, function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.addStart(0, 4)
    puzzle.addEnd(2, 0, 'top')
    return [puzzle, 10]
  }, function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.addStart(4, 0)
    puzzle.addEnd(2, 4, 'bottom')
    return [puzzle, 10]
  }, function() {
    var puzzle = new Puzzle(3, 3)
    puzzle.addStart(0, 6)
    puzzle.addEnd(6, 0, 'right')
    puzzle.grid[3][1] = {'type':'nega', 'color':'white'}
    puzzle.dots = [
      {'x':2, 'y':1},
      {'x':4, 'y':1},
      {'x':3, 'y':0},
      {'x':3, 'y':2}
    ]
    return [puzzle, 0]
  }, function() {
    var puzzle = new Puzzle(3, 1)
    puzzle.addStart(0, 2)
    puzzle.addEnd(6, 0, 'right')
    puzzle.grid[1][1] = {'type':'nega', 'color':'white'}
    puzzle.grid[3][1] = {'type':'square', 'color':'red'}
    puzzle.grid[5][1] = {'type':'square', 'color':'blue'}
    return [puzzle, 2]
  }, function() {
    var puzzle = new Puzzle(3, 3)
    puzzle.addStart(0, 6)
    puzzle.addEnd(6, 0, 'right')
    puzzle.grid[5][1] = {'type':'nega', 'color':'white'}
    puzzle.grid[5][5] = {'type':'nega', 'color':'white'}
    puzzle.grid[1][1] = {'type':'square', 'color':'red'}
    puzzle.grid[3][1] = {'type':'square', 'color':'blue'}
    puzzle.grid[3][5] = {'type':'poly', 'color': 'yellow', 'polyshape':1}
    return [puzzle, 41]
  }, function() {
    var puzzle = new Puzzle(3, 3)
    puzzle.addStart(0, 6)
    puzzle.addEnd(6, 0, 'right')
    puzzle.grid[1][1] = {'type':'nega', 'color':'white'}
    puzzle.grid[3][1] = {'type':'nega', 'color':'white'}
    puzzle.grid[1][3] = {'type':'square', 'color':'red'}
    puzzle.grid[3][3] = {'type':'square', 'color':'blue'}
    puzzle.grid[5][3] = {'type':'square', 'color':'blue'}
    return [puzzle, 62]
  }, function() {
    var puzzle = new Puzzle(3, 3)
    puzzle.addStart(0, 6)
    puzzle.addEnd(6, 0, 'right')
    puzzle.grid[1][1] = {'type':'nega', 'color':'white'}
    puzzle.grid[3][1] = {'type':'nega', 'color':'white'}
    puzzle.grid[1][3] = {'type':'square', 'color':'red'}
    puzzle.grid[3][3] = {'type':'square', 'color':'blue'}
    puzzle.grid[5][3] = {'type':'square', 'color':'blue'}
    puzzle.dots = [{'x':2, 'y':2}]
    return [puzzle, 38]
  }, function() {
    var puzzle = new Puzzle(3, 3)
    puzzle.addStart(0, 6)
    puzzle.addEnd(6, 0, 'right')
    puzzle.grid[1][1] = {'type':'poly', 'color':'yellow', 'polyshape':1}
    puzzle.grid[3][1] = {'type':'poly', 'color':'yellow', 'polyshape':17}
    return [puzzle, 14]
  }, function() {
    var puzzle = new Puzzle(3, 3)
    puzzle.addStart(0, 6)
    puzzle.addEnd(6, 0, 'right')
    puzzle.grid[5][1] = {'type':'poly', 'color':'yellow', 'polyshape':273}
    puzzle.grid[3][3] = {'type':'poly', 'color':'yellow', 'polyshape':50}
    return [puzzle, 1]
  }, function() {
    var puzzle = new Puzzle(3, 3)
    puzzle.addStart(0, 6)
    puzzle.addEnd(6, 0, 'right')
    puzzle.grid[1][1] = {'type':'nega', 'color':'white'}
    puzzle.grid[1][3] = {'type':'poly', 'color':'yellow', 'polyshape':19}
    puzzle.grid[3][1] = {'type':'poly', 'color':'yellow', 'polyshape':35}
    return [puzzle, 5]
  }, function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.addStart(0, 4)
    puzzle.addEnd(4, 0, 'right')
    puzzle.grid[1][1] = {'type':'star', 'color':'red'}
    puzzle.grid[1][3] = {'type':'star', 'color':'red'}
    puzzle.grid[3][1] = {'type':'star', 'color':'blue'}
    puzzle.grid[3][3] = {'type':'star', 'color':'blue'}
    return [puzzle, 4]
  }, function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.addStart(0, 4)
    puzzle.addEnd(4, 0, 'right')
    puzzle.grid[1][1] = {'type':'star', 'color':'red'}
    puzzle.grid[1][3] = {'type':'square', 'color':'red'}
    puzzle.grid[3][1] = {'type':'square', 'color':'red'}
    puzzle.grid[3][3] = {'type':'star', 'color':'red'}
    return [puzzle, 4]
  }, function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.addStart(0, 4)
    puzzle.addEnd(4, 0, 'right')
    puzzle.grid[1][1] = {'type':'star', 'color':'red'}
    puzzle.grid[3][1] = {'type':'poly', 'color':'red', 'polyshape':17}
    return [puzzle, 2]
  }, function() {
    var puzzle = new Puzzle(4, 4)
    puzzle.addStart(0, 8)
    puzzle.addEnd(8, 0, 'right')
    puzzle.grid[1][1] = {'type':'poly', 'color':'yellow', 'polyshape':19}
    return [puzzle, 0]
  }, function() {
    var puzzle = new Puzzle(3, 2)
    puzzle.addStart(2, 2)
    puzzle.addEnd(6, 0, 'right')
    puzzle.grid[1][1] = {'type':'poly', 'color':'yellow', 'polyshape':273}
    puzzle.grid[1][3] = {'type':'poly', 'color':'yellow', 'polyshape':273}
    return [puzzle, 12]
  }, function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.addStart(0, 4)
    puzzle.addEnd(4, 0, 'right')
    puzzle.grid[1][1] = {'type':'square', 'color':'red'}
    puzzle.grid[1][3] = {'type':'square', 'color':'blue'}
    puzzle.grid[3][1] = {'type':'square', 'color':'blue'}
    puzzle.grid[3][3] = {'type':'square', 'color':'red'}
    return [puzzle, 0]
  }, function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.addStart(0, 4)
    puzzle.addEnd(4, 0, 'right')
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
    return [puzzle, 1]
  }, function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.addStart(0, 4)
    puzzle.addEnd(4, 0, 'right')
    puzzle.grid[1][1] = {'type':'poly', 'color':'yellow', 'polyshape':3}
    puzzle.grid[3][3] = {'type':'ylop', 'color':'blue', 'polyshape':3}
    return [puzzle, 6]
  }, function() {
    var puzzle = new Puzzle(4, 2)
    puzzle.addStart(0, 4)
    puzzle.addEnd(8, 0, 'right')
    puzzle.grid[1][3] = {'type':'poly', 'color':'yellow', 'polyshape':547}
    puzzle.grid[3][3] = {'type':'ylop', 'color':'blue'  , 'polyshape':51}
    puzzle.grid[7][3] = {'type':'poly', 'color':'yellow', 'polyshape':802}
    return [puzzle, 2]
  }, function() {
    var puzzle = new Puzzle(3, 1)
    puzzle.addStart(0, 2)
    puzzle.addEnd(6, 0, 'right')
    puzzle.grid[1][1] = {'type':'poly', 'color':'yellow', 'polyshape':1}
    puzzle.grid[3][1] = {'type':'ylop', 'color':'blue'  , 'polyshape':17}
    puzzle.grid[5][1] = {'type':'poly', 'color':'yellow', 'polyshape':1}
    return [puzzle, 2]
  }, function() {
    var puzzle = new Puzzle(4, 4)
    puzzle.addStart(0, 8)
    puzzle.addEnd(8, 0, 'right')
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
    return [puzzle, 17]
  }, function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.addStart(0, 4)
    puzzle.addEnd(4, 0, 'right')
    puzzle.grid[1][1] = {'type':'poly', 'color':'yellow', 'polyshape':35, 'rot':'all'}
    return [puzzle, 5]
  }, function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.addStart(0, 4)
    puzzle.addEnd(4, 0, 'right')
    puzzle.grid[1][1] = {'type':'star', 'color':'red'}
    puzzle.grid[3][3] = {'type':'nega', 'color':'white'}
    return [puzzle, 6]
  }, function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.addStart(0, 4)
    puzzle.addEnd(4, 0, 'right')
    puzzle.grid[1][1] = {'type':'star', 'color':'red'}
    puzzle.grid[3][3] = {'type':'nega', 'color':'red'}
    return [puzzle, 0]
  }, function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.addStart(0, 4)
    puzzle.addEnd(4, 0, 'right')
    puzzle.grid[1][1] = {'type':'star', 'color':'red'}
    puzzle.grid[1][3] = {'type':'star', 'color':'red'}
    puzzle.grid[3][1] = {'type':'star', 'color':'red'}
    puzzle.grid[3][3] = {'type':'nega', 'color':'red'}
    return [puzzle, 2]
  }, function() {
    var puzzle = new Puzzle(5, 1)
    puzzle.addStart(0, 2)
    puzzle.addEnd(10, 0, 'right')
    puzzle.grid[1][1] = {'type':'triangle', 'color':'orange', 'count':1}
    puzzle.grid[5][1] = {'type':'triangle', 'color':'orange', 'count':2}
    puzzle.grid[9][1] = {'type':'triangle', 'color':'orange', 'count':3}
    return [puzzle, 2]
  }, function() {
    var puzzle = new Puzzle(3, 3)
    puzzle.addStart(0, 6)
    puzzle.addEnd(6, 0, 'right')
    puzzle.grid[1][1] = {'type':'nega', 'color':'white'}
    puzzle.grid[3][3] = {'type':'nega', 'color':'white'}
    puzzle.grid[5][5] = {'type':'nega', 'color':'white'}
    return [puzzle, 0]
  }, function() {
    var puzzle = new Puzzle(2, 1, true)
    puzzle.addStart(0, 2)
    puzzle.addEnd(2, 0, 'top')
    puzzle.gaps = [
      {'x':1, 'y':0},
      {'x':1, 'y':2}
    ]
    return [puzzle, 2]
  }, function() {
    var puzzle = new Puzzle(2, 1, true)
    puzzle.addStart(2, 2)
    puzzle.addEnd(2, 0, 'top')
    puzzle.grid[1][1] = {'type':'square', 'color':'white'}
    puzzle.grid[3][1] = {'type':'square', 'color':'black'}
    puzzle.end = {'x':2, 'y':0}
    return [puzzle, 0]
  }, function() {
    var puzzle = new Puzzle(2, 2, true)
    puzzle.addStart(2, 4)
    puzzle.addEnd(2, 0, 'top')
    puzzle.grid[1][1] = {'type':'poly', 'color':'yellow', 'polyshape':49}
    return [puzzle, 0]
  }, function() {
    var puzzle = new Puzzle(2, 1, true)
    puzzle.addStart(2, 2)
    puzzle.addEnd(2, 0, 'top')
    puzzle.grid[1][1] = {'type':'star', 'color':'orange'}
    puzzle.grid[3][1] = {'type':'star', 'color':'orange'}
    return [puzzle, 5]
  }, function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.addStart(0, 4)
    puzzle.addEnd(4, 0, 'right')
    puzzle.grid[1][1] = {'type':'star', 'color':'red'}
    puzzle.grid[1][3] = {'type':'nega', 'color':'red'}
    puzzle.grid[3][3] = {'type':'nega', 'color':'red'}
    return [puzzle, 0]
  }, function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.addStart(0, 4)
    puzzle.addEnd(4, 0, 'right')
    puzzle.grid[1][1] = {'type':'nega', 'color':'white'}
    puzzle.grid[1][3] = {'type':'square', 'color':'red'}
    puzzle.grid[3][1] = {'type':'square', 'color':'blue'}
    puzzle.grid[3][3] = {'type':'square', 'color':'red'}
    return [puzzle, 5]
  }, function() {
    var puzzle = new Puzzle(3, 2)
    puzzle.addStart(0, 4)
    puzzle.addEnd(6, 0, 'right')
    puzzle.grid[1][1] = {'type':'nega', 'color':'white'}
    puzzle.grid[3][1] = {'type':'square', 'color':'blue'}
    puzzle.grid[5][1] = {'type':'star', 'color':'blue'}
    puzzle.grid[3][3] = {'type':'square', 'color':'red'}
    puzzle.grid[5][3] = {'type':'square', 'color':'red'}
    return [puzzle, 6]
  }, function() {
    var puzzle = new Puzzle(3, 2)
    puzzle.addStart(0, 4)
    puzzle.addEnd(6, 0, 'right')
    puzzle.grid[1][1] = {'type':'nega', 'color':'white'}
    puzzle.grid[3][1] = {'type':'square', 'color':'blue'}
    puzzle.grid[5][1] = {'type':'star', 'color':'blue'}
    puzzle.grid[1][3] = {'type':'nega', 'color':'white'}
    puzzle.grid[3][3] = {'type':'square', 'color':'red'}
    puzzle.grid[5][3] = {'type':'square', 'color':'red'}
    return [puzzle, 7]
  }, function() {
    var puzzle = new Puzzle(1, 1)
    puzzle.addStart(0, 2)
    puzzle.addEnd(2, 0, 'right')
    puzzle.grid[1][1] = {'type':'poly', 'polyshape':0}
    return [puzzle, 2]
  }, function() {
    var puzzle = new Puzzle(1, 1)
    puzzle.addStart(0, 2)
    puzzle.addEnd(2, 0, 'right')
    puzzle.grid[1][1] = {'type':'ylop', 'polyshape':0}
    return [puzzle, 2]
  }, function() {
    var puzzle = new Puzzle(0, 3)
    puzzle.addStart(0, 6)
    puzzle.addEnd(0, 0, 'right')
    return [puzzle, 1]
  }, function() {
    var puzzle = new Puzzle(3, 0)
    puzzle.addStart(0, 0)
    puzzle.addEnd(6, 0, 'right')
    return [puzzle, 1]
  }, function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.addStart(0, 4)
    puzzle.addEnd(4, 0, 'right')
    puzzle.grid[1][1] = {'type':'star', 'color':'black'}
    puzzle.grid[1][3] = {'type':'nega', 'color':'black'}
    puzzle.grid[3][1] = {'type':'square', 'color':'white'}
    puzzle.grid[3][3] = {'type':'star', 'color':'black'}
    return [puzzle, 0]
  }, function() {
    var puzzle = new Puzzle(4, 4)
    puzzle.addStart(0, 8)
    puzzle.addEnd(8, 0, 'right')
    puzzle.grid[1][1] = {'type':'star', 'color':'black'}
    puzzle.grid[1][3] = {'type':'nega', 'color':'black'}
    puzzle.grid[3][3] = {'type':'star', 'color':'black'}
    return [puzzle, 0]
  }, function() {
    var puzzle = new Puzzle(4, 4, true)
    puzzle.addStart(0, 8)
    puzzle.addEnd(0, 0, 'top')
    puzzle.addEnd(8, 0, 'right')
    puzzle.grid[3][1] = {'type':'square', 'color':'black'}
    puzzle.grid[3][3] = {'type':'square', 'color':'black'}
    puzzle.grid[3][5] = {'type':'square', 'color':'black'}
    puzzle.grid[3][7] = {'type':'square', 'color':'black'}
    puzzle.grid[5][1] = {'type':'square', 'color':'white'}
    puzzle.grid[5][3] = {'type':'square', 'color':'white'}
    puzzle.grid[5][5] = {'type':'square', 'color':'white'}
    puzzle.grid[5][7] = {'type':'square', 'color':'white'}
    puzzle.end = {'x':0, 'y':0, 'dir':'top'}
    return [puzzle, 40]
  }, function() {
    var puzzle = new Puzzle(4, 4, true)
    puzzle.addStart(0, 8)
    puzzle.addEnd(0, 0, 'top')
    puzzle.grid[3][7] = {'type':'square', 'color':'black'}
    puzzle.grid[5][1] = {'type':'square', 'color':'white'}
    puzzle.end = {'x':0, 'y':0, 'dir':'top'}
    return [puzzle, 1373]
  }, function() {
    var puzzle = new Puzzle(4, 4, true)
    puzzle.addStart(0, 8)
    puzzle.addEnd(0, 0, 'top')
    puzzle.grid[7][7] = {'type':'poly', 'color':'yellow', 'polyshape':17}
    puzzle.end = {'x':0, 'y':0, 'dir':'top'}
    return [puzzle, 155]
  }, function() {
    window.DISABLE_CACHE = false
    var puzzle = new Puzzle(4, 4, true)
    puzzle.addStart(0, 8)
    puzzle.addEnd(0, 0, 'top')
    puzzle.grid[3][3] = {'type':'triangle', 'color':'orange', 'count':3}
    puzzle.grid[5][5] = {'type':'triangle', 'color':'orange', 'count':3}
    return [puzzle, 111]
  }, function() {
    window.DISABLE_CACHE = true
    var puzzle = new Puzzle(4, 4, true)
    puzzle.addStart(0, 8)
    puzzle.addEnd(0, 0, 'top')
    puzzle.grid[3][3] = {'type':'triangle', 'color':'orange', 'count':3}
    puzzle.grid[5][5] = {'type':'triangle', 'color':'orange', 'count':3}
    return [puzzle, 111]
  }, function() {
    window.DISABLE_CACHE = false
    var puzzle = new Puzzle(3, 2, true)
    puzzle.addStart(0, 4)
    puzzle.addEnd(0, 0, 'top')
    puzzle.grid[1][1] = {'type':'triangle', 'color':'orange', 'count':2}
    puzzle.grid[3][3] = {'type':'triangle', 'color':'orange', 'count':2}
    return [puzzle, 7]
  }, function() {
    window.DISABLE_CACHE = true
    var puzzle = new Puzzle(3, 2, true)
    puzzle.addStart(0, 4)
    puzzle.addEnd(0, 0, 'top')
    puzzle.grid[1][1] = {'type':'triangle', 'color':'orange', 'count':2}
    puzzle.grid[3][3] = {'type':'triangle', 'color':'orange', 'count':2}
    return [puzzle, 7]
  }, function() {
    var puzzle = new Puzzle(1, 3, true)
    puzzle.addStart(0, 6)
    puzzle.addEnd(0, 0, 'top')
    return [puzzle, 1]
  }, function() {
    var puzzle = new Puzzle(3, 3)
    puzzle.addStart(0, 6)
    puzzle.addStart(2, 6)
    puzzle.addStart(4, 6)
    puzzle.addStart(6, 6)
    puzzle.addEnd(6, 0, 'right')
    return [puzzle, 649]
  }, function() {
    var puzzle = new Puzzle(3, 3)
    puzzle.addStart(0, 6)
    puzzle.addEnd(0, 0, 'top')
    puzzle.addEnd(2, 0, 'top')
    puzzle.addEnd(4, 0, 'top')
    puzzle.addEnd(6, 0, 'top')
    return [puzzle, 649]
  }, function() {
    var puzzle = new Puzzle(3, 3)
    puzzle.addStart(0, 6)
    puzzle.addStart(2, 6)
    puzzle.addStart(4, 6)
    puzzle.addStart(6, 6)
    puzzle.addEnd(0, 0, 'top')
    puzzle.addEnd(2, 0, 'top')
    puzzle.addEnd(4, 0, 'top')
    puzzle.addEnd(6, 0, 'top')
    return [puzzle, 2320]
  }
]
