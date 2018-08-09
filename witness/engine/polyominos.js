function getPolyomino(size=null, shape=null, rot=null) {
  if (size == null) {
    return Object.keys(POLYOMINOS)
  }
  if (shape == null) {
    return Object.keys(POLYOMINOS[size])
  }
  if (rot == null) {
    return POLYOMINOS[size][shape].length
  } else if (rot == 'all') {
    return POLYOMINOS[size][shape]
  } else {
    rot %= POLYOMINOS[size][shape].length
    return [POLYOMINOS[size][shape][rot]]
  }
}

function getPolySize(polyshape) {
  var size = 0
  for (var x=0; x<4; x++) {
    for (var y=0; y<4; y++) {
      if (_isSet(polyshape, x, y)) size++
    }
  }
  return size
}

function _mask(x, y) {
  return 1 << (x*4 + y)
}
function _isSet(polyshape, x, y) {
  return (polyshape & _mask(x, y)) != 0
}

function getRotations(polyshape, rot=null) {
  if (rot != 'all') return [polyshape]

  var rotations = [0, 0, 0, 0]
  for (var x=0; x<4; x++) {
    for (var y=0; y<4; y++) {
      if (_isSet(polyshape, x, y)) {
        rotations[0] ^= _mask(x, y)
        rotations[1] ^= _mask(y, 4-x)
        rotations[2] ^= _mask(4-x, 4-y)
        rotations[3] ^= _mask(4-y, x)
      }
    }
  }
  return rotations
}

function polyominoFromPolyshape(polyshape) {
  var topLeft = {'x':4, 'y':4}
  var polyomino = []

  for (var x=0; x<4; x++) {
    for (var y=0; y<4; y++) {
      if (_isSet(polyshape, x, y)) {
        polyomino.push({'x':x, 'y':y})
        if (x < topLeft.x || (x == topLeft.x && y < topLeft.y)) {
          topLeft = {'x':x, 'y':y}
        }
      }
    }
  }
  
  for (var i=0; i<polyomino.length; i++) {
    polyomino[i] = {
      'x':2*(polyomino[i].x - topLeft.x),
      'y':2*(polyomino[i].y - topLeft.y)
    }
  }
  return polyomino
}

// IMPORTANT NOTE: When formulating these, the top-left must be 0, 0.
// That means there can never be any negative x values.
POLYOMINOS = {
    '1':{
    'O':[[
            {'x':0, 'y':0}
        ]],
  },'2':{
    'I':[[
            {'x':0, 'y':0},
            {'x':2, 'y':0}
        ],[
            {'x':0, 'y':0}, {'x':0, 'y':2}
        ]],
    '/':[[
                            {'x':0, 'y':0},
            {'x':2, 'y':-2}
        ],[
            {'x':0, 'y':0},
                            {'x':2, 'y':2}
        ]],
  },'3':{
    'I':[[
            {'x':0, 'y':0},
            {'x':2, 'y':0},
            {'x':4, 'y':0}
        ],[
            {'x':0, 'y':0}, {'x':0, 'y':2}, {'x':0, 'y':4}
        ]],
    'L':[[
            {'x':0, 'y':0},
            {'x':2, 'y':0}, {'x':2, 'y':2}
        ],[
            {'x':0, 'y':0}, {'x':0, 'y':2},
            {'x':2, 'y':0}
        ],[
            {'x':0, 'y':0}, {'x':0, 'y':2},
                            {'x':2, 'y':2}
        ],[
                             {'x':0, 'y':0},
            {'x':2, 'y':-2}, {'x':2, 'y':0}
        ]],
    'V':[[
            {'x':0, 'y':0},                 {'x':0, 'y':4},
                            {'x':2, 'y':2}
        ],[
                            {'x':0, 'y':0},
            {'x':2, 'y':-2},
                            {'x':4, 'y':0}
        ],[
                            {'x':0, 'y':0},
            {'x':2, 'y':-2},                {'x':2, 'y':2},
        ],[
            {'x':0, 'y':0},
                            {'x':2, 'y':2},
            {'x':4, 'y':0}
        ]],
    'N':[[
                            {'x':0, 'y':0},
                            {'x':2, 'y':0},
            {'x':4, 'y':-2}
        ],[
            {'x':0, 'y':0},
                            {'x':2, 'y':2}, {'x':2, 'y':4}
        ],[
                            {'x':0, 'y':0},
            {'x':2, 'y':-2},
            {'x':4, 'y':-2}
        ],[
                            {'x':0, 'y':0}, {'x':0, 'y':2},
            {'x':2, 'y':-2},
        ]],
    'M':[[
            {'x':0, 'y':0},
            {'x':2, 'y':0},
                            {'x':4, 'y':2}
        ],[
                            {'x':0, 'y':0}, {'x':0, 'y':2},
            {'x':2, 'y':-2}
        ],[
            {'x':0, 'y':0},
                            {'x':2, 'y':2},
                            {'x':4, 'y':2}
        ],[
                                            {'x':0, 'y':0},
            {'x':2, 'y':-4}, {'x':2, 'y':-2},
        ]],
  },'4':{
    'I':[[
            {'x':0, 'y':0},
            {'x':2, 'y':0},
            {'x':4, 'y':0},
            {'x':6, 'y':0}
        ],[
            {'x':0, 'y':0}, {'x':0, 'y':2}, {'x':0, 'y':4}, {'x':0, 'y':6}
        ]],
    'J':[[
                             {'x':0, 'y':0},
                             {'x':2, 'y':0},
            {'x':4, 'y':-2}, {'x':4, 'y':0}
        ],[
            {'x':0, 'y':0},
            {'x':2, 'y':0}, {'x':2, 'y':2}, {'x':2, 'y':4}
        ],[
            {'x':0, 'y':0}, {'x':0, 'y':2},
            {'x':2, 'y':0},
            {'x':4, 'y':0}
        ],[
            {'x':0, 'y':0}, {'x':0, 'y':2}, {'x':0, 'y':4},
                                            {'x':2, 'y':4}
        ]],
    'L':[[
            {'x':0, 'y':0},
            {'x':2, 'y':0},
            {'x':4, 'y':0}, {'x':4, 'y':2}
        ],[
            {'x':0, 'y':0}, {'x':0, 'y':2}, {'x':0, 'y':4},
            {'x':2, 'y':0}
        ],[
            {'x':0, 'y':0}, {'x':0, 'y':2},
                            {'x':2, 'y':2},
                            {'x':4, 'y':2}
        ],[
                                              {'x':0, 'y':0},
            {'x':2, 'y':-4}, {'x':2, 'y':-2}, {'x':2, 'y':0}
        ]],
    'O':[[
            {'x':0, 'y':0}, {'x':0, 'y':2},
            {'x':2, 'y':0}, {'x':2, 'y':2}
        ]],
    'S':[[
                             {'x':0, 'y':0}, {'x':0, 'y':2},
            {'x':2, 'y':-2}, {'x':2, 'y':0}
        ],[
            {'x':0, 'y':0},
            {'x':2, 'y':0}, {'x':2, 'y':2},
                            {'x':4, 'y':2}
        ]],
    'T':[[
            {'x':0, 'y':0}, {'x':0, 'y':2}, {'x':0, 'y':4},
                            {'x':2, 'y':2}
        ],[
                             {'x':0, 'y':0},
            {'x':2, 'y':-2}, {'x':2, 'y':0},
                             {'x':4, 'y':0}
        ],[
                             {'x':0, 'y':0},
            {'x':2, 'y':-2}, {'x':2, 'y':0}, {'x':2, 'y':2}
        ],[
            {'x':0, 'y':0},
            {'x':2, 'y':0}, {'x':2, 'y':2},
            {'x':4, 'y':0}
        ]],
    'Z':[[
            {'x':0, 'y':0}, {'x':0, 'y':2},
                            {'x':2, 'y':2}, {'x':2, 'y':4}
        ],[
                             {'x':0, 'y':0},
            {'x':2, 'y':-2}, {'x':2, 'y':0},
            {'x':4, 'y':-2}
        ]],
    'N':[[
                            {'x':0, 'y':0},
                            {'x':2, 'y':0},
            {'x':4, 'y':-2},
            {'x':6, 'y':-2},
        ],[
            {'x':0, 'y':0}, {'x':0, 'y':2},
                                            {'x':2, 'y':4}, {'x':2, 'y':6}
        ]],
    '=':[[
            {'x':0, 'y':0}, {'x':0, 'y':2},

            {'x':4, 'y':0}, {'x':4, 'y':2}
        ],[
            {'x':0, 'y':0},                 {'x':0, 'y':4},
            {'x':2, 'y':0},                 {'x':2, 'y':4}
        ]],
},'5':{
    'F':[[
                             {'x':0, 'y':0}, {'x':0, 'y':2},
            {'x':2, 'y':-2}, {'x':2, 'y':0},
                             {'x':4, 'y':0}
        ],[
                             {'x':0, 'y':0},
            {'x':2, 'y':-2}, {'x':2, 'y':0}, {'x':2, 'y':2},
                                             {'x':4, 'y':2}
        ],[
                             {'x':0, 'y':0},
                             {'x':2, 'y':0}, {'x':2, 'y':2},
            {'x':4, 'y':-2}, {'x':4, 'y':0}
        ],[
            {'x':0, 'y':0},
            {'x':2, 'y':0}, {'x':2, 'y':2}, {'x':2, 'y':4},
                            {'x':4, 'y':2}
        ]],
    'G':[[
            {'x':0, 'y':0}, {'x':0, 'y':2},
                            {'x':2, 'y':2}, {'x':2, 'y':4},
                            {'x':4, 'y':2}
        ],[
                             {'x':0, 'y':0},
            {'x':2, 'y':-2}, {'x':2, 'y':0}, {'x':2, 'y':2},
            {'x':4, 'y':-2}
        ],[
                              {'x':0, 'y':0},
             {'x':2, 'y':-2}, {'x':2, 'y':0},
                              {'x':4, 'y':0}, {'x':4, 'y':2}
        ],[
                                              {'x':0, 'y':0},
            {'x':2, 'y':-4}, {'x':2, 'y':-2}, {'x':2, 'y':0},
            {'x':4, 'y':-2}
        ]],
    'B':[[
            {'x':0, 'y':0},
            {'x':2, 'y':0},
            {'x':4, 'y':0}, {'x':4, 'y':2},
            {'x':6, 'y':0}
        ],[
            {'x':0, 'y':0}, {'x':0, 'y':2}, {'x':0, 'y':4}, {'x':0, 'y':6},
                            {'x':2, 'y':2}
        ],[
                             {'x':0, 'y':0},
                             {'x':2, 'y':0},
            {'x':4, 'y':-2}, {'x':4, 'y':0},
                             {'x':6, 'y':0}
        ],[
                                              {'x':0, 'y':0},
            {'x':2, 'y':-4}, {'x':2, 'y':-2}, {'x':2, 'y':0}, {'x':2, 'y':2}
        ]],
    'D':[[
                             {'x':0, 'y':0},
                             {'x':2, 'y':0},
            {'x':4, 'y':-2}, {'x':4, 'y':0},
                             {'x':6, 'y':0}
        ],[
                             {'x':0, 'y':0},
            {'x':2, 'y':-2}, {'x':2, 'y':0}, {'x':2, 'y':2}, {'x':2, 'y':4},
        ],[
            {'x':0, 'y':0},
            {'x':2, 'y':0}, {'x':2, 'y':2},
            {'x':4, 'y':0},
            {'x':6, 'y':0}
        ],[
            {'x':0, 'y':0}, {'x':0, 'y':2}, {'x':0, 'y':4}, {'x':0, 'y':6},
                                            {'x':2, 'y':4}
        ]],
    'L':[[
            {'x':0, 'y':0},
            {'x':2, 'y':0},
            {'x':4, 'y':0},
            {'x':6, 'y':0}, {'x':6, 'y':2}
        ],[
            {'x':0, 'y':0}, {'x':0, 'y':2}, {'x':0, 'y':4}, {'x':0, 'y':6},
            {'x':2, 'y':0}
        ],[
            {'x':0, 'y':0}, {'x':0, 'y':2},
                            {'x':2, 'y':2},
                            {'x':4, 'y':2},
                            {'x':6, 'y':2}
        ],[
                                                               {'x':0, 'y':0},
            {'x':2, 'y':-6}, {'x':2, 'y':-4}, {'x':2, 'y':-2}, {'x':2, 'y':0}
        ]],
    'J':[[
                             {'x':0, 'y':0},
                             {'x':2, 'y':0},
                             {'x':4, 'y':0},
            {'x':6, 'y':-2}, {'x':6, 'y':0}
        ],[
            {'x':0, 'y':0},
            {'x':2, 'y':0}, {'x':2, 'y':2}, {'x':2, 'y':4}, {'x':2, 'y':6}
        ],[
            {'x':0, 'y':0}, {'x':0, 'y':2},
            {'x':2, 'y':0},
            {'x':4, 'y':0},
            {'x':6, 'y':0}
        ],[
            {'x':0, 'y':0}, {'x':0, 'y':2}, {'x':0, 'y':4}, {'x':0, 'y':6},
                                                            {'x':2, 'y':6}
        ]],
    'N':[[
                             {'x':0, 'y':0},
                             {'x':2, 'y':0},
            {'x':4, 'y':-2}, {'x':4, 'y':0},
            {'x':6, 'y':-2}
        ],[
            {'x':0, 'y':0}, {'x':0, 'y':2},
                            {'x':2, 'y':2}, {'x':2, 'y':4}, {'x':2, 'y':6}
        ],[
                             {'x':0, 'y':0},
            {'x':2, 'y':-2}, {'x':2, 'y':0},
            {'x':4, 'y':-2},
            {'x':6, 'y':-2}
        ],[
            {'x':0, 'y':0}, {'x':0, 'y':2}, {'x':0, 'y':4},
                                            {'x':2, 'y':4}, {'x':2, 'y':6}
        ]],
    'M':[[
            {'x':0, 'y':0},
            {'x':2, 'y':0},
            {'x':4, 'y':0}, {'x':4, 'y':2},
                            {'x':6, 'y':2}
        ],[
                             {'x':0, 'y':0}, {'x':0, 'y':2}, {'x':0, 'y':4},
            {'x':2, 'y':-2}, {'x':2, 'y':0}
        ],[
            {'x':0, 'y':0},
            {'x':2, 'y':0}, {'x':2, 'y':2},
                            {'x':4, 'y':2},
                            {'x':6, 'y':2}
        ],[
                                              {'x':0, 'y':0}, {'x':0, 'y':2},
            {'x':2, 'y':-4}, {'x':2, 'y':-2}, {'x':2, 'y':0}
        ]],
    'P':[[
            {'x':0, 'y':0}, {'x':0, 'y':2},
            {'x':2, 'y':0}, {'x':2, 'y':2},
            {'x':4, 'y':0}
        ],[
            {'x':0, 'y':0}, {'x':0, 'y':2}, {'x':0, 'y':4},
                            {'x':2, 'y':2}, {'x':2, 'y':4}
        ],[
                             {'x':0, 'y':0},
            {'x':2, 'y':-2}, {'x':2, 'y':0},
            {'x':4, 'y':-2}, {'x':4, 'y':0}
        ],[
            {'x':0, 'y':0}, {'x':0, 'y':2},
            {'x':2, 'y':0}, {'x':2, 'y':2}, {'x':2, 'y':4}
        ]],
    'Q':[[
            {'x':0, 'y':0}, {'x':0, 'y':2},
            {'x':2, 'y':0}, {'x':2, 'y':2},
                            {'x':4, 'y':2}
        ],[
                             {'x':0, 'y':0}, {'x':0, 'y':2},
            {'x':2, 'y':-2}, {'x':2, 'y':0}, {'x':2, 'y':2}
        ],[
            {'x':0, 'y':0},
            {'x':2, 'y':0}, {'x':2, 'y':2},
            {'x':4, 'y':0}, {'x':4, 'y':2}
        ],[
            {'x':0, 'y':0}, {'x':0, 'y':2}, {'x':0, 'y':4},
            {'x':2, 'y':0}, {'x':2, 'y':2}
        ]],
    'T':[[
            {'x':0, 'y':0}, {'x':0, 'y':2}, {'x':0, 'y':4},
                            {'x':2, 'y':2},
                            {'x':4, 'y':4}
        ],[
                                              {'x':0, 'y':0},
            {'x':2, 'y':-4}, {'x':2, 'y':-2}, {'x':2, 'y':0},
                                              {'x':4, 'y':0}
        ],[
                             {'x':0, 'y':0},
                             {'x':2, 'y':0},
            {'x':4, 'y':-2}, {'x':4, 'y':0}, {'x':4, 'y':2}
        ],[
            {'x':0, 'y':0},
            {'x':2, 'y':0}, {'x':2, 'y':2}, {'x':2, 'y':4},
            {'x':4, 'y':0}
        ]],
    'U':[[
            {'x':0, 'y':0},                 {'x':0, 'y':4},
            {'x':2, 'y':0}, {'x':2, 'y':2}, {'x':2, 'y':4}
        ],[
            {'x':0, 'y':0}, {'x':0, 'y':2},
            {'x':2, 'y':0},
            {'x':4, 'y':0}, {'x':4, 'y':2}
        ],[
            {'x':0, 'y':0}, {'x':0, 'y':2}, {'x':0, 'y':4},
            {'x':2, 'y':0},                 {'x':2, 'y':4}
        ],[
            {'x':0, 'y':0}, {'x':0, 'y':2},
                            {'x':2, 'y':2},
            {'x':4, 'y':0}, {'x':4, 'y':2}
        ]],
    'V':[[
            {'x':0, 'y':0},
            {'x':2, 'y':0},
            {'x':4, 'y':0}, {'x':4, 'y':2}, {'x':4, 'y':4}
        ],[
            {'x':0, 'y':0}, {'x':0, 'y':2}, {'x':0, 'y':4},
            {'x':2, 'y':0},
            {'x':4, 'y':0}
        ],[
            {'x':0, 'y':0}, {'x':0, 'y':2}, {'x':0, 'y':4},
                                            {'x':2, 'y':4},
                                            {'x':4, 'y':4}
        ],[
                                              {'x':0, 'y':0},
                                              {'x':2, 'y':0},
            {'x':4, 'y':-4}, {'x':4, 'y':-2}, {'x':4, 'y':0}
        ]],
    'W':[[
            {'x':0, 'y':0},
            {'x':2, 'y':0}, {'x':2, 'y':2},
                            {'x':4, 'y':2}, {'x':4, 'y':4}
        ],[
                             {'x':0, 'y':0}, {'x':0, 'y':2},
            {'x':2, 'y':-2}, {'x':2, 'y':0},
            {'x':4, 'y':-2}
        ],[
            {'x':0, 'y':0}, {'x':0, 'y':2},
                            {'x':2, 'y':2}, {'x':2, 'y':4},
                                            {'x':4, 'y':4}
        ],[
                                              {'x':0, 'y':0},
                             {'x':2, 'y':-2}, {'x':2, 'y':0},
            {'x':4, 'y':-4}, {'x':4, 'y':-2}
        ]],
    'X':[[
                             {'x':0, 'y':0},
            {'x':2, 'y':-2}, {'x':2, 'y':0}, {'x':2, 'y':2},
                             {'x':4, 'y':0}
        ]],
    'S':[[
                             {'x':0, 'y':0}, {'x':0, 'y':2},
                             {'x':2, 'y':0},
            {'x':4, 'y':-2}, {'x':4, 'y':0}
        ],[
            {'x':0, 'y':0},
            {'x':2, 'y':0}, {'x':2, 'y':2}, {'x':2, 'y':4},
                                            {'x':4, 'y':4}
        ]],
    'Z':[[
            {'x':0, 'y':0}, {'x':0, 'y':2},
                            {'x':2, 'y':2},
                            {'x':4, 'y':2}, {'x':4, 'y':4}
        ],[
                                              {'x':0, 'y':0},
            {'x':2, 'y':-4}, {'x':2, 'y':-2}, {'x':2, 'y':0},
            {'x':4, 'y':-4}
        ]],
/* Custom polyominos */
  },'6':{
    '?':[[
            {'x':0, 'y':0}, {'x':0, 'y':2},
            {'x':2, 'y':0}, {'x':2, 'y':2},
            {'x':4, 'y':0}, {'x':4, 'y':2}
        ]],
  },'9':{
    'O':[[
            {'x':0, 'y':0}, {'x':0, 'y':2}, {'x':0, 'y':4},
            {'x':2, 'y':0}, {'x':2, 'y':2}, {'x':2, 'y':4},
            {'x':4, 'y':0}, {'x':4, 'y':2}, {'x':4, 'y':4}
        ]],
  },'11':{
    '?':[[
                             {'x':0, 'y':0}, {'x':0, 'y':2},
                             {'x':2, 'y':0}, {'x':2, 'y':2},
            {'x':4, 'y':-2}, {'x':4, 'y':0}, {'x':4, 'y':2}, {'x':4, 'y':4},
            {'x':6, 'y':-2}, {'x':6, 'y':0}, {'x':6, 'y':2}
    ],[
            {'x':0, 'y':0}, {'x':0, 'y':2},
            {'x':2, 'y':0}, {'x':2, 'y':2}, {'x':2, 'y':4}, {'x':2, 'y':6},
            {'x':4, 'y':0}, {'x':4, 'y':2}, {'x':4, 'y':4}, {'x':4, 'y':6},
                            {'x':6, 'y':2}
    ],[
                             {'x':0, 'y':0}, {'x':0, 'y':2}, {'x':0, 'y':4},
            {'x':2, 'y':-2}, {'x':2, 'y':0}, {'x':2, 'y':2}, {'x':2, 'y':4},
                             {'x':4, 'y':0}, {'x':4, 'y':2},
                             {'x':6, 'y':0}, {'x':6, 'y':2}
    ],[
                                              {'x':0, 'y':0},
            {'x':2, 'y':-4}, {'x':2, 'y':-2}, {'x':2, 'y':0}, {'x':2, 'y':2},
            {'x':4, 'y':-4}, {'x':4, 'y':-2}, {'x':4, 'y':0}, {'x':4, 'y':2},
                                              {'x':6, 'y':0}, {'x':6, 'y':2}
    ]],
  }
}
