const tetrisManager = new TetrisManager(document);
const localTetris = tetrisManager.createPlayer();

// Adds white box around your Tetris game
localTetris.element.classList.add('local');

// Starts your game
// localTetris.run();

// Connect to server
const connectionManager = new ConnectionManager(tetrisManager);
connectionManager.connect(`ws://${window.location.hostname}:${window.location.port}`);

const keyListener = event => {
  if (event.keyCode === 32) { // Space
    return localTetris.togglePaused()
  }
  if (localTetris.paused === false) {
    const player = localTetris.player
    if (event.keyCode === 68) { // D
      player.hold()
    } else if (event.keyCode === 38) { // Up
      player.hardDrop()
    } else if (event.keyCode === 37) { // Left
      player.move(-1)
    } else if (event.keyCode === 39) { // Right
      player.move(1)
    } else if (event.keyCode === 40) { // Down
      player.drop(true)
    } else if (event.keyCode === 81) { // Q
      player.rotate(-1)
    } else if (event.keyCode === 87) { // W
      player.rotate(1)
    } else if (event.keyCode === 71) { // G
      player.arena.receiveAttack(player, 4)
    } else if (event.keyCode === 72) { // G
      player.arena.receiveAttack(player, 2)
    }
  }
}

document.addEventListener('keydown', keyListener)

function startGame() {
  // tetris.updateForecast()
  // tetris.updateScore()
  // tetris.update()
  localTetris.run();
}

const startButton = localTetris.element.querySelector(".start-button")
startButton.addEventListener('click', event => {
  startButton.disabled = true
  startButton.classList.remove("hoverable")
  startButton.classList.add("disabled")
  startGame()
})
