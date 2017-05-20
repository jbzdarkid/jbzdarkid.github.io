console.log('solve.js<1>')
// Generates a solution via DFS recursive backtracking
function solve(puzzle, pos, solutions) {
  // if (solutions.length > 0) return
  if (pos.x == puzzle.end.x && pos.y == puzzle.end.y) {
    // Reached the end point, validate solution and tail recurse
    if (isValid(puzzle)) {
      var temp = _copy(puzzle)
      temp.grid[puzzle.end.x][puzzle.end.y] = true
      solutions.push(temp)
    }
    return
  }
  // Extend path down
  if (pos.x < puzzle.grid.length-1 && !puzzle.grid[pos.x+2][pos.y]) {
    puzzle.grid[pos.x+0][pos.y] = true
    puzzle.grid[pos.x+1][pos.y] = true
    pos.x += 2
    solve(puzzle, pos, solutions)
    pos.x -= 2
    puzzle.grid[pos.x+0][pos.y] = false
    puzzle.grid[pos.x+1][pos.y] = false
  }
  // Extend path right
  if (pos.y < puzzle.grid[pos.x].length-1 && !puzzle.grid[pos.x][pos.y+2]) {
    puzzle.grid[pos.x][pos.y+0] = true
    puzzle.grid[pos.x][pos.y+1] = true
    pos.y += 2
    solve(puzzle, pos, solutions)
    pos.y -= 2
    puzzle.grid[pos.x][pos.y+0] = false
    puzzle.grid[pos.x][pos.y+1] = false
  }
  // Extend path up
  if (pos.x > 0 && !puzzle.grid[pos.x-2][pos.y]) {
    puzzle.grid[pos.x-0][pos.y] = true
    puzzle.grid[pos.x-1][pos.y] = true
    pos.x -= 2
    solve(puzzle, pos, solutions)
    pos.x += 2
    puzzle.grid[pos.x-0][pos.y] = false
    puzzle.grid[pos.x-1][pos.y] = false
  }
  // Extend path left
  if (pos.y > 0 && !puzzle.grid[pos.x][pos.y-2]) {
    puzzle.grid[pos.x][pos.y-0] = true
    puzzle.grid[pos.x][pos.y-1] = true
    pos.y -= 2
    solve(puzzle, pos, solutions)
    pos.y += 2
    puzzle.grid[pos.x][pos.y-0] = false
    puzzle.grid[pos.x][pos.y-1] = false
  }
}
