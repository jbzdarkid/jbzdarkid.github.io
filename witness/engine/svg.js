function drawSymbol(params) {
  if (params.type == 'square') {
    return _square(params)
  } else if (params.type == 'dot') {
    return _dot(params)
  } else if (params.type == 'gap') {
    return _gap(params) // Maybe not?
  } else if (params.type == 'star') {
    return _star(params)
  } else if (params.type == 'poly') {
    return _poly(params)
  } else if (params.type == 'ylop') {
    return _ylop(params)
  } else if (params.type == 'nega') {
    return _nega(params)
  } else if (params.type == 'nonce') {
    return document.createElement('null')
  } else if (params.type == 'triangle') {
    return _triangle(params)
  } else if (params.type == 'crayon') {
    return _crayon(params)
  } else if (params.type == 'start') {
    return _start(params)
  } else if (params.type == 'end') {
    return _end(params)
  } else {
    throw 'Unknown symbol type in params: ' + JSON.stringify(params)
  }
}

function _square(params) {
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 ' + params.width + ' ' + params.height)
  var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  rect.setAttribute('transform', 'translate(15, 15)')
  rect.setAttribute('width', 28)
  rect.setAttribute('height', 28)
  rect.setAttribute('x', params.width/2-28)
  rect.setAttribute('y', params.height/2-28)
  rect.setAttribute('rx', 7)
  rect.setAttribute('ry', 7)
  rect.setAttribute('fill', params.color)
  svg.appendChild(rect)
  return svg
}

function _star(params) {
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 ' + params.width + ' ' + params.height)
  var poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
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
  poly.setAttribute('points', points.join(', '))
  poly.setAttribute('fill', params.color)
  poly.setAttribute('transform', 'translate(' + params.width/2 + ', ' + params.height/2 + ')')
  svg.appendChild(poly)
  return svg
}

function _poly(params) {
  var size = 10 // Side length of individual squares in the polyomino
  var space = 4 // Gap between squares in the polyomino
  if (params.polyshape) {
    var polyomino = polyominoFromPolyshape(params.polyshape)
  } else {
    // Select the first (potentially only) rotation of the paramsent.
    var polyomino = getPolyomino(params.size, params.shape, params.rot)[0]
  }

  var bounds = {'xmin':0, 'xmax':0, 'ymin':0, 'ymax':0}
  for (var pos of polyomino) {
    bounds.xmin = Math.min(bounds.xmin, pos.x)
    bounds.xmax = Math.max(bounds.xmax, pos.x)
    bounds.ymin = Math.min(bounds.ymin, pos.y)
    bounds.ymax = Math.max(bounds.ymax, pos.y)
  }
  var offset = (size+space)/2 // Offset between paramsents to create the gap
  var center_x = (params.width - size - offset * (bounds.xmax + bounds.xmin)) / 2
  var center_y = (params.height - size - offset * (bounds.ymax + bounds.ymin)) / 2

  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 ' + params.width + ' ' + params.height)
  for (var pos of polyomino) {
    var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    var transform = 'translate('+(center_y+pos.y*offset)+', '+(center_x+pos.x*offset)+')'
    if (params.rot == 'all') {
      // -30 degree rotation around the midpoint of the square
      transform = 'rotate(-30, ' + params.width/2 + ', ' + params.height/2 + ') ' + transform
    }
    rect.setAttribute('transform', transform)
    rect.setAttribute('height', size)
    rect.setAttribute('width', size)
    rect.setAttribute('fill', params.color)
    svg.appendChild(rect)
  }
  return svg
}

function _ylop(params) {
  var size = 12 // Side length of individual squares in the polyomino
  var space = 2 // Gap between squares in the polyomino
  if (params.polyshape) {
    var polyomino = polyominoFromPolyshape(params.polyshape)
  } else {
    // Select the first (potentially only) rotation of the paramsent.
    var polyomino = getPolyomino(params.size, params.shape, params.rot)[0]
  }

  var bounds = {'xmin':0, 'xmax':0, 'ymin':0, 'ymax':0}
  for (var pos of polyomino) {
    bounds.xmin = Math.min(bounds.xmin, pos.x)
    bounds.xmax = Math.max(bounds.xmax, pos.x)
    bounds.ymin = Math.min(bounds.ymin, pos.y)
    bounds.ymax = Math.max(bounds.ymax, pos.y)
  }
  var offset = (size+space)/2 // Offset between paramsents to create the gap
  var center_x = (params.width - size - offset * (bounds.xmax + bounds.xmin)) / 2
  var center_y = (params.height - size - offset * (bounds.ymax + bounds.ymin)) / 2

  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 ' + params.width + ' ' + params.height)
  for (var pos of polyomino) {
    var poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
    var points = [
      '0 0', '12 0', '12 12', '0 12', '0 3',
      '3 3', '3 9', '9 9', '9 3', '0 3',
    ]
    poly.setAttribute('points', points.join(', '))
    var transform = 'translate('+(center_y+pos.y*offset)+', '+(center_x+pos.x*offset)+')'
    if (params.rot == 'all') {
      // -30 degree rotation around the midpoint of the square
      transform = 'rotate(-30, ' + params.width/2 + ', ' + params.height/2 + ') ' + transform
    }
    poly.setAttribute('transform', transform)
    poly.setAttribute('fill', params.color)
    svg.appendChild(poly)
  }
  return svg
}

// FIXME: Exact sizing
function _nega(params) {
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 50 50')
  for (var rot of [60, 180, 300]) {
    var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('transform', 'translate(22, 27) rotate('+rot+', 3, 0)')
    rect.setAttribute('height', 12)
    rect.setAttribute('width', 6)
    rect.setAttribute('fill', params.color)
    svg.appendChild(rect)
  }
  return svg
}

// FIXME: Sizing looks wrong?
function _triangle(params) {
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 ' + params.width + ' ' + params.height)
  for (var i=0; i<params.count; i++) {
    var poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
    poly.setAttribute('points', '0 0, -8 14, 8 14')
    var x_offset = (params.width - 22*(params.count - 1)) / 2 + 22*i
    poly.setAttribute('transform', 'translate(' + x_offset + ', ' + (params.height/2 - 7) + ')')
    poly.setAttribute('fill', params.color)
    svg.appendChild(poly)
  }
  return svg
}

function _crayon(params) {
  var height = 35
  var width = 125 + height/2
  var border = 2

  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height)
  var poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
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
  svg.appendChild(poly)
  var txt = document.createElementNS('http://www.w3.org/2000/svg', 'text')
  txt.setAttribute('transform', 'translate(25, 25)')
  txt.innerHTML = params.color
  svg.appendChild(txt)
  return svg
}

function _start(params) {
  console.log(JSON.stringify(params))
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 ' + params.height + ' ' + params.width)
  var circ = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
  circ.setAttribute('r', 24)
  circ.setAttribute('fill', FOREGROUND)
  circ.setAttribute('cx', params.height/2)
  circ.setAttribute('cy', params.width/2)
  svg.appendChild(circ)
  return svg
}

function _end(params) {
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 ' + params.height + ' ' + params.width)
  var circ = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
  circ.setAttribute('r', 12)
  circ.setAttribute('fill', FOREGROUND)
  circ.setAttribute('cx', params.height/2)
  circ.setAttribute('cy', params.width/2 - 3)
  svg.appendChild(circ)
  var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  rect.setAttribute('width', 24)
  rect.setAttribute('height', 18)
  rect.setAttribute('fill', FOREGROUND)
  rect.setAttribute('x', params.height/2 - 12)
  rect.setAttribute('y', params.width/2 - 3)
  svg.appendChild(rect)
  return svg
}

function _dot(params) {
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 ' + params.width + ' ' + params.height)
  var hex = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
  hex.setAttribute('points', '5.2 9, 10.4 0, 5.2 -9, -5.2 -9, -10.4 0, -5.2 9')
  hex.setAttribute('transform', 'translate(' + params.width/2 + ', ' + params.height/2 + ')')
  hex.setAttribute('fill', 'black')
  svg.appendChild(hex)
  return svg
}

function _gap(params) {
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 '+params.width+' '+params.height)
  var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  if (params.rot == 0) {
    rect.setAttribute('x', (params.width-58)/2)
    rect.setAttribute('y', (params.height-24)/2)
    rect.setAttribute('width', 20)
    rect.setAttribute('height', 24)
    rect.setAttribute('fill', FOREGROUND)
    svg.appendChild(rect.cloneNode())
    rect.setAttribute('x', (params.width+18)/2)
    svg.appendChild(rect)
  } else { // if (params.rot == 1) {
    rect.setAttribute('x', (params.width-24)/2)
    rect.setAttribute('y', (params.height-58)/2)
    rect.setAttribute('width', 24)
    rect.setAttribute('height', 20)
    rect.setAttribute('fill', FOREGROUND)
    svg.appendChild(rect.cloneNode())
    rect.setAttribute('y', (params.height+18)/2)
    svg.appendChild(rect)
  }
  return svg
}