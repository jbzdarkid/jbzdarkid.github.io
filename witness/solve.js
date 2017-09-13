onmessage = function(e) {
  self.importScripts('puzzle.js', 'validate.js')
  var puzzle = Puzzle.deserialize(e.data)
  console.log(puzzle.isEndpoint)
  console.log(puzzle.isEndpoint(0, 0))
  var solutions = []
  solve(puzzle, {'x':puzzle.start.x, 'y':puzzle.start.y}, solutions)
  postMessage(solutions)
}

// Generates a solution via DFS recursive backtracking
function solve(puzzle, pos, solutions) {
  // if (solutions.length > 0) return
  if (puzzle.isEndpoint(pos.x, pos.y)) {
    // Reached the end point, validate solution and tail recurse
    var temp = puzzle.clone()
    temp.grid[puzzle.end.x][puzzle.end.y] = true
    if (isValid(temp)) {
      solutions.push(temp)
    }
    return
  }
  // Extend path down
  if (puzzle.getCell(pos.x+2, pos.y) == false) {
    puzzle.setCell(pos.x++, pos.y, true)
    puzzle.setCell(pos.x++, pos.y, true)
    solve(puzzle, pos, solutions)
    puzzle.setCell(--pos.x, pos.y, false)
    puzzle.setCell(--pos.x, pos.y, false)
  }
  // Extend path right
  if (puzzle.getCell(pos.x, pos.y+2) == false) {
    puzzle.setCell(pos.x, pos.y++, true)
    puzzle.setCell(pos.x, pos.y++, true)
    solve(puzzle, pos, solutions)
    puzzle.setCell(pos.x, --pos.y, false)
    puzzle.setCell(pos.x, --pos.y, false)
  }
  // Extend path up
  if (puzzle.getCell(pos.x-2, pos.y) == false) {
    puzzle.setCell(pos.x--, pos.y, true)
    puzzle.setCell(pos.x--, pos.y, true)
    solve(puzzle, pos, solutions)
    puzzle.setCell(++pos.x, pos.y, false)
    puzzle.setCell(++pos.x, pos.y, false)
  }
  // Extend path left
  if (puzzle.getCell(pos.x, pos.y-2) == false) {
    puzzle.setCell(pos.x, pos.y--, true)
    puzzle.setCell(pos.x, pos.y--, true)
    solve(puzzle, pos, solutions)
    puzzle.setCell(pos.x, ++pos.y, false)
    puzzle.setCell(pos.x, ++pos.y, false)
  }
}
