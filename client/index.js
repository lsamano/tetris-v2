const tetrisManager = new TetrisManager(document);
const localTetris = tetrisManager.createPlayer();

localTetris.element.classList.add('local');
localTetris.run();

const PORT = 8000;
const connectionManager = new ConnectionManager(tetrisManager);
connectionManager.connect(`http://localhost:${PORT}` || "https://hidden-fortress-31934.herokuapp.com/");

const keyListener = event => {
  // [hold, up, left, right, down, rotaLeft, rotaRight],
  [
    [51, 87, 65, 68, 83, 49, 50],
    // [190, 38, 37, 39, 40, 75, 76],
  ].forEach((key, index) => {
    const player = localTetris.player
    if (event.keyCode === 68) {
      player.hold()
    } else if (event.keyCode === 38) {
      player.hardDrop()
    } else if (event.keyCode === 37) {
      player.move(-1)
    } else if (event.keyCode === 39) {
      player.move(1)
    } else if (event.keyCode === 40) {
      player.drop(true)
    } else if (event.keyCode === 81) {
      player.rotate(-1)
    } else if (event.keyCode === 87) {
      player.rotate(1)
    }
  })
}

document.addEventListener('keydown', keyListener)

// function startGame() {
//   tetris.updateForecast()
//   tetris.updateScore()
//   tetris.update()
// }

// const startButton = document.getElementById("start-button")
// startButton.addEventListener('click', event => {
//   startButton.disabled = true
//   startButton.classList.remove("hoverable")
//   startButton.classList.add("disabled")
//   startGame()
// })
