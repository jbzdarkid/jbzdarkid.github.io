function draw(puzzle, target='puzzle') {
  console.log('Drawing', puzzle, 'into', target)
  if (puzzle == undefined) return
  var table = document.getElementById(target)
  while (table.rows.length > 0) {
    table.deleteRow(0)
  }
  table.setAttribute('cellspacing', '0px')
  table.setAttribute('cellpadding', '0px')
  table.style.padding = 25
  table.style.background = BACKGROUND
  table.style.border = BORDER

  for (var x=0; x<puzzle.grid.length; x++) {
    var row = table.insertRow(x)
    for (var y=0; y<puzzle.grid[x].length; y++) {
      var cell = row.insertCell(y)
      // Basic cell types, flagging only certain elements as 'trace', as in 'traceable'
      if (x%2 == 0 && y%2 == 0) {
        cell.className = 'corner trace'
        cell.setAttribute('height', 24)
        cell.setAttribute('width', 24)
        cell.style.background = FOREGROUND
      } else if (x%2 == 0 && y%2 == 1) {
        cell.className = 'horiz trace'
        cell.setAttribute('height', 24)
        cell.setAttribute('width', 58)
        cell.style.background = FOREGROUND
      } else if (x%2 == 1 && y%2 == 0) {
        cell.className = 'verti trace'
        cell.setAttribute('height', 58)
        cell.setAttribute('width', 24)
        cell.style.background = FOREGROUND
      } else if (x%2 == 1 && y%2 == 1) {
        cell.className = 'center'
        cell.setAttribute('height', 58)
        cell.setAttribute('width', 58)
        cell.style.background = BACKGROUND
      }
      // If there's a solution present for the grid, draw it (poorly)
      if (puzzle.grid[x][y] == true) {
        cell.style.background = LINE_SUCCESS
      }
      // Grid corners are rounded on non-pillar puzzles
      if (!puzzle.pillar) {
        if (x == 0 && y == 0) {
          cell.style.borderTopLeftRadius = '12px'
        } else if (x == 0 && y == puzzle.grid[x].length-1) {
          cell.style.borderTopRightRadius = '12px'
        } else if (x == puzzle.grid.length-1 && y == 0) {
          cell.style.borderBottomLeftRadius = '12px'
        } else if (x == puzzle.grid.length-1 && y == puzzle.grid[x].length-1) {
          cell.style.borderBottomRightRadius = '12px'
        }
      }
      cell.id = target+'_'+x+'_'+y

      if (x == puzzle.start.x && y == puzzle.start.y) {
        var div = document.createElement('div')
        // Resize, round, and color
        div.style.height = 48
        div.style.width = 48
        div.style.borderRadius = '50%'
        var start_color = FOREGROUND
        if (puzzle.grid[x][y] == true) {
          start_color = LINE_SUCCESS
        }
        div.style.background = start_color
        // Shift into place
        div.style.top = -12
        div.style.left = -12
        div.style.position = 'absolute' // Prevents resizing the rest of the table
        // div.className = 'start trace'
        div.className = 'selected_start trace' // Named for the animation
        div.id = cell.id // Rename the div and cell so that tracing happens on the div
        cell.id += '_parent'

        cell.style.position = 'relative' // Positions div relative to this cell
        cell.appendChild(div)
        cell.onclick = function() {trace(this, puzzle)}
      } else if (typeof puzzle.grid[x][y] == 'object') {
        cell.appendChild(drawSymbol(puzzle.grid[x][y]))
      }
    }
  }

  // FIXME: puzzle.end is correct (new syntax), but table references are reversed x/y
  table.rows[puzzle.end.x].cells[puzzle.end.y].style.borderRadius = '0px'
  var end_color = FOREGROUND
  if (puzzle.grid[puzzle.end.x][puzzle.end.y]) {
    end_color = LINE_SUCCESS
  }
  if (puzzle.end.y == 0) {
    for (var x=0; x<puzzle.grid.length; x++) {
      var cell = table.rows[x].insertCell(0)
      if (x == puzzle.end.x) {
        cell.className = 'end_left trace'
        cell.style.borderTopLeftRadius = '12px'
        cell.style.borderBottomLeftRadius = '12px'
        cell.style.position = 'relative'
        cell.style.height = 24
        cell.style.width = 24
        cell.id = target+'_'+puzzle.end.x+'_'+(puzzle.end.y-1)
        cell.style.background = end_color
        table.style.paddingLeft = '10px'
      }
    }
  } else if (puzzle.end.y == puzzle.grid[puzzle.end.x].length-1) {
    for (var x=0; x<puzzle.grid.length; x++) {
      var cell = table.rows[x].insertCell(-1)
      if (x == puzzle.end.x) {
        cell.className = 'end_right trace'
        cell.style.borderTopRightRadius = '12px'
        cell.style.borderBottomRightRadius = '12px'
        cell.style.position = 'relative'
        cell.style.height = 24
        cell.style.width = 24
        cell.id = target+'_'+puzzle.end.x+'_'+(puzzle.end.y+1)
        cell.style.background = end_color
        table.style.paddingRight = '10px'
      }
    }
  } else if (puzzle.end.x == 0) {
    var row = table.insertRow(0)
    for (var x=0; x<puzzle.grid[puzzle.end.x].length; x++) {
      var cell = row.insertCell(x)
      if (x == puzzle.end.y) {
        cell.className = 'end_up trace'
        cell.style.borderTopLeftRadius = '12px'
        cell.style.borderTopRightRadius = '12px'
        cell.style.position = 'relative'
        cell.style.height = 24
        cell.style.width = 24
        cell.id = target+'_'+(puzzle.end.x-1)+'_'+puzzle.end.y
        cell.style.background = end_color
        table.style.paddingTop = '10px'
      }
    }
  } else if (puzzle.end.x == puzzle.grid.length-1) {
    var row = table.insertRow(-1)
    for (var x=0; x<puzzle.grid[puzzle.end.x].length; x++) {
      var cell = row.insertCell(x)
      if (x == puzzle.end.y) {
        cell.className = 'end_down trace'
        cell.style.borderBottomLeftRadius = '12px'
        cell.style.borderBottomRightRadius = '12px'
        cell.style.position = 'relative'
        cell.style.height = 24
        cell.style.width = 24
        cell.id = target+'_'+(puzzle.end.x+1)+'_'+puzzle.end.y
        cell.style.background = end_color
        table.style.paddingBottom = '10px'
      }
    }
  }

  for (var dot of puzzle.dots) {
    var cell = document.getElementById(target+'_'+dot.x+'_'+dot.y)
    var params = {'type':'dot', 'color':'black'}
    params.width = parseInt(window.getComputedStyle(cell).width)
    params.height = parseInt(window.getComputedStyle(cell).height)
    cell.appendChild(drawSymbol(params))
  }
  for (var gap of puzzle.gaps) {
    var cell = document.getElementById(target+'_'+gap.x+'_'+gap.y)
    if (cell.className.startsWith('gap')) continue
    cell.className = 'gap '+cell.className
    var params = {'type':'gap', 'rot': gap.x%2}
    params.width = parseInt(window.getComputedStyle(cell).width)
    params.height = parseInt(window.getComputedStyle(cell).height)
    cell.appendChild(drawSymbol(params))
    cell.style.background = BACKGROUND
  }
}
