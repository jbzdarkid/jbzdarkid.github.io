function drawSymbol(params/*, width, height*/) {
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 ' + params.width + ' ' + params.height)
  if (!params.x) params.x = 0
  if (!params.y) params.y = 0
  drawSymbolWithSvg(svg, params)
  return svg
}

function drawSymbolWithSvg(svg, params) {
  if (params.type == 'square') _square(svg, params)
  else if (params.type == 'dot') _dot(svg, params)
  else if (params.type == 'gap') _gap(svg, params)
  else if (params.type == 'star') _star(svg, params)
  else if (params.type == 'poly') _poly(svg, params)
  else if (params.type == 'ylop') _ylop(svg, params)
  else if (params.type == 'nega') _nega(svg, params)
  else if (params.type == 'nonce') {} // Do nothing
  else if (params.type == 'triangle') _triangle(svg, params)
  else if (params.type == 'crayon') _crayon(svg, params)
  else if (params.type == 'start') _start(svg, params)
  else if (params.type == 'end') _end(svg, params)
  else console.error('Unknown symbol type in params: ' + JSON.stringify(params))
}

function _square(svg, params) {
  var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  svg.appendChild(rect)
  rect.setAttribute('width', 28)
  rect.setAttribute('height', 28)
  rect.setAttribute('x', params.width/2-14 + params.x)
  rect.setAttribute('y', params.height/2-14 + params.y)
  rect.setAttribute('rx', 7)
  rect.setAttribute('ry', 7)
  rect.setAttribute('fill', params.color)
}

function _star(svg, params) {
  var poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
  svg.appendChild(poly)
  var points = [
    '-10.5 -10.5', // Top left
    '-9.5 -4',
    '-15 0',
    '-9.5 4',
    '-10.5 10.5', // Bottom left
    '-4 9.5',
    '0 15',
    '4 9.5',
    '10.5 10.5', // Bottom right
    '9.5 4',
    '15 0',
    '9.5 -4',
    '10.5 -10.5', // Top right
    '4, -9.5',
    '0 -15',
    '-4 -9.5',
  ]
  poly.setAttribute('transform', 'translate(' + (params.width/2 + params.x) + ', ' + (params.height/2 + params.y) + ')')
  poly.setAttribute('points', points.join(', '))
  poly.setAttribute('fill', params.color)
}

function _poly(svg, params) {
  if (params.polyshape == 0) return
  var size = 10 // Side length of individual squares in the polyomino
  var space = 4 // Gap between squares in the polyomino
  var polyomino = polyominoFromPolyshape(params.polyshape)

  var bounds = {'xmin':0, 'xmax':0, 'ymin':0, 'ymax':0}
  for (var pos of polyomino) {
    bounds.xmin = Math.min(bounds.xmin, pos.x)
    bounds.xmax = Math.max(bounds.xmax, pos.x)
    bounds.ymin = Math.min(bounds.ymin, pos.y)
    bounds.ymax = Math.max(bounds.ymax, pos.y)
  }
  var offset = (size+space)/2 // Offset between paramsents to create the gap
  var center_x = (params.width - size - offset * (bounds.xmax + bounds.xmin)) / 2 + params.x
  var center_y = (params.height - size - offset * (bounds.ymax + bounds.ymin)) / 2 + params.y

  for (var pos of polyomino) {
    var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    svg.appendChild(rect)
    var transform = 'translate('+(center_x+pos.x*offset)+', '+(center_y+pos.y*offset)+')'
    if (params.rot == 'all') {
      // -30 degree rotation around the midpoint of the square
      transform = 'rotate(-30, ' + (params.width/2 + params.x) + ', ' + (params.height/2 + params.y) + ') ' + transform
    }
    rect.setAttribute('transform', transform)
    rect.setAttribute('height', size)
    rect.setAttribute('width', size)
    rect.setAttribute('fill', params.color)
  }
}

function _ylop(svg, params) {
  if (params.polyshape == 0) return
  var size = 12 // Side length of individual squares in the polyomino
  var space = 2 // Gap between squares in the polyomino
  var polyomino = polyominoFromPolyshape(params.polyshape)

  var bounds = {'xmin':0, 'xmax':0, 'ymin':0, 'ymax':0}
  for (var pos of polyomino) {
    bounds.xmin = Math.min(bounds.xmin, pos.x)
    bounds.xmax = Math.max(bounds.xmax, pos.x)
    bounds.ymin = Math.min(bounds.ymin, pos.y)
    bounds.ymax = Math.max(bounds.ymax, pos.y)
  }
  var offset = (size+space)/2 // Offset between paramsents to create the gap
  var center_x = (params.width - size - offset * (bounds.xmax + bounds.xmin)) / 2 + params.x
  var center_y = (params.height - size - offset * (bounds.ymax + bounds.ymin)) / 2 + params.y

  for (var pos of polyomino) {
    var poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
    svg.appendChild(poly)
    var points = [
      '0 0', '12 0', '12 12', '0 12', '0 3',
      '3 3', '3 9', '9 9', '9 3', '0 3',
    ]
    poly.setAttribute('points', points.join(', '))
    var transform = 'translate('+(center_x+pos.x*offset)+', '+(center_y+pos.y*offset)+')'
    if (params.rot == 'all') {
      // -30 degree rotation around the midpoint of the square
      transform = 'rotate(-30, ' + (params.width/2 + params.x) + ', ' + (params.height/2 + params.y) + ') ' + transform
    }
    poly.setAttribute('transform', transform)
    poly.setAttribute('fill', params.color)
  }
}

// Adjusted 1 pixel down because it looks better
function _nega(svg, params) {
  for (var degrees of [60, 180, 300]) {
    var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    svg.appendChild(rect)
    rect.setAttribute('height', 10.5)
    rect.setAttribute('width', 6)
    rect.setAttribute('x', params.width/2 - 3 + params.x)
    rect.setAttribute('y', params.height/2 + 1 + params.y)
    rect.setAttribute('transform', 'rotate(' + degrees + ', ' + (params.width/2 + params.x) + ', ' + (params.height/2 + 1 + params.y) + ')')
    rect.setAttribute('fill', params.color)
  }
}

function _triangle(svg, params) {
  for (var i=0; i<params.count; i++) {
    var poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
    svg.appendChild(poly)
    poly.setAttribute('points', '0 0, -8 14, 8 14')
    var x_offset = params.width/2 - 11*(params.count - 1) + 22*i + params.x
    var y_offset = params.height/2 - 7 + params.y
    poly.setAttribute('transform', 'translate(' + x_offset + ', ' + y_offset + ')')
    poly.setAttribute('fill', params.color)
  }
}

function _crayon(svg, params) {
  var height = params.height
  var width = params.width
  var border = 2

  var poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
  svg.appendChild(poly)
  var points = [
    '0 ' + (height/2),
    (height/2) + ' 0',
    width + ' 0',
    width + ' ' + (height-border),
    (width-border) + ' ' + (height-border),
    (width-border) + ' ' + border,
    (height/2+border) + ' ' + border,
    (height/2+border) + ' ' + (height-border),
    width + ' ' + (height-border),
    width + ' ' + height,
    (height/2) + ' ' + height,
  ]
  poly.setAttribute('points', points.join(', '))
  poly.setAttribute('fill', params.color)
  var txt = document.createElementNS('http://www.w3.org/2000/svg', 'text')
  svg.appendChild(txt)
  txt.setAttribute('transform', 'translate(' + (height/2 + 10) + ', ' + (height/2 + 6) + ')')
  txt.innerHTML = params.text
}

function _start(svg, params) {
  var circ = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
  svg.appendChild(circ)
  circ.setAttribute('r', 24)
  circ.setAttribute('fill', FOREGROUND)
  circ.setAttribute('cx', params.height/2 + params.x)
  circ.setAttribute('cy', params.width/2 + params.y)
}

function _end(svg, params) {
  var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  svg.appendChild(rect)
  rect.setAttribute('width', 24)
  rect.setAttribute('height', 24)
  rect.setAttribute('fill', FOREGROUND)
  rect.setAttribute('x', params.height/2 - 12 + params.x)
  rect.setAttribute('y', params.width/2 - 12 + params.y)

  var circ = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
  svg.appendChild(circ)
  circ.setAttribute('r', 12)
  circ.setAttribute('fill', FOREGROUND)
  circ.setAttribute('cx', params.height/2 + params.x)
  circ.setAttribute('cy', params.width/2 + params.y)

  if (params.dir == 'left') {
    rect.setAttribute('x', parseInt(rect.getAttribute('x')) - 12)
    circ.setAttribute('cx', parseInt(circ.getAttribute('cx')) - 24)
  } else if (params.dir == 'right') {
    rect.setAttribute('x', parseInt(rect.getAttribute('x')) + 12)
    circ.setAttribute('cx', parseInt(circ.getAttribute('cx')) + 24)
  } else if (params.dir == 'top') {
    rect.setAttribute('y', parseInt(rect.getAttribute('y')) - 12)
    circ.setAttribute('cy', parseInt(circ.getAttribute('cy')) - 24)
  } else if (params.dir == 'bottom') {
    rect.setAttribute('y', parseInt(rect.getAttribute('y')) + 12)
    circ.setAttribute('cy', parseInt(circ.getAttribute('cy')) + 24)
  } else {
    console.error('Endpoint direction not defined!', JSON.stringify(params))
  }
}

function _dot(svg, params) {
  var hex = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
  svg.appendChild(hex)
  hex.setAttribute('points', '5.2 9, 10.4 0, 5.2 -9, -5.2 -9, -10.4 0, -5.2 9')
  hex.setAttribute('transform', 'translate(' + (params.width/2 + params.x) + ', ' + (params.height/2 + params.y) + ')')
  hex.setAttribute('fill', 'black')
}

function _gap(svg, params) {
  if (!params.rot) params.rot = 0
  var center_x = params.height/2 + params.x
  var center_y = params.width/2 + params.y
  var rotate = function(degrees) {return 'rotate(' + degrees + ', ' + center_x + ', ' + center_y + ')'}

  var circ = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
  circ.setAttribute('r', 12)
  circ.setAttribute('fill', FOREGROUND)
  circ.setAttribute('cx', center_x - 41)
  circ.setAttribute('cy', center_y)
  if (params.rot == 0) {
    svg.appendChild(circ.cloneNode())
    circ.setAttribute('transform', rotate(180))
    svg.appendChild(circ)
  } else if (params.rot == 1) {
    circ.setAttribute('transform', rotate(90))
    svg.appendChild(circ.cloneNode())
    circ.setAttribute('transform', rotate(270))
    svg.appendChild(circ)
  }

  var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  svg.appendChild(rect)
  rect.setAttribute('width', 32)
  rect.setAttribute('height', 24)
  rect.setAttribute('fill', FOREGROUND)
  rect.setAttribute('x', center_x - 41)
  rect.setAttribute('y', center_y - 12)
  if (params.rot == 0) {
    svg.appendChild(rect.cloneNode())
    rect.setAttribute('transform', rotate(180))
    svg.appendChild(rect)
  } else if (params.rot == 1) {
    rect.setAttribute('transform', rotate(90))
    svg.appendChild(rect.cloneNode())
    rect.setAttribute('transform', rotate(270))
    svg.appendChild(rect)
  }
}
