// Generates a solution via recursive backtracking
function solve(puzzle, pos, solutions) {
  // if (solutions.length > 0) return
  var ret = isValid(puzzle)
  if (ret == 0 && !(pos.x == puzzle.end.x && pos.y == puzzle.end.y)) {
    // Solution still possible, recurse
    if (pos.x < puzzle.grid.length-1 && !puzzle.grid[pos.x+2][pos.y]) {
      var new_puzzle = _copy(puzzle)
      new_puzzle.grid[pos.x+1][pos.y] = true
      new_puzzle.grid[pos.x+2][pos.y] = true
      solve(new_puzzle, {'x':pos.x+2, 'y':pos.y}, solutions)
    }
    if (pos.y < puzzle.grid[pos.x].length-1 && !puzzle.grid[pos.x][pos.y+2]) {
      var new_puzzle = _copy(puzzle)
      new_puzzle.grid[pos.x][pos.y+1] = true
      new_puzzle.grid[pos.x][pos.y+2] = true
      solve(new_puzzle, {'x':pos.x, 'y':pos.y+2}, solutions)
    }
    if (pos.x > 0 && !puzzle.grid[pos.x-2][pos.y]) {
      var new_puzzle = _copy(puzzle)
      new_puzzle.grid[pos.x-1][pos.y] = true
      new_puzzle.grid[pos.x-2][pos.y] = true
      solve(new_puzzle, {'x':pos.x-2, 'y':pos.y}, solutions)
    }
    if (pos.y > 0 && !puzzle.grid[pos.x][pos.y-2]) {
      var new_puzzle = _copy(puzzle)
      new_puzzle.grid[pos.x][pos.y-1] = true
      new_puzzle.grid[pos.x][pos.y-2] = true
      solve(new_puzzle, {'x':pos.x, 'y':pos.y-2}, solutions)
    }
  } else if (ret == 2) { // Solution found
    solutions.push(puzzle)
    // console.info('Found solution', puzzle)
  }
}
