// Query for canvases
const canvas = document.getElementById('tetris')
const context = canvas.getContext('2d')
const heldCanvas = document.getElementById('held')
const heldContext = heldCanvas.getContext('2d')
const foreCanvas = document.getElementById('forecast1')
const foreContext = foreCanvas.getContext('2d')
const foreCanvasB = document.getElementById('forecast2')
const foreContextB = foreCanvasB.getContext('2d')
const foreCanvasC = document.getElementById('forecast3')
const foreContextC = foreCanvasC.getContext('2d')

// make bigger
context.scale(40, 40);
heldContext.scale(40, 40);
foreContext.scale(40, 40);
foreContextB.scale(40, 40);
foreContextC.scale(40, 40);

// fill with black
heldContext.fillStyle = '#202028'
heldContext.fillRect(0, 0, heldCanvas.width, heldCanvas.height)
foreContext.fillStyle = '#202028'
foreContext.fillRect(0, 0, foreCanvas.width, foreCanvas.height)
foreContextB.fillStyle = '#202028'
foreContextB.fillRect(0, 0, foreCanvasB.width, foreCanvasB.height)
foreContextC.fillStyle = '#202028'
foreContextC.fillRect(0, 0, foreCanvasC.width, foreCanvasC.height)

// colors array for obtaining tetris piece colors
const colors = [
  null, 'blueviolet', 'gold', 'darkorange', 'blue', 'cyan', 'chartreuse', '#FF0032'
]

// make arena matrix
const arena = createMatrix(10, 20)

// make default player
const player = {
  position: { x: 0, y: 0 },
  matrix: null, // matrix of current piece
  letter: null, // letter of current piece
  score: 0,
  dropInterval: 1000,
  forecastArray: getInitialForecast()
}

let heldLetter;
let canHold = true;

function getInitialForecast() {
  const pieces = 'ILJOSTZ'.split("")
  shuffle(pieces)
  pieces.forEach((letter, index) => {
    console.log(letter)
  })
  return pieces
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.random() * currentIndex | 0
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

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
    calculateScore(rowCount - 1)
    calculateSpeed(player.score)
  }
}

function calculateScore(additionalRowsCleared) {
  let baseScore = 100
  if (additionalRowsCleared === 3) {
    baseScore += 100
  }
  player.score += baseScore + additionalRowsCleared * 200
}

function calculateSpeed(score) {
  if (score < 1000 ) {
    player.dropInterval = 1000
  } else if (score < 3000) {
    player.dropInterval = 750
  } else { // if score >= 500
    player.dropInterval = 500
  }
}

function collide(arena, player) {
  const [playerMatrix, playerPosition] = [player.matrix, player.position]
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
   { x: player.position.x, y: getGhostCoordinate() },
   true
 ); // draw ghost piece
 drawMatrix(player.matrix, player.position); // draws active piece
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
    ghost.position.y++
    if (collide(arena, ghost)) {
      // move back up one, merge with field
      ghost.position.y--

      return ghost.position.y
    }
  }
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.position.y][x + player.position.x] = value
      }
    });
  });
  // if merged, set ability to switch back to true
  canHold = true;
}

function playerDrop() {
  player.position.y++
  if (collide(arena, player)) {
    player.position.y--
    merge(arena, player)
    nextTurn()
  }
  dropCounter = 0
}

function playerMove(dir) {
  player.position.x += dir
  if (collide(arena, player)) {
    player.position.x -= dir
  }
}

function getTetriminoLetter() {
  const pieces = 'ILJOSTZ'
  const randomIndex = pieces.length * Math.random() | 0
  return pieces[randomIndex]
}

function playerReset(providedLetter) {
  if (!providedLetter) {
    player.letter = player.forecastArray.shift()
    const newPiece = getTetriminoLetter()
    player.forecastArray.push(newPiece)
  } else {
    player.letter =  providedLetter
  }
  player.matrix = getPieceMatrix(player.letter)
  player.position.y = 0
  // sets at middle and lowers it to fit in arena
  player.position.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0)
  if (collide(arena, player)) return gameOver()
}

function gameOver() {
  arena.forEach(row => row.fill(0))
  player.score = 0
  updateScore()
}

function playerRotate(dir) {
  const originalPosition = player.position.x
  let offset = 1
  rotate(player.matrix, dir)
  while (collide(arena, player)) {
    player.position.x += offset
    offset = -(offset + (offset > 0 ? 1 : -1))
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -dir)
      player.position.x = originalPosition
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
// let dropInterval = 500
let lastTime = 0;

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time

  dropCounter += deltaTime;
  if (dropCounter > player.dropInterval) {
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
      updateForecast()
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

function updateHeld() {
  // have box display piece
  heldContext.fillStyle = '#202028'
  heldContext.fillRect(0, 0, heldCanvas.width, heldCanvas.height)
  pieceMatrix = getPieceMatrix(heldLetter)
  drawSaved(pieceMatrix);
}

function updateForecast() {
  // have box display piece
  foreContext.fillStyle = '#202028'
  foreContext.fillRect(0, 0, foreCanvas.width, foreCanvas.height)
  pieceMatrix = getPieceMatrix(player.forecastArray[0])
  drawForecast(pieceMatrix, foreContext);

  foreContextB.fillStyle = '#202028'
  foreContextB.fillRect(0, 0, foreCanvas.width, foreCanvas.height)
  pieceMatrix = getPieceMatrix(player.forecastArray[1])
  drawForecast(pieceMatrix, foreContextB);

  foreContextC.fillStyle = '#202028'
  foreContextC.fillRect(0, 0, foreCanvas.width, foreCanvas.height)
  pieceMatrix = getPieceMatrix(player.forecastArray[2])
  drawForecast(pieceMatrix, foreContextC);
}

function drawForecast(matrix, place) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        place.fillStyle = colors[value];
        place.fillRect(x, y, 1, 1)
      }
    });
  });
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
    player.position.y++
    if (collide(arena, player)) {
      // move back up one, merge with field
      player.position.y--
      merge(arena, player)
      nextTurn()
      dropCounter = 0
      break;
    }
  }
}

function nextTurn() {
  playerReset()
  updateForecast()
  arenaSweep()
  updateScore()
}

function startGame() {
  playerReset()
  updateForecast()
  updateScore()
  update()
}

startGame()
