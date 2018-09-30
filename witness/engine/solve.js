// Generates a solution via DFS recursive backtracking
function solve(puzzle) {
  var solutions = []
  for (var startPoint of puzzle.startPoints) {
    _solveLoop(puzzle, startPoint.x, startPoint.y, solutions)
  }
  return solutions
}

function _solveLoop(puzzle, x, y, solutions) {
  // if (solutions.length > 0) return
  var endDir = puzzle.getEndDir(x, y)
  if (endDir != undefined) {
    // Reached the end point, validate solution and tail recurse
    puzzle.setCell(x, y, true)
    validate(puzzle)
    if (puzzle.valid) {
      solutions.push(puzzle.clone())
    }
    puzzle.setCell(x, y, false)
    return
  }
  // Extend path left
  if (y%2 == 0 && puzzle.getCell(x - 1, y) == false) {
    puzzle.setCell(x--, y, true)
    _solveLoop(puzzle, x, y, solutions)
    puzzle.setCell(++x, y, false)
  }
  // Extend path right
  if (y%2 == 0 && puzzle.getCell(x + 1, y) == false) {
    puzzle.setCell(x++, y, true)
    _solveLoop(puzzle, x, y, solutions)
    puzzle.setCell(--x, y, false)
  }
  // Extend path up
  if (x%2 == 0 && puzzle.getCell(x, y - 1) == false) {
    puzzle.setCell(x, y--, true)
    _solveLoop(puzzle, x, y, solutions)
    puzzle.setCell(x, ++y, false)
  }
  // Extend path down
  if (x%2 == 0 && puzzle.getCell(x, y + 1) == false) {
    puzzle.setCell(x, y++, true)
    _solveLoop(puzzle, x, y, solutions)
    puzzle.setCell(x, --y, false)
  }
}
