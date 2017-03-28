// Generates a solution via DFS recursive backtracking
function solve(puzzle, pos, solutions) {
  // if (solutions.length > 0) return
  if (pos.x == puzzle.end.x && pos.y == puzzle.end.y) {
    // Reached the end point, validate solution and tail
    if (isValid(puzzle) == 2) {
      solutions.push(puzzle)
    }
    return
  }
  // Extend path down
  if (pos.x < puzzle.grid.length-1 && !puzzle.grid[pos.x+2][pos.y]) {
    var new_puzzle = _copy(puzzle)
    new_puzzle.grid[pos.x+1][pos.y] = true
    new_puzzle.grid[pos.x+2][pos.y] = true
    solve(new_puzzle, {'x':pos.x+2, 'y':pos.y}, solutions)
  }
  // Extend path right
  if (pos.y < puzzle.grid[pos.x].length-1 && !puzzle.grid[pos.x][pos.y+2]) {
    var new_puzzle = _copy(puzzle)
    new_puzzle.grid[pos.x][pos.y+1] = true
    new_puzzle.grid[pos.x][pos.y+2] = true
    solve(new_puzzle, {'x':pos.x, 'y':pos.y+2}, solutions)
  }
  // Extend path up
  if (pos.x > 0 && !puzzle.grid[pos.x-2][pos.y]) {
    var new_puzzle = _copy(puzzle)
    new_puzzle.grid[pos.x-1][pos.y] = true
    new_puzzle.grid[pos.x-2][pos.y] = true
    solve(new_puzzle, {'x':pos.x-2, 'y':pos.y}, solutions)
  }
  // Extend path left
  if (pos.y > 0 && !puzzle.grid[pos.x][pos.y-2]) {
    var new_puzzle = _copy(puzzle)
    new_puzzle.grid[pos.x][pos.y-1] = true
    new_puzzle.grid[pos.x][pos.y-2] = true
    solve(new_puzzle, {'x':pos.x, 'y':pos.y-2}, solutions)
  }
}
