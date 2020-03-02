const bothGames = [];

const playerElements = document.querySelectorAll('.full-game');
[...playerElements].forEach(element => {
  // make default tetris
  const tetris = new Tetris(element);
  bothGames.push(tetris);
})

const keyListener = event => {
  // [hold, up, left, right, down, rotaLeft, rotaRight],
  [
    [51, 87, 65, 68, 83, 49, 50],
    [190, 38, 37, 39, 40, 75, 76],
  ].forEach((key, index) => {
    const player = bothGames[index].player
    if (event.keyCode === key[0]) {
      player.hold()
    } else if (event.keyCode === key[1]) {
      player.hardDrop()
    } else if (event.keyCode === key[2]) {
      player.move(-1)
    } else if (event.keyCode === key[3]) {
      player.move(1)
    } else if (event.keyCode === key[5]) {
      player.rotate(-1)
    } else if (event.keyCode === key[6]) {
      player.rotate(1)
    } else if (event.keyCode === key[4]) {
      player.drop(true)
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
