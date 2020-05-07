const tetrisManager = new TetrisManager(document);
const localTetris = tetrisManager.createPlayer();

// Adds white box around your Tetris game
localTetris.element.classList.add('local');

// Connect to server
const connectionManager = new ConnectionManager(tetrisManager);
connectionManager.connect(`ws://${window.location.hostname}:${window.location.port}`);

const repetitiveKeyListener = event => {
  if (localTetris.paused === false) {
    const player = localTetris.player
    if (event.code === "ArrowUp") { // Up
      player.hardDrop()
    } else if (event.code === "ArrowLeft") { // Left
      player.move(-1)
    } else if (event.code === "ArrowRight") { // Right
      player.move(1)
    } else if (event.code === "ArrowDown") { // Down
      player.drop(true)
    }
  }
}

const singleKeyListener = event => {
  if (event.repeat) return;

  if (event.code === "Space") { // Pause or start game
    if (localTetris.gameOn === true) {
      return localTetris.togglePaused();
    } else if (localTetris.gameDone === false) {
      return startGame();
    }
  }

  if (localTetris.paused === false) {
    const player = localTetris.player
    if (event.code === "KeyD") { // D
      player.hold()
    } else if (event.code === "KeyQ") { // rotate left, (ccw)
      player.rotate(-1)
    } else if (event.code === "KeyW") { // rotate right (cw)
      player.rotate(1)
    }

    // The below keys are for dev purposes
    if (event.code === "KeyG") {
      player.arena.receiveAttack(player, [4])
    } else if (event.code === "KeyH") {
      player.arena.receiveAttack(player, [2])
    } else if (event.code === "KeyX") {
      player.events.emit('garbage', 4);
    } else if (event.code === "KeyC") {
      player.events.emit('garbage', 2);
    } else if (event.code === "KeyP") {
      player.receiveIncomingAttack(4)
    }
  }
}

document.addEventListener('keydown', repetitiveKeyListener)
document.addEventListener('keydown', singleKeyListener)

function playMusic() {
  const sound = document.createElement("audio");
  sound.src = "audio/awesome-awesome-tetris-remix.mp3";
  sound.setAttribute("preload", "auto");
  sound.setAttribute("controls", "none");
  sound.loop = true;
  sound.style.display = "none";
  document.body.appendChild(sound);
  sound.play();
}

function startGame(event) {
  localTetris.startGame();
  // playMusic();
}

const startButton = localTetris.element.querySelector(".start-button")
startButton.addEventListener('click', startGame)
