const canvas = document.getElementById('tetris')
const context = canvas.getContext('2d')
const saved = document.getElementById('saved')
const savedContext = saved.getContext('2d')

context.scale(40, 40); // make bigger
savedContext.scale(40, 40); // make bigger
savedContext.fillStyle = '#202028'
savedContext.fillRect(0, 0, saved.width, saved.height)

const colors = [
  null, 'blueviolet', 'gold', 'darkorange', 'blue', 'cyan', 'chartreuse', '#FF0032'
]

const arena = createMatrix(10, 20)

const player = {
  pos: { x: 0, y: 0 },
  matrix: null,
  score: 0,
  letter: null
}

let savedPiece;
let savedLetter;
let canSwitch = true;

function arenaSweep() {
  let rowCount = 1;
  outer: for (let y = arena.length - 1; y > 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) {
          continue outer;
      }
    }

    const row = arena.splice(y, 1)[0].fill(0)
    arena.unshift(row);
    ++y

    player.score += rowCount * 10;
    rowCount *= 2
  }
}

function collide(arena, player) {
  const [m, o] = [player.matrix, player.pos]
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 &&
        (arena[y + o.y] &&
          arena[y + o.y][x + o.x]) !== 0) {
            return true
      }
    }
  }
  return false;
}

function createMatrix(width, height) {
  const matrix = []
  while (height--) {
    matrix.push(new Array(width).fill(0))
  }
  return matrix
}

function createPieceMatrix(type) {
  switch (type) {
    case 'T':
    return [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0]
    ]
    case 'O':
    return [
      [2, 2],
      [2, 2]
    ]
    case 'Z':
    return [
      [7, 7, 0],
      [0, 7, 7],
      [0, 0, 0]
    ]
    case 'S':
    return [
      [0, 6, 6],
      [6, 6, 0],
      [0, 0, 0]
    ]
    case 'J':
    return [
      [0, 4, 0],
      [0, 4, 0],
      [4, 4, 0]
    ]
    case 'L':
    return [
      [0, 3, 0],
      [0, 3, 0],
      [0, 3, 3]
    ]
    case 'I':
    return [
      [0, 5, 0, 0],
      [0, 5, 0, 0],
      [0, 5, 0, 0],
      [0, 5, 0, 0]
    ]
    default:
    return [
      [0, 5, 1, 0],
      [0, 5, 4, 0],
      [0, 5, 3, 0],
      [0, 5, 2, 0]
    ]
  }
}

function draw() {
 context.fillStyle = '#202028'
 context.fillRect(0, 0, canvas.width, canvas.height)

 drawMatrix(arena, {x: 0, y: 0})
 drawMatrix(player.matrix, player.pos);
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = colors[value];
        context.fillRect(
          x + offset.x,
          y + offset.y,
          1, 1)
      }
    });
  });
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value
      }
    });
  });
  // if merged, set ability to switch back to true
  canSwitch = true;
}

function playerDrop() {
  player.pos.y++
  if (collide(arena, player)) {
    player.pos.y--
    merge(arena, player)
    playerReset()
    arenaSweep()
    updateScore()
  }
  dropCounter = 0
}

function playerMove(dir) {
  player.pos.x += dir
  if (collide(arena, player)) {
    player.pos.x -= dir
  }
}

function getTetriminoLetter() {
  const pieces = 'ILJOSTZ'
  const randomNumber = pieces.length * Math.random() | 0
  return pieces[randomNumber]
}

function playerReset(providedLetter = getTetriminoLetter()) {
  player.letter = providedLetter
  player.matrix = createPieceMatrix(providedLetter)
  player.pos.y = 0;
  player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0)
  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0))
    player.score = 0
    updateScore()
  }
}

function playerRotate(dir) {
  const pos = player.pos.x
  let offset = 1
  rotate(player.matrix, dir)
  while (collide(arena, player)) {
    player.pos.x += offset
    offset = -(offset + (offset > 0 ? 1 : -1))
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -dir)
      player.pos.x = pos
      return;
    }
  }
}

function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < y; x++) {
      [
        matrix[x][y],
        matrix[y][x]
      ] = [
        matrix[y][x],
        matrix[x][y]
      ]
    }
  }
  if (dir > 0) {
    matrix.forEach(row => row.reverse())
  } else {
    matrix.reverse()
  }
}

let dropCounter = 0
let dropInterval = 1000
let lastTime = 0;

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time

  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop()
  }

  draw()
  requestAnimationFrame(update)
}

function updateScore() {
  const score = document.getElementById('score')
  score.innerText = player.score
}

function playerSwitch() {
  if (canSwitch) {
    // prevent another switch this round
    canSwitch = false
    if (savedLetter) {
      // grab saved letter and switch
      [savedLetter, player.letter] = [player.letter, savedLetter]
      setSaved() // update the savedPiece canvas
      playerReset(player.letter) // use saved piece
    } else {
      // OR save piece to box
      savedLetter = player.letter
      setSaved() // update the savedPiece canvas
      playerReset() // move onto next piece
    }
  }
}

document.addEventListener('keydown', event => {
  if (event.keyCode === 68) {
    playerSwitch()
  } else if (event.keyCode === 37) {
    playerMove(-1)
  } else if (event.keyCode === 39) {
    playerMove(1)
  } else if (event.keyCode === 40) {
    playerDrop()
  } else if (event.keyCode === 81) {
    playerRotate(-1)
  } else if (event.keyCode === 87) {
    playerRotate(1)
  }
})

const setSaved = () => {
  // have box display piece
  savedContext.fillStyle = '#202028'
  savedContext.fillRect(0, 0, saved.width, saved.height)
  drawSaved(createPieceMatrix(savedLetter), {x: 0, y: 0});
}

function drawSaved(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        savedContext.fillStyle = colors[value];
        savedContext.fillRect(
          x + offset.x,
          y + offset.y,
          1, 1)
      }
    });
  });
}

playerReset()
updateScore()
update()
