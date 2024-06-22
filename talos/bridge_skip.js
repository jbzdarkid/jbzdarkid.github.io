"use strict";

//**** Global variables and related functions ****//
function print_grid(grid, error, p) {
  var grid_bounds = [0, 0, 100, 100];
  var fudge = 5;
  for (var x = 0; x < grid.length; x++) {
    var row_clear = true
    for (var y = 0; y < grid[x].length; y++) {
      if (grid[x][y] > 0) { row_clear = false; break; }
    }
    if (!row_clear) break;
    grid_bounds[0] = x - fudge;
  }
  for (var x = grid.length - 1; x >= 0; x--) {
    var row_clear = true
    for (var y = 0; y < grid[x].length; y++) {
      if (grid[x][y] > 0) { row_clear = false; break; }
    }
    if (!row_clear) break;
    grid_bounds[1] = x + fudge;
  }
  for (var y = 0; y < grid[0].length; y++) {
    var col_clear = true
    for (var x = 0; x < grid.length; x++) {
      if (grid[x][y] > 0) { col_clear = false; break; }
    }
    if (!col_clear) break;
    grid_bounds[2] = y - fudge;
  }
  for (var y = grid[0].length - 1; y >= 0; y--) {
    var col_clear = true
    for (var x = 0; x < grid.length; x++) {
      if (grid[x][y] > 0) { col_clear = false; break; }
    }
    if (!col_clear) break;
    grid_bounds[3] = y + fudge;
  }

  var output = "+";
  for (var y = grid_bounds[2]; y < grid_bounds[3]; y++) {
    output += "-";
  }
  output += "+\n";
  for (var x = grid_bounds[0]; x < grid_bounds[1]; x++) {
    output += "|";
    for (var y = grid_bounds[2]; y < grid_bounds[3]; y++) {
      if (x == 50 && y == 50)                 output += "S";
      else if (x == error.x && y == error.y)  output += "*";
      else if (p != null && p.contains(x, y)) output += "X";
      else if (grid[x][y] == 0)               output += " ";
      else                                    output += grid[x][y];
    }
    output += "|\n";
  }
  output += "+";
  for (var y = grid_bounds[2]; y < grid_bounds[3]; y++) {
    output += "-";
  }
  output += "+";
  return output;
}

window.addEventListener("load", () => {
  var e1_pieces = [];
  e1_pieces[0] = new Piece('S', loc(3, 1, NORTH),  loc(0, 0, NORTH));
  e1_pieces[1] = new Piece('O', loc(3, 0, EAST),   loc(2, 2, EAST));
  e1_pieces[2] = new Piece('L', loc(3, 1, NORTH),  loc(0, 0, NORTH));
  e1_pieces[3] = new Piece('O', loc(2, 0, EAST),   loc(3, 2, EAST));
  e1_pieces[4] = new Piece('S', loc(3, 1, NORTH),  loc(0, 0, NORTH));
  e1_pieces[5] = new Piece('L', loc(3, 1, WEST),   loc(1, -1, WEST));
  e1_pieces[6] = new Piece('L', loc(3, 1, WEST),   loc(0, 0, NORTH));
  e1_pieces[7] = new Piece('L', loc(3, 1, NORTH),  loc(1, 1, EAST));

  var solutions = solve_bridge(e1_pieces.slice(0, 3), NORTH, loc(-8, -1, NORTH));
  // solve_bridge(e1_pieces.slice(3, 6), NORTH, loc(-7, 2,  NORTH));
  // solve_bridge(e1_pieces.slice(6, 8), NORTH, loc(-5, -1, NORTH));

  console.debug(solutions);

  solutions.sort((a, b) => {
    if (a.exit.x < b.exit.x) return -1;
    if (a.exit.x > b.exit.x) return 1;
    if (a.exit.y < b.exit.y) return -1;
    if (a.exit.y > b.exit.y) return 1;

    return 0;
  });

  for (var i = 0; i < solutions.length; i++) {
    var s = solutions[i];
    console.info(`Solution ${i} reached location (${s.exit.x}, ${s.exit.y}) with pattern: ${s.name}`);
  }
})

//**** Helper classes ****//
const NORTH = 0;
const EAST  = 1;
const SOUTH = 2;
const WEST  = 3;
function loc(x, y, ori) {
  return {'x': x, 'y': y, 'ori': ori};
}

class Piece {
  constructor(shape, enter, exit) {
    this.shape = shape;
    this.enter = enter;
    this.exit = exit;
    this.placed = false;

    // N.B.: All shapes are normalized to cover 3,0,0
    switch (shape) {
      case 'I': this.cells = [loc(0, 0, 0),  loc(1, 0, 0),  loc(2, 0, 0), loc(3, 0, 0)]; break;
      case 'L': this.cells = [loc(1, 0, 0),  loc(2, 0, 0),  loc(3, 0, 0), loc(3, 1, 0)]; break;
      case 'S': this.cells = [loc(1, -1, 0), loc(2, -1, 0), loc(2, 0, 0), loc(3, 0, 0)]; break;
      case 'O': this.cells = [loc(2, 0, 0),  loc(2, 1, 0),  loc(3, 0, 0), loc(3, 1, 0)]; break;
      case 'T': this.cells = [loc(2, -1, 0), loc(2, 0, 0),  loc(2, 1, 0), loc(3, 0, 0)]; break;
    }
  }
  
  contains(x, y) {
    for (var c of this.cells) {
      if (c.x == x && c.y == y) return true;
    }
    return false;
  }

  print() {
    var output = "";
    for (var x = -1; x < 5; x++) {
      for (var y = -1; y < 5; y++) {
        if (this.contains(x, y)) {
          if (this.enter == loc(x, y, NORTH))        output += "^";
          else if (this.enter == loc(x, y, SOUTH))   output += "v";
          else if (this.enter == loc(x, y, WEST))    output += "<";
          else if (this.enter == loc(x, y, EAST))    output += ">";
          else if (this.exit  == loc(x-1, y, NORTH)) output += "^";
          else if (this.exit  == loc(x+1, y, SOUTH)) output += "v";
          else if (this.exit  == loc(x, y-1, WEST))  output += "<";
          else if (this.exit  == loc(x, y+1, EAST))  output += ">";
          else                                       output += "#";
        } else {
          var x_edge = (x == -1 || x == 4);
          var y_edge = (y == -1 || y == 4);
          if (x_edge && y_edge)                      output += "+";
          else if (x_edge && !y_edge)                output += "-";
          else if (!x_edge && y_edge)                output += "|";
          else if (!x_edge && !y_edge)               output += " ";
        }
      }
      output += "\n";
    }
    return output;
  }
  
  // rotation: Integer, number of 90 degree clockwise rotations.
  rotate(rotation) {
    rotation = ((rotation % 4) + 4) % 4; // normalize to positive mod 4
    for (var i = 0; i < rotation; i++) {
      this.enter = loc(this.enter.y, 3 - this.enter.x, (this.enter.ori + 1) % 4);
      this.exit  = loc(this.exit.y,  3 - this.exit.x,  (this.exit.ori + 1) % 4);
      for (var i = 0; i < this.cells.length; i++) {
        this.cells[i] = loc(this.cells[i].y, 3 - this.cells[i].x, this.cells[i].ori);
      }
    }
  }

  flip() {
    this.enter = loc(this.enter.x, 3 - this.enter.y, (4 - this.enter.ori) % 4);
    this.exit  = loc(this.exit.x,  3 - this.exit.y,  (4 - this.exit.ori) % 4);
    for (var i = 0; i < this.cells.length; i++) {
      this.cells[i] = loc(this.cells[i].x, 3 - this.cells[i].y, this.cells[i].ori);
    }
  }

  translate(x, y) {
    this.enter = loc(this.enter.x + x, this.enter.y + y, this.enter.ori);
    this.exit  = loc(this.exit.x + x,  this.exit.y + y,  this.exit.ori);
    for (var i = 0; i < this.cells.length; i++) {
      this.cells[i] = loc(this.cells[i].x + x, this.cells[i].y + y, this.cells[i].ori);
    }
  }

  // Transform a piece by rotating, translating, fliping, or flipswapping a piece.
  // Returns a new piece with the transformation applied.
  //   target: loc, target position and orientiation (within the larger grid).
  //   flip: boolean, if the piece is flipped (or the source piece is flipped, if nonnil
  //   source: piece, the flipswap source piece. Optional value indicated by nil, in which case no flipswap is applied.
  transform(position, flip, source) {
    var q = new Piece(this.shape, this.enter, this.exit); // Copy and we'll just modify the copy

    if (source == null) { // Normal, non-flipswap behavior.
      q.rotate(position.ori - q.enter.ori);
      if (flip) q.flip();
      q.translate(3 - q.enter.x, 0 - q.enter.y);
    } else { // Buggy flipswap behavior
      var r = new Piece(source.shape, source.enter, source.exit);

      // Red: Apply normal rotation and flip computation for the source piece
      r.rotate(position.ori - source.enter.ori);
      if (flip) r.flip();

      // Blue: Apply the source transformation to the target piece.
      q.rotate(position.ori - source.enter.ori);
      if (flip) q.flip();
      q.translate(3 - r.enter.x, 0 - r.enter.y);
    }

    // Translate to grid coords. We are using 3,0 as our entry point since it makes the pictures look nice.
    q.translate(position.x - 3, position.y - 0);

    return q;
  }
  
  can_place(grid) {
    for (var c of this.cells) {
      if (grid[c.x][c.y] > 0) return false;
    }

    return true;
  }

  can_walk(grid) {
    var walkable = false;
    for (var c of this.cells) {
      walkable |= (grid[c.x-1][c.y-1] > 0);
      walkable |= (grid[c.x-1][c.y  ] > 0);
      walkable |= (grid[c.x-1][c.y+1] > 0);
      walkable |= (grid[c.x  ][c.y-1] > 0);
      walkable |= (grid[c.x  ][c.y+1] > 0);
      walkable |= (grid[c.x+1][c.y-1] > 0);
      walkable |= (grid[c.x+1][c.y  ] > 0);
      walkable |= (grid[c.x+1][c.y+1] > 0);
    }

    if (!walkable) return false;
    return true;
  }

  place(grid, delta) {
    for (var c of this.cells) {
      grid[c.x][c.y] += delta;
    }
  }
}

//**** Solver code ****//
function solve_bridge(pieces, enter_ori, exit) {
  // Large to have scratch space.
  var grid = Array(100);
  for (var x = 0; x < 100; x++) grid[x] = Array(100).fill(0);
  grid[50][50] = 1; // Initial bridge segment

  var position = null;
  switch (enter_ori) { // Set the starting position relative to the initial ori
    case NORTH: position = loc(49, 50, NORTH); break;
    case SOUTH: position = loc(51, 50, SOUTH); break;
    case EAST:  position = loc(50, 51, EAST); break;
    case WEST:  position = loc(50, 49, WEST); break;
  }

  console.info("Building a bridge with these pieces:");
  for (var p of pieces) console.info(p.print());

  var solutions = [];
  solve_bridge_recursive(
    grid,
    pieces,
    position,
    loc(exit.x+50, exit.y+50, exit.ori), // exit
    [], // DFS buffer
    solutions, // output solutions
  );
  return solutions;
}

function solve_bridge_reverse(pieces, enter_ori, exit) {
  // Large to have scratch space.
  var grid = Array([], 100);
  for (var x = 0; x < 100; x++) grid[x] = Array(0, 100);
  grid[51][50] = 1; // The first piece is always at 50,50

  reversed_pieces = [];
  for (var i = 0; i < pieces.length; i++) {
    var p = pieces[i];
    var q = new Piece(p.shape, p.enter, p.exit);
    switch (p.enter.ori) {
      case NORTH: q.exit = loc(p.enter.x + 1, p.enter.y, SOUTH); break;
      case SOUTH: q.exit = loc(p.enter.x - 1, p.enter.y, NORTH); break;
      case EAST:  q.exit = loc(p.enter.x, p.enter.y - 1, WEST); break;
      case WEST:  q.exit = loc(p.enter.x, p.enter.y + 1, EAST); break;
    }
    switch (p.exit.ori) {
      case NORTH: q.enter = loc(p.exit.x + 1, p.exit.y, SOUTH); break;
      case SOUTH: q.enter = loc(p.exit.x - 1, p.exit.y, NORTH); break;
      case EAST:  q.enter = loc(p.exit.x, p.exit.y - 1, WEST); break;
      case WEST:  q.enter = loc(p.exit.x, p.exit.y + 1, EAST); break;
    }
    
    reversed_pieces[pieces.length - i - 1] = q;
  }
  
  console.info("Building a bridge with these pieces:");
  for (var p of reversed_pieces) console.info(p.print());

  var solutions = [];
  solve_bridge_recursive(
    grid,
    reversed_pieces,
    loc(50, 50, enter_ori), // position
    loc(50 + exit.x, 50 + exit.y, exit.ori), // exit
    [], // DFS buffer
    solutions, // output solutions
  );
  return solutions
}

function solve_bridge_recursive(grid, pieces, position, exit, steps, solutions) {
  for (var i = 0; i < pieces.length; i++) {
    var p = pieces[i];
    if (p.placed) continue;

    for (var flip of [false, true]) {
      // First, try placing the piece normally.
      {
        var q = p.transform(position, flip, null);
        // If this piece does not fit on the grid, then flipswaps won't work either.
        if (!q.can_place(grid)) continue;

        steps.push([p, flip, null]);
        q.place(grid, +1);
        pieces[i].placed = true;
        solve_bridge_recursive(grid, pieces, q.exit, exit, steps, solutions);
        pieces[i].placed = false;
        q.place(grid, -1);
        steps.pop();
      }

      // Given that the piece was placeable, we can try running a flipswap.
      var prev_piece = null;
      var next_piece = null;
      for (var j = 1; j < pieces.length; j++) {
        var k = (i + j) % pieces.length;
        if (!pieces[k].placed) prev_piece = pieces[k];
        k = (i - j + pieces.length) % pieces.length;
        if (!pieces[k].placed) next_piece = pieces[k];
      }

      // Flipswap backwards (i.e. target = previous piece)
      if (prev_piece != null) {
        var q = prev_piece.transform(position, flip, p);
        // Flipswaps don't care about target placement safety.
        // However, we do care that the pathway is still walkable.
        if (!q.can_walk(grid)) continue;

        steps.push([p, flip, prev_piece]);
        q.place(grid, +1);
        prev_piece.placed = true;
        solve_bridge_recursive(grid, pieces, q.exit, exit, steps, solutions);
        prev_piece.placed = false;
        q.place(grid, -1);
        steps.pop();
      }

      // Flipswap forwards (i.e. target = next piece)
      if (prev_piece != next_piece) {
        var q = next_piece.transform(position, flip, p);
        // Flipswaps don't care about target placement safety.
        // However, we do care that the pathway is still walkable.
        if (!q.can_walk(grid)) continue;

        steps.push([p, flip, next_piece]);
        q.place(grid, +1);
        next_piece.placed = true;
        solve_bridge_recursive(grid, pieces, q.exit, exit, steps, solutions);
        next_piece.placed = false;
        q.place(grid, -1);
        steps.pop();
      }
    }
  }
  
  var solution = {
    'name': '',
    'exit': loc(position.x, position.y, position.ori),
    'grid': window.print_grid(grid, exit, null),
  };
    
  for (var step of steps) {
    var piece = step[0];
    var name = piece.shape + pieces.indexOf(piece); // there may be multiple pieces with the same shape
    if (step[1]) name += "'"; // flip
    var target = step[2]; // flipswap target
    if (target != null) {
      name = `(${name}-${target.shape}${pieces.indexOf(target)})`;

      var bridge_is_safe = false;
      switch (target.enter.ori) {
        case NORTH: bridge_is_safe = grid[target.enter.x + 1][target.enter.y] > 0; break;
        case SOUTH: bridge_is_safe = grid[target.enter.x - 1][target.enter.y] > 0; break;
        case EAST:  bridge_is_safe = grid[target.enter.x][target.enter.y - 1] > 0; break;
        case WEST:  bridge_is_safe = grid[target.enter.x][target.enter.y + 1] > 0; break;
      }
      if (!bridge_is_safe) name = "!" + name;
    }

    if (solution.name.length != 0) solution.name += ", ";
    solution.name += name;
  }

  solutions.push(solution);
}
