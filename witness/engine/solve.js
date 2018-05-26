// Generates a solution via DFS recursive backtracking
function solve(puzzle, x, y, solutions) {
  // if (solutions.length > 0) return
  if (puzzle.isEndpoint(x, y)) {
    // Reached the end point, validate solution and tail recurse
    puzzle.setCell(x, y, true)
    validate(puzzle)
    if (puzzle.valid) {
      solutions.push(puzzle.clone())
    }
    puzzle.setCell(x, y, false)
    return
  }
  // Extend path down
  if (puzzle.getCell(x+2, y) == false) {
    puzzle.setCell(x++, y, true)
    puzzle.setCell(x++, y, true)
    solve(puzzle, x, y, solutions)
    puzzle.setCell(--x, y, false)
    puzzle.setCell(--x, y, false)
  }
  // Extend path right
  if (puzzle.getCell(x, y+2) == false) {
    puzzle.setCell(x, y++, true)
    puzzle.setCell(x, y++, true)
    solve(puzzle, x, y, solutions)
    puzzle.setCell(x, --y, false)
    puzzle.setCell(x, --y, false)
  }
  // Extend path up
  if (puzzle.getCell(x-2, y) == false) {
    puzzle.setCell(x--, y, true)
    puzzle.setCell(x--, y, true)
    solve(puzzle, x, y, solutions)
    puzzle.setCell(++x, y, false)
    puzzle.setCell(++x, y, false)
  }
  // Extend path left
  if (puzzle.getCell(x, y-2) == false) {
    puzzle.setCell(x, y--, true)
    puzzle.setCell(x, y--, true)
    solve(puzzle, x, y, solutions)
    puzzle.setCell(x, ++y, false)
    puzzle.setCell(x, ++y, false)
  }
}
