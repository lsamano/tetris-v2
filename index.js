// Query for canvases
const canvas = document.getElementById('tetris')
const heldCanvas = document.getElementById('held')
const foreCanvas = document.getElementById('forecast1')
const foreCanvasB = document.getElementById('forecast2')
const foreCanvasC = document.getElementById('forecast3')
// make default tetris
const tetris = new Tetris(canvas, heldCanvas, foreCanvas, foreCanvasB, foreCanvasC);


function getPieceMatrix(type) {
  switch (type) {
    case 'T':
    return [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
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
      [4, 0, 0],
      [4, 4, 4],
      [0, 0, 0]
    ]
    case 'L':
    return [
      [0, 0, 3],
      [3, 3, 3],
      [0, 0, 0]
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
      [0, 6, 4, 0],
      [0, 7, 3, 0],
      [0, 5, 2, 0]
    ]
  }
}

function getTetriminoLetter() {
  const pieces = 'ILJOSTZ'
  const randomIndex = pieces.length * Math.random() | 0
  return pieces[randomIndex]
}

function gameOver() {
  arena.clear()
  tetris.player.score = 0
  updateScore()
}

function updateScore() {
  const amountOfDigits = tetris.player.score.toString().length
  const zeroesToAdd = 10 - amountOfDigits
  const score = document.getElementById('score')
  score.innerText = "0".repeat(zeroesToAdd) + tetris.player.score.toString()
}

document.addEventListener('keydown', event => {
  if (event.keyCode === 68) {
    tetris.player.hold()
  } else if (event.keyCode === 38) {
    tetris.player.hardDrop()
  } else if (event.keyCode === 37) {
    tetris.player.move(-1)
  } else if (event.keyCode === 39) {
    tetris.player.move(1)
  } else if (event.keyCode === 40) {
    tetris.player.drop(true)
  } else if (event.keyCode === 81) {
    tetris.player.rotate(-1)
  } else if (event.keyCode === 87) {
    tetris.player.rotate(1)
  }
})

function drawSaved(matrix) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        heldContext.fillStyle = tetris.colors[value];
        heldContext.fillRect(x, y, 1, 1)
      }
    });
  });
}

function nextTurn() {
  tetris.player.reset()
  tetris.updateForecast()
  tetris.arena.sweep(tetris.player)
  updateScore()
}

function startGame() {
  tetris.updateForecast()
  updateScore()
  tetris.update()
}

const startButton = document.getElementById("start-button")
startButton.addEventListener('click', event => {
  startButton.disabled = true
  startButton.classList.remove("hoverable")
  startButton.classList.add("disabled")
  startGame()
})
