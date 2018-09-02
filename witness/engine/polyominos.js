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
        rotations[1] ^= _mask(y, 3-x)
        rotations[2] ^= _mask(3-x, 3-y)
        rotations[3] ^= _mask(3-y, x)
      }
    }
  }

  return rotations
}

// IMPORTANT NOTE: When formulating these, the top-left must be 0, 0.
// That can also never be any negative x values.
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

POLYOMINOS = {
  '1':[1],
  '2':[3, 17, 33, 18],
  '3':[7, 19, 22, 35, 37, 49, 50, 52, 67, 82, 97, 273, 274, 289, 290, 529, 530, 545],
  '4':[15, 23, 39, 51, 54, 71, 85, 99, 113, 114, 116, 195, 275, 305, 306, 547, 561, 562, 771, 785, 802, 4369, 4386],
  '5':[31, 47, 55, 62, 79, 87, 103, 115, 117, 118, 124, 143, 199, 227, 241, 242, 244, 248, 279, 307, 310, 369, 370, 372, 551, 563, 566, 611, 625, 626, 628, 787, 803, 806, 817, 818, 866, 868, 1095, 1123, 1137, 1138, 1140, 1571, 1585, 1586, 1809, 1826, 1860, 4371, 4401, 4402, 4881, 4898, 8739, 8753, 8754, 8977, 12561, 12834],
/* Custom polyominos */
  '6':[819],
  '9':[1911],
  '11':[32614],
}
