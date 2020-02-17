const canvas = document.getElementById('tetris')
const context = canvas.getContext('2d')
const heldCanvas = document.getElementById('held')
const heldContext = heldCanvas.getContext('2d')

context.scale(40, 40); // make bigger
heldContext.scale(40, 40); // make bigger
heldContext.fillStyle = '#202028'
heldContext.fillRect(0, 0, heldCanvas.width, heldCanvas.height)

const colors = [
  null, 'blueviolet', 'gold', 'darkorange', 'blue', 'cyan', 'chartreuse', '#FF0032'
]

const arena = createMatrix(10, 20)

const player = {
  pos: { x: 0, y: 0 },
  matrix: null,
  letter: null,
  score: 0
}

let heldLetter;
let canHold = true;

function arenaSweep() {
  let rowCount = 0;
  outer: for (let y = arena.length - 1; y > 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) { // if any pixel is not filled, move onto next row
          continue outer;
      }
    } // checks that all pixels are filled

    const row = arena.splice(y, 1)[0].fill(0) // remove row
    arena.unshift(row); // add blank row to top of arena
    ++y // check next arena row
    rowCount += 1
  }
  if (rowCount > 0) {
    player.score += calculateScore(rowCount)
  }
}

function calculateScore(rowsCleared) {
  let finalScore = 100
  let rows = rowsCleared - 1
  if (rowsCleared === 4) {
    finalScore += 100
  }
  return finalScore + rows * 200
}

function collide(arena, player) {
  const [playerMatrix, playerPosition] = [player.matrix, player.pos]
  for (let y = 0; y < playerMatrix.length; ++y) { // per row
    const arenaRow = arena[y + playerPosition.y]
    for (let x = 0; x < playerMatrix[y].length; ++x) { // per column/pixel
      const piecePixelIsPresent = (playerMatrix[y][x] !== 0)
      const arenaPixelIsPresent = (arenaRow && arenaRow[x + playerPosition.x]) !== 0
      if (piecePixelIsPresent && arenaPixelIsPresent) {
            return true
      }
    }
  }
  return false;
}

function createMatrix(width, height) {
  const newMatrix = []
  while (height--) {
    newMatrix.push(new Array(width).fill(0))
  }
  return newMatrix
}

function getPieceMatrix(type) {
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

function drawNextTurn() {
 context.fillStyle = '#202028'
 context.fillRect(0, 0, canvas.width, canvas.height)

 drawMatrix(arena, {x: 0, y: 0}) // draws previous board
 drawMatrix(
   player.matrix,
   { x: player.pos.x, y: getGhostCoordinate() },
   true
 ); // draw ghost piece
 drawMatrix(player.matrix, player.pos); // draws active piece
}

function drawMatrix(matrix, offset, ghost) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = ghost ? 'grey': colors[value]
        context.fillRect(
          x + offset.x,
          y + offset.y,
          1, 1)
      }
    });
  });
}

function getGhostCoordinate() {
  let ghost = JSON.parse(JSON.stringify(player))
 while (true) {
    // move player down until collide
    ghost.pos.y++
    if (collide(arena, ghost)) {
      // move back up one, merge with field
      ghost.pos.y--

      return ghost.pos.y
    }
  }
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
  canHold = true;
}

function playerDrop() {
  player.pos.y++
  if (collide(arena, player)) {
    player.pos.y--
    merge(arena, player)
    nextTurn()
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
  const randomIndex = pieces.length * Math.random() | 0
  return pieces[randomIndex]
}

function playerReset(nextLetter = getTetriminoLetter()) {
  player.letter = nextLetter
  player.matrix = getPieceMatrix(nextLetter)
  player.pos.y = 0;
  // sets at middle and lowers it to fit in arena
  player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0)
  if (collide(arena, player)) return gameOver()
}

function gameOver() {
  arena.forEach(row => row.fill(0))
  player.score = 0
  updateScore()
}

function playerRotate(dir) {
  const originalPosition = player.pos.x
  let offset = 1
  rotate(player.matrix, dir)
  while (collide(arena, player)) {
    player.pos.x += offset
    offset = -(offset + (offset > 0 ? 1 : -1))
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -dir)
      player.pos.x = originalPosition
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
let dropInterval = 500
let lastTime = 0;

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time

  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop()
  }

  drawNextTurn()
  requestAnimationFrame(update)
}

function updateScore() {
  const score = document.getElementById('score')
  score.innerText = player.score
}

function playerHold() {
  if (canHold) {
    // prevent another switch this round
    canHold = false
    if (heldLetter) {
      // grab saved letter and switch
      [heldLetter, player.letter] = [player.letter, heldLetter]
      updateHeld() // update the savedLetter canvas
      playerReset(player.letter) // use saved piece
    } else {
      // OR save piece to box
      heldLetter = player.letter
      updateHeld() // update the savedLetter canvas
      playerReset() // move onto next piece
    }
  }
}

document.addEventListener('keydown', event => {
  if (event.keyCode === 68) {
    playerHold()
  } else if (event.keyCode === 38) {
    playerHardDrop()
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

const updateHeld = () => {
  // have box display piece
  heldContext.fillStyle = '#202028'
  heldContext.fillRect(0, 0, heldCanvas.width, heldCanvas.height)
  pieceMatrix = getPieceMatrix(heldLetter)
  drawSaved(pieceMatrix);
}

function drawSaved(matrix) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        heldContext.fillStyle = colors[value];
        heldContext.fillRect(x, y, 1, 1)
      }
    });
  });
}

function playerHardDrop() {
  while (true) {
    // move player down until collide
    player.pos.y++
    if (collide(arena, player)) {
      // move back up one, merge with field
      player.pos.y--
      merge(arena, player)
      nextTurn()
      dropCounter = 0
      break;
    }
  }
}

function nextTurn() {
  playerReset()
  arenaSweep()
  updateScore()
}

playerReset()
updateScore()
update()
