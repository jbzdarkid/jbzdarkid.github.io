window.DISABLE_CACHE = true

window.onload = function() {
  var table = document.getElementById('meta')
  var numFailures = 0
  var testNames = Object.keys(tests)
  for (var i=0; i<testNames.length; i++) {
    if (i%3 == 0) table.insertRow()
    var testName = testNames[i]

    var cell = table.rows[table.rows.length - 1].insertCell()
    var puzzleSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    puzzleSvg.id = testName
    cell.appendChild(puzzleSvg)

    try {
      var puzzleData = tests[testName]()
      var puzzle = puzzleData[0]
      var expectedSolutions = puzzleData[1]
      var solutions = solve(puzzle)
      draw(puzzle, testName)
      if (solutions.length != expectedSolutions) {
        console.error('Test', testName, 'has', solutions.length, 'solutions, should have', expectedSolutions)
        for (var solution of solutions) {
          console.log(solution.toString())
        }
        var border = puzzleSvg.firstChild
        border.setAttribute('stroke', 'red')
        numFailures++
      }
    } catch (e) {
      console.error('Test', testName, 'errored!')
      cell.innerHTML = e.stack || 'ERROR: ' + e
      numFailures++
    }
  }
  return numFailures
}

tests = {
  'end-left': function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.addStart(4, 4)
    puzzle.addEnd(0, 2, 'left')
    return [puzzle, 10]
  }, 'end-right': function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.addStart(0, 0)
    puzzle.addEnd(4, 2, 'right')
    return [puzzle, 10]
  }, 'end-up': function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.addStart(0, 4)
    puzzle.addEnd(2, 0, 'top')
    return [puzzle, 10]
  }, 'end-down': function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.addStart(4, 0)
    puzzle.addEnd(2, 4, 'bottom')
    return [puzzle, 10]
  }, 'negation with dots': function() {
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
  }, 'simple negation': function() {
    var puzzle = new Puzzle(3, 1)
    puzzle.addStart(0, 2)
    puzzle.addEnd(6, 0, 'right')
    puzzle.grid[1][1] = {'type':'nega', 'color':'white'}
    puzzle.grid[3][1] = {'type':'square', 'color':'red'}
    puzzle.grid[5][1] = {'type':'square', 'color':'blue'}
    return [puzzle, 2]
  }, 'simple double negation': function() {
    var puzzle = new Puzzle(3, 3)
    puzzle.addStart(0, 6)
    puzzle.addEnd(6, 0, 'right')
    puzzle.grid[5][1] = {'type':'nega', 'color':'white'}
    puzzle.grid[5][5] = {'type':'nega', 'color':'white'}
    puzzle.grid[1][1] = {'type':'square', 'color':'red'}
    puzzle.grid[3][1] = {'type':'square', 'color':'blue'}
    puzzle.grid[3][5] = {'type':'poly', 'color': 'yellow', 'polyshape':1}
    return [puzzle, 41]
  }, 'double negation with double squares': function() {
    var puzzle = new Puzzle(3, 3)
    puzzle.addStart(0, 6)
    puzzle.addEnd(6, 0, 'right')
    puzzle.grid[1][1] = {'type':'nega', 'color':'white'}
    puzzle.grid[3][1] = {'type':'nega', 'color':'white'}
    puzzle.grid[1][3] = {'type':'square', 'color':'red'}
    puzzle.grid[3][3] = {'type':'square', 'color':'blue'}
    puzzle.grid[5][3] = {'type':'square', 'color':'blue'}
    return [puzzle, 62]
  }, 'double negation with double squares 2': function() {
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
  }, 'negation complexity': function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.addStart(0, 4)
    puzzle.addEnd(4, 0, 'right')
    puzzle.grid[1][1] = {'type':'nega', 'color':'white'}
    puzzle.grid[1][3] = {'type':'square', 'color':'red'}
    puzzle.grid[3][1] = {'type':'square', 'color':'blue'}
    puzzle.grid[3][3] = {'type':'square', 'color':'red'}
    return [puzzle, 5]
  }, 'negation complexity 2': function() {
    var puzzle = new Puzzle(3, 2)
    puzzle.addStart(0, 4)
    puzzle.addEnd(6, 0, 'right')
    puzzle.grid[1][1] = {'type':'nega', 'color':'white'}
    puzzle.grid[3][1] = {'type':'square', 'color':'blue'}
    puzzle.grid[5][1] = {'type':'star', 'color':'blue'}
    puzzle.grid[3][3] = {'type':'square', 'color':'red'}
    puzzle.grid[5][3] = {'type':'square', 'color':'red'}
    return [puzzle, 6]
  }, 'negation complexity 3': function() {
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
  }, 'negation complexity B1': function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.addStart(0, 4)
    puzzle.addEnd(4, 0, 'right')
    puzzle.grid[1][1] = {'type':'star', 'color':'black'}
    puzzle.grid[1][3] = {'type':'nega', 'color':'black'}
    puzzle.grid[3][1] = {'type':'square', 'color':'white'}
    puzzle.grid[3][3] = {'type':'star', 'color':'black'}
    return [puzzle, 0]
  }, 'negation complexity B2': function() {
    var puzzle = new Puzzle(4, 4)
    puzzle.addStart(0, 8)
    puzzle.addEnd(8, 0, 'right')
    puzzle.grid[1][1] = {'type':'star', 'color':'black'}
    puzzle.grid[1][3] = {'type':'nega', 'color':'black'}
    puzzle.grid[3][3] = {'type':'star', 'color':'black'}
    return [puzzle, 0]
  }, 'simple polyominos': function() {
    var puzzle = new Puzzle(3, 3)
    puzzle.addStart(0, 6)
    puzzle.addEnd(6, 0, 'right')
    puzzle.grid[1][1] = {'type':'poly', 'color':'yellow', 'polyshape':1}
    puzzle.grid[3][1] = {'type':'poly', 'color':'yellow', 'polyshape':17}
    return [puzzle, 14]
  }, 'simple polyominos 2': function() {
    var puzzle = new Puzzle(3, 3)
    puzzle.addStart(0, 6)
    puzzle.addEnd(6, 0, 'right')
    puzzle.grid[5][1] = {'type':'poly', 'color':'yellow', 'polyshape':273}
    puzzle.grid[3][3] = {'type':'poly', 'color':'yellow', 'polyshape':50}
    return [puzzle, 1]
  }, 'negation with polyominos': function() {
    var puzzle = new Puzzle(3, 3)
    puzzle.addStart(0, 6)
    puzzle.addEnd(6, 0, 'right')
    puzzle.grid[1][1] = {'type':'nega', 'color':'white'}
    puzzle.grid[1][3] = {'type':'poly', 'color':'yellow', 'polyshape':19}
    puzzle.grid[3][1] = {'type':'poly', 'color':'yellow', 'polyshape':35}
    return [puzzle, 5]
  }, 'paired stars': function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.addStart(0, 4)
    puzzle.addEnd(4, 0, 'right')
    puzzle.grid[1][1] = {'type':'star', 'color':'red'}
    puzzle.grid[1][3] = {'type':'star', 'color':'red'}
    puzzle.grid[3][1] = {'type':'star', 'color':'blue'}
    puzzle.grid[3][3] = {'type':'star', 'color':'blue'}
    return [puzzle, 4]
  }, 'stars and squares': function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.addStart(0, 4)
    puzzle.addEnd(4, 0, 'right')
    puzzle.grid[1][1] = {'type':'star', 'color':'red'}
    puzzle.grid[1][3] = {'type':'square', 'color':'red'}
    puzzle.grid[3][1] = {'type':'square', 'color':'red'}
    puzzle.grid[3][3] = {'type':'star', 'color':'red'}
    return [puzzle, 4]
  }, 'colored polyominos': function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.addStart(0, 4)
    puzzle.addEnd(4, 0, 'right')
    puzzle.grid[1][1] = {'type':'star', 'color':'red'}
    puzzle.grid[3][1] = {'type':'poly', 'color':'red', 'polyshape':17}
    return [puzzle, 2]
  }, 'corner polyomino': function() {
    var puzzle = new Puzzle(4, 4)
    puzzle.addStart(0, 8)
    puzzle.addEnd(8, 0, 'right')
    puzzle.grid[1][1] = {'type':'poly', 'color':'yellow', 'polyshape':19}
    return [puzzle, 47]
  }, 'polyomino with center start': function() {
    var puzzle = new Puzzle(3, 2)
    puzzle.addStart(2, 2)
    puzzle.addEnd(6, 0, 'right')
    puzzle.grid[1][1] = {'type':'poly', 'color':'yellow', 'polyshape':273}
    puzzle.grid[1][3] = {'type':'poly', 'color':'yellow', 'polyshape':273}
    return [puzzle, 4]
  }, 'polyomino/ylop with center start': function() {
    var puzzle = new Puzzle(3, 2)
    puzzle.addStart(2, 2)
    puzzle.addEnd(6, 0, 'right')
    puzzle.grid[1][1] = {'type':'poly', 'color':'yellow', 'polyshape':273}
    puzzle.grid[1][3] = {'type':'poly', 'color':'yellow', 'polyshape':273}
    puzzle.grid[3][1] = {'type':'ylop', 'color':'blue', 'polyshape':3}
    return [puzzle, 2]
  }, 'polyomino/ylop with center start 2': function() {
    var puzzle = new Puzzle(3, 3)
    puzzle.addStart(2, 4)
    puzzle.addEnd(6, 0, 'right')
    puzzle.grid[1][1] = {'type':'poly', 'color':'yellow', 'polyshape':1911}
    puzzle.grid[3][1] = {'type':'ylop', 'color':'blue', 'polyshape':51}
    return [puzzle, 4]
  }, 'polyomino/ylop with edge start': function() {
    var puzzle = new Puzzle(3, 3)
    puzzle.addStart(0, 2)
    puzzle.addEnd(6, 6, 'right')
    puzzle.grid[1][1] = {'type':'poly', 'color':'yellow', 'polyshape':823}
    puzzle.grid[3][1] = {'type':'ylop', 'color':'blue', 'polyshape':3}
    return [puzzle, 3]
  }, 'impossible squares': function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.addStart(0, 4)
    puzzle.addEnd(4, 0, 'right')
    puzzle.grid[1][1] = {'type':'square', 'color':'red'}
    puzzle.grid[1][3] = {'type':'square', 'color':'blue'}
    puzzle.grid[3][1] = {'type':'square', 'color':'blue'}
    puzzle.grid[3][3] = {'type':'square', 'color':'red'}
    return [puzzle, 0]
  }, 'dot and gap test': function() {
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
  }, 'completely cancel': function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.addStart(0, 4)
    puzzle.addEnd(4, 0, 'right')
    puzzle.grid[1][1] = {'type':'poly', 'color':'yellow', 'polyshape':3}
    puzzle.grid[3][3] = {'type':'ylop', 'color':'blue', 'polyshape':3}
    return [puzzle, 6]
  }, 'half of game puzzle': function() {
    var puzzle = new Puzzle(4, 2)
    puzzle.addStart(0, 4)
    puzzle.addEnd(8, 0, 'right')
    puzzle.grid[1][3] = {'type':'poly', 'color':'yellow', 'polyshape':547}
    puzzle.grid[3][3] = {'type':'ylop', 'color':'blue'  , 'polyshape':51}
    puzzle.grid[7][3] = {'type':'poly', 'color':'yellow', 'polyshape':802}
    return [puzzle, 2]
  }, 'completely cancel 2': function() {
    var puzzle = new Puzzle(3, 1)
    puzzle.addStart(0, 2)
    puzzle.addEnd(6, 0, 'right')
    puzzle.grid[1][1] = {'type':'poly', 'color':'yellow', 'polyshape':1}
    puzzle.grid[3][1] = {'type':'ylop', 'color':'blue'  , 'polyshape':17}
    puzzle.grid[5][1] = {'type':'poly', 'color':'yellow', 'polyshape':1}
    return [puzzle, 2]
  }, 'many partial cancels': function() {
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
  }, 'simple rpoly': function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.addStart(0, 4)
    puzzle.addEnd(4, 0, 'right')
    puzzle.grid[1][1] = {'type':'poly', 'color':'yellow', 'polyshape':35, 'rot':'all'}
    return [puzzle, 5]
  }, 'negation with stars': function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.addStart(0, 4)
    puzzle.addEnd(4, 0, 'right')
    puzzle.grid[1][1] = {'type':'star', 'color':'red'}
    puzzle.grid[3][3] = {'type':'nega', 'color':'white'}
    return [puzzle, 6]
  }, 'colored negation with stars': function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.addStart(0, 4)
    puzzle.addEnd(4, 0, 'right')
    puzzle.grid[1][1] = {'type':'star', 'color':'red'}
    puzzle.grid[3][3] = {'type':'nega', 'color':'red'}
    return [puzzle, 0]
  }, 'colored negation with stars 2': function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.addStart(0, 4)
    puzzle.addEnd(4, 0, 'right')
    puzzle.grid[1][1] = {'type':'star', 'color':'red'}
    puzzle.grid[1][3] = {'type':'star', 'color':'red'}
    puzzle.grid[3][1] = {'type':'star', 'color':'red'}
    puzzle.grid[3][3] = {'type':'nega', 'color':'red'}
    return [puzzle, 2]
  }, 'colored negation with stars 3': function() {
    var puzzle = new Puzzle(2, 2)
    puzzle.addStart(0, 4)
    puzzle.addEnd(4, 0, 'right')
    puzzle.grid[1][1] = {'type':'star', 'color':'red'}
    puzzle.grid[1][3] = {'type':'nega', 'color':'red'}
    puzzle.grid[3][3] = {'type':'nega', 'color':'red'}
    return [puzzle, 0]
  }, 'triangles': function() {
    var puzzle = new Puzzle(5, 1)
    puzzle.addStart(0, 2)
    puzzle.addEnd(10, 0, 'right')
    puzzle.grid[1][1] = {'type':'triangle', 'color':'orange', 'count':1}
    puzzle.grid[5][1] = {'type':'triangle', 'color':'orange', 'count':2}
    puzzle.grid[9][1] = {'type':'triangle', 'color':'orange', 'count':3}
    return [puzzle, 2]
  }, 'impossible triangles': function() {
    var puzzle = new Puzzle(3, 3)
    puzzle.addStart(0, 0)
    puzzle.addEnd(6, 0, 'right')
    puzzle.grid[1][1] = {'type':'triangle', 'color':'orange', 'count':1}
    puzzle.grid[3][1] = {'type':'triangle', 'color':'orange', 'count':2}
    puzzle.grid[5][1] = {'type':'triangle', 'color':'orange', 'count':3}
    puzzle.grid[1][3] = {'type':'triangle', 'color':'orange', 'count':4}
    puzzle.grid[3][3] = {'type':'triangle', 'color':'orange', 'count':5}
    puzzle.grid[5][3] = {'type':'triangle', 'color':'orange', 'count':6}
    puzzle.grid[1][5] = {'type':'triangle', 'color':'orange', 'count':7}
    puzzle.grid[3][5] = {'type':'triangle', 'color':'orange', 'count':8}
    puzzle.grid[5][5] = {'type':'triangle', 'color':'orange', 'count':9}
    return [puzzle, 0]
  }, 'not quite impossible triangles': function() {
    var puzzle = new Puzzle(3, 3)
    puzzle.addStart(3, 6)
    puzzle.addEnd(6, 0, 'right')
    puzzle.grid[3][5] = {'type':'triangle', 'color':'orange', 'count':4}
    return [puzzle, 12]
  }, 'not quite impossible triangles 2': function() {
    var puzzle = new Puzzle(3, 3)
    puzzle.addStart(0, 6)
    puzzle.addEnd(3, 0, 'top')
    puzzle.grid[3][1] = {'type':'triangle', 'color':'orange', 'count':4}
    return [puzzle, 12]
  }, 'triple negation': function() {
    var puzzle = new Puzzle(3, 3)
    puzzle.addStart(0, 6)
    puzzle.addEnd(6, 0, 'right')
    puzzle.grid[1][1] = {'type':'nega', 'color':'white'}
    puzzle.grid[3][3] = {'type':'nega', 'color':'white'}
    puzzle.grid[5][5] = {'type':'nega', 'color':'white'}
    return [puzzle, 0]
  }, 'pillar with gap': function() {
    var puzzle = new Puzzle(2, 1, true)
    puzzle.addStart(0, 2)
    puzzle.addEnd(2, 0, 'top')
    puzzle.gaps = [
      {'x':1, 'y':0},
      {'x':1, 'y':2}
    ]
    return [puzzle, 2]
  }, 'pillar with stones': function() {
    var puzzle = new Puzzle(2, 1, true)
    puzzle.addStart(2, 2)
    puzzle.addEnd(2, 0, 'top')
    puzzle.grid[1][1] = {'type':'square', 'color':'white'}
    puzzle.grid[3][1] = {'type':'square', 'color':'black'}
    puzzle.end = {'x':2, 'y':0}
    return [puzzle, 0]
  }, 'pillar with poly': function() {
    var puzzle = new Puzzle(2, 2, true)
    puzzle.addStart(2, 4)
    puzzle.addEnd(2, 0, 'top')
    puzzle.grid[1][1] = {'type':'poly', 'color':'yellow', 'polyshape':49}
    return [puzzle, 0]
  }, 'pillar with stars': function() {
    var puzzle = new Puzzle(2, 1, true)
    puzzle.addStart(2, 2)
    puzzle.addEnd(2, 0, 'top')
    puzzle.grid[1][1] = {'type':'star', 'color':'orange'}
    puzzle.grid[3][1] = {'type':'star', 'color':'orange'}
    return [puzzle, 5]
  }, 'invisible poly': function() {
    var puzzle = new Puzzle(2, 1)
    puzzle.addStart(0, 2)
    puzzle.addEnd(4, 0, 'right')
    puzzle.grid[1][1] = {'type':'poly', 'polyshape':0}
    return [puzzle, 4]
  }, 'invisible ylop': function() {
    var puzzle = new Puzzle(2, 1)
    puzzle.addStart(0, 2)
    puzzle.addEnd(4, 0, 'right')
    puzzle.grid[3][1] = {'type':'ylop', 'polyshape':0}
    return [puzzle, 4]
  }, 'invisible poly and ylop': function() {
    var puzzle = new Puzzle(2, 1)
    puzzle.addStart(0, 2)
    puzzle.addEnd(4, 0, 'right')
    puzzle.grid[1][1] = {'type':'poly', 'polyshape':0}
    puzzle.grid[3][1] = {'type':'ylop', 'polyshape':0}
    return [puzzle, 4]
  }, 'laser key': function() {
    var puzzle = new Puzzle(0, 3)
    puzzle.addStart(0, 6)
    puzzle.addEnd(0, 0, 'right')
    return [puzzle, 1]
  }, 'straight': function() {
    var puzzle = new Puzzle(3, 0)
    puzzle.addStart(0, 0)
    puzzle.addEnd(6, 0, 'right')
    return [puzzle, 1]
  }, 'pillar square bug': function() {
    var puzzle = new Puzzle(4, 4, true)
    puzzle.addStart(0, 8)
    puzzle.addEnd(0, 0, 'top')
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
  }, 'simpler pillar square bug': function() {
    var puzzle = new Puzzle(4, 4, true)
    puzzle.addStart(0, 8)
    puzzle.addEnd(0, 0, 'top')
    puzzle.grid[3][7] = {'type':'square', 'color':'black'}
    puzzle.grid[5][1] = {'type':'square', 'color':'white'}
    puzzle.end = {'x':0, 'y':0, 'dir':'top'}
    return [puzzle, 1373]
  }, 'pillar poly bug': function() {
    var puzzle = new Puzzle(4, 4, true)
    puzzle.addStart(0, 8)
    puzzle.addEnd(0, 0, 'top')
    puzzle.grid[7][7] = {'type':'poly', 'color':'yellow', 'polyshape':17}
    puzzle.end = {'x':0, 'y':0, 'dir':'top'}
    return [puzzle, 155]
  }, 'pillar triangles bug NOCACHE': function() {
    window.DISABLE_CACHE = false
    var puzzle = new Puzzle(4, 4, true)
    puzzle.addStart(0, 8)
    puzzle.addEnd(0, 0, 'top')
    puzzle.grid[3][3] = {'type':'triangle', 'color':'orange', 'count':3}
    puzzle.grid[5][5] = {'type':'triangle', 'color':'orange', 'count':3}
    return [puzzle, 111]
  }, 'pillar triangles bug': function() {
    window.DISABLE_CACHE = true
    var puzzle = new Puzzle(4, 4, true)
    puzzle.addStart(0, 8)
    puzzle.addEnd(0, 0, 'top')
    puzzle.grid[3][3] = {'type':'triangle', 'color':'orange', 'count':3}
    puzzle.grid[5][5] = {'type':'triangle', 'color':'orange', 'count':3}
    return [puzzle, 111]
  }, 'small pillar triangles bug NOCACHE': function() {
    window.DISABLE_CACHE = false
    var puzzle = new Puzzle(3, 2, true)
    puzzle.addStart(0, 4)
    puzzle.addEnd(0, 0, 'top')
    puzzle.grid[1][1] = {'type':'triangle', 'color':'orange', 'count':2}
    puzzle.grid[3][3] = {'type':'triangle', 'color':'orange', 'count':2}
    return [puzzle, 7]
  }, 'small pillar triangles bug': function() {
    window.DISABLE_CACHE = true
    var puzzle = new Puzzle(3, 2, true)
    puzzle.addStart(0, 4)
    puzzle.addEnd(0, 0, 'top')
    puzzle.grid[1][1] = {'type':'triangle', 'color':'orange', 'count':2}
    puzzle.grid[3][3] = {'type':'triangle', 'color':'orange', 'count':2}
    return [puzzle, 7]
  }, 'laser key pillar': function() {
    var puzzle = new Puzzle(1, 3, true)
    puzzle.addStart(0, 6)
    puzzle.addEnd(0, 0, 'top')
    return [puzzle, 1]
  }, 'multistart simple': function() {
    var puzzle = new Puzzle(3, 3)
    puzzle.addStart(0, 6)
    puzzle.addStart(2, 6)
    puzzle.addStart(4, 6)
    puzzle.addStart(6, 6)
    puzzle.addEnd(6, 0, 'right')
    return [puzzle, 649]
  }, 'multiend simple': function() {
    var puzzle = new Puzzle(3, 3)
    puzzle.addStart(0, 6)
    puzzle.addEnd(0, 0, 'top')
    puzzle.addEnd(2, 0, 'top')
    puzzle.addEnd(4, 0, 'top')
    puzzle.addEnd(6, 0, 'top')
    return [puzzle, 649]
  }, 'multistart and end simple': function() {
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
}
