class Tetris {
  constructor(element) {
    this.element = element
    this.paused = true
    this.gameOn = false

    // Initializes context, scales it, and sets it as dary grey
    const initializeBox = (element, contextString, scaleAmount) => {
      this[contextString] = element.getContext('2d')
      this[contextString].scale(scaleAmount, scaleAmount);
      this.clearCanvas(element, this[contextString])
    }

    // Set up forecast
    this.forecastElements = element.querySelectorAll('.forecast');
    this.forecastElements.forEach((element, i) => {
      const currentForeContext = `foreContext${i}`
      initializeBox(element, currentForeContext, 30)
    });

    // Set up canvas
    this.canvas = element.querySelector('.tetris')
    initializeBox(this.canvas, "context", 35)

    // Set up held
    this.heldCanvas = element.querySelector('.held')
    initializeBox(this.heldCanvas, "heldContext", 30)

    // Set up garbage bar
    this.garbageCanvas = element.querySelector('.garbage')
    initializeBox(this.garbageCanvas, "garbageContext", 35)

/////////////////////////////

    // make arena matrix
    this.arena = new Arena(10, 20);

    // make default player
    this.player = new Player(this);

    this.player.events.listen('score', score => {
      this.updateScore(score);
    });

    // colors array for obtaining tetris piece colors
    this.colors = [
      null, 'blueviolet', 'gold', 'darkorange', 'blue', 'cyan', 'chartreuse', '#FF0032', 'grey'
    ]
    // ghost colors
    this.ghostColors = [
      null, '#cda5f3', '#fff099', '#ffd199', '#9999ff', '#c2f0f0', '#ccff99', '#e996a6'
    ]

    let lastTime = 0

    this._update = (time = 0) => {
      const deltaTime = time - lastTime;
      lastTime = time

      this.player.update(deltaTime)

      this.drawNextTurn()
      if (this.paused) {
        return;
      }
      requestAnimationFrame(this._update)
    }

    // Set intial score at 0
    this.updateScore(0)
  }

  run() {
    this._update();
  }

  drawNextTurn() {
    this.clearCanvas(this.canvas, this.context)

   this.drawMatrix(this.arena.matrix, {x: 0, y: 0}) // draws previous board
   this.drawMatrix(
     this.player.matrix,
     { x: this.player.position.x, y: this.getGhostCoordinate() },
     true
   ); // draw ghost piece
   this.drawMatrix(this.player.matrix, this.player.position); // draws active piece
   this.updateHeld();
   this.updateForecast();
  }

  drawMatrix(matrix, offset, ghost) {
    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          this.context.fillStyle = ghost ? this.ghostColors[value]: this.colors[value]
          this.context.fillRect(
            x + offset.x,
            y + offset.y,
            1, 1)
        }
      });
    });
  }

  ghostCollide(arena, player) {
    const [playerMatrix, playerPosition] = [player.matrix, player.position]
    for (let y = 0; y < playerMatrix.length; ++y) { // per row
      const arenaRow = arena.matrix[y + playerPosition.y]
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

  getGhostCoordinate() {
    // create ghost of player
    const ghost = {
      matrix: [...this.player.matrix],
      position: {...this.player.position}
    }
     while (true) {
      // move player down until collide
      ghost.position.y++;

      if (this.ghostCollide(this.arena, ghost)) {
        // move back up one
        ghost.position.y--;
        return ghost.position.y;
      }
    }
  }

  updateForecast() {
    // have forecase boxes display pieces
    this.forecastElements.forEach(this.updateSideBox)
  }

  updateHeld() {
    // have box display piece
    if (this.player.heldLetter) {
      this.updateSideBox(this.heldCanvas)
    }
  }

  updateIndicator() {
    this.clearCanvas(this.garbageCanvas, this.garbageContext)
    const totalGarbage = this.player.incomingGarbage.reduce((total, num) => total + num, 0)
    const newIndicatorArray = Array(20).fill([0]).fill([8], 20 - totalGarbage)
    this.drawSideBox(newIndicatorArray, this.garbageContext)
  }

  updateSideBox = (element, i) => {
    const context = i !== undefined ? `foreContext${i}` : "heldContext";
    const letter = i !== undefined ? this.player.forecast[i] : this.player.heldLetter;

    this.clearCanvas(element, this[context])
    const pieceMatrix = this.getPieceMatrix(letter);

    this.drawSideBox(pieceMatrix, this[context]);
  }

  drawSideBox(matrix, providedContext) {
    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          providedContext.fillStyle = this.colors[value];
          providedContext.fillRect(x, y, 1, 1)
        }
      });
    });
  }

  clearCanvas(element, context) {
    context.fillStyle = '#202028';
    context.fillRect(0, 0, element.width, element.height);
  }

  getPieceMatrix(type) {
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
        [0, 0, 0, 0],
        [5, 5, 5, 5],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ]
      default:
      return [
        [0, 5, 1, 0],
        [8, 6, 4, 8],
        [8, 7, 3, 8],
        [0, 5, 2, 0]
      ]
    }
  }

  serialize() {
      return {
          arena: {
              matrix: this.arena.matrix,
          },
          player: {
              matrix: this.player.matrix,
              position: this.player.position,
              score: this.player.score,
              heldLetter: this.player.heldLetter,
              forecast: this.player.forecast,
              incomingGarbage: this.player.incomingGarbage,
              gameOn: this.gameOn
          },
      };
  }

  unserialize(state) {
    console.log(state);
    this.arena = Object.assign(state.arena);
    this.player = Object.assign(state.player);
    this.updateScore(this.player.score);
    if (state.player.gameOn) {
      this.drawNextTurn();
      this.updateIndicator();
    }
  }

  updateScore(newScore) {
    const amountOfDigits = newScore.toString().length
    const zeroesToAdd = 10 - amountOfDigits
    const score = this.element.querySelector('.score')
    score.innerText = "0".repeat(zeroesToAdd) + newScore.toString()
  }

  togglePaused() {
    if (this.gameOn) {
      this.paused = !this.paused;
      this.run();
    }
  }

  startGame() {
    const startButton = this.element.querySelector(".start-button")
    startButton.disabled = true
    startButton.classList.remove("hoverable")
    startButton.classList.add("disabled")

    this.paused = false;
    this.gameOn = true;
    this.player.events.emit('gameOn', true);
    this.run();
  }

}
