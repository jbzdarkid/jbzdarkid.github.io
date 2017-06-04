// Generates a solution via DFS recursive backtracking
function solve(puzzle, pos, solutions) {
  // if (solutions.length > 0) return
  if (pos.x == puzzle.end.x && pos.y == puzzle.end.y) {
    // Reached the end point, validate solution and tail recurse
    var temp = _copy(puzzle)
    temp.grid[puzzle.end.x][puzzle.end.y] = true
    if (isValid(temp)) {
      solutions.push(temp)
    }
    return
  }
  // Extend path down
  if (pos.x < puzzle.grid.length-1 && !puzzle.grid[pos.x+2][pos.y]) {
    puzzle.grid[pos.x++][pos.y] = true
    puzzle.grid[pos.x++][pos.y] = true
    solve(puzzle, pos, solutions)
    puzzle.grid[--pos.x][pos.y] = false
    puzzle.grid[--pos.x][pos.y] = false
  }
  // Extend path right
  if (pos.y < puzzle.grid[pos.x].length-1 && !puzzle.grid[pos.x][pos.y+2]) {
    puzzle.grid[pos.x][pos.y++] = true
    puzzle.grid[pos.x][pos.y++] = true
    solve(puzzle, pos, solutions)
    puzzle.grid[pos.x][--pos.y] = false
    puzzle.grid[pos.x][--pos.y] = false
  }
  // Extend path up
  if (pos.x > 0 && !puzzle.grid[pos.x-2][pos.y]) {
    puzzle.grid[pos.x--][pos.y] = true
    puzzle.grid[pos.x--][pos.y] = true
    solve(puzzle, pos, solutions)
    puzzle.grid[++pos.x][pos.y] = false
    puzzle.grid[++pos.x][pos.y] = false
  }
  // Extend path left
  if (pos.y > 0 && !puzzle.grid[pos.x][pos.y-2]) {
    puzzle.grid[pos.x][pos.y--] = true
    puzzle.grid[pos.x][pos.y--] = true
    solve(puzzle, pos, solutions)
    puzzle.grid[pos.x][++pos.y] = false
    puzzle.grid[pos.x][++pos.y] = false
  }
}
