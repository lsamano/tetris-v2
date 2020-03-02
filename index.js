// Query for canvases
const canvas = document.getElementById('tetris')
const heldCanvas = document.getElementById('held')
const foreCanvas = document.getElementById('forecast1')
const foreCanvasB = document.getElementById('forecast2')
const foreCanvasC = document.getElementById('forecast3')
// make default tetris
const tetris = new Tetris(canvas, heldCanvas, foreCanvas, foreCanvasB, foreCanvasC);

function gameOver() {
  tetris.arena.clear()
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
