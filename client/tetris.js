class Tetris {
  constructor(element, canvas, heldCanvas, foreCanvas, foreCanvasB, foreCanvasC) {
    this.element = element
    // Query for canvases
    this.canvas = element.querySelector('.tetris')
    this.heldCanvas = element.querySelector('.held')
    this.foreCanvas = element.querySelector('.forecast1')
    this.foreCanvasB = element.querySelector('.forecast2')
    this.foreCanvasC = element.querySelector('.forecast3')

    this.context = this.canvas.getContext('2d')
    this.heldContext = this.heldCanvas.getContext('2d')
    this.foreContext = this.foreCanvas.getContext('2d')
    this.foreContextB = this.foreCanvasB.getContext('2d')
    this.foreContextC = this.foreCanvasC.getContext('2d')

    // make bigger
    this.context.scale(35, 35);
    this.heldContext.scale(35, 35);
    this.foreContext.scale(35, 35);
    this.foreContextB.scale(35, 35);
    this.foreContextC.scale(35, 35);

    // fill with black
    this.context.fillStyle = '#202028'
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
    this.heldContext.fillStyle = '#202028'
    this.heldContext.fillRect(0, 0, this.heldCanvas.width, this.heldCanvas.height)
    this.foreContext.fillStyle = '#202028'
    this.foreContext.fillRect(0, 0, this.foreCanvas.width, this.foreCanvas.height)
    this.foreContextB.fillStyle = '#202028'
    this.foreContextB.fillRect(0, 0, this.foreCanvasB.width, this.foreCanvasB.height)
    this.foreContextC.fillStyle = '#202028'
    this.foreContextC.fillRect(0, 0, this.foreCanvasC.width, this.foreCanvasC.height)
/////////////////////////////

    // make arena matrix
    this.arena = new Arena(10, 20)

    // make default player
    this.player = new Player(this);

    // colors array for obtaining tetris piece colors
    this.colors = [
      null, 'blueviolet', 'gold', 'darkorange', 'blue', 'cyan', 'chartreuse', '#FF0032'
    ]

    this.ghostColors = [
      null, '#cda5f3', '#fff099', '#ffd199', '#9999ff', '#c2f0f0', '#ccff99', '#e996a6'
    ]

    let lastTime = 0

    const update = (time = 0) => {
      const deltaTime = time - lastTime;
      lastTime = time

      this.player.update(deltaTime)

      this.drawNextTurn()
      requestAnimationFrame(update)
    }

    this.updateForecast()
    this.updateScore(0)
    update();
  }

  drawNextTurn() {
   this.context.fillStyle = '#202028'
   this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)

   this.drawMatrix(this.arena.matrix, {x: 0, y: 0}) // draws previous board
   this.drawMatrix(
     this.player.matrix,
     { x: this.player.position.x, y: this.getGhostCoordinate() },
     true
   ); // draw ghost piece
   this.drawMatrix(this.player.matrix, this.player.position); // draws active piece
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

  getGhostCoordinate() {
    // create ghost of player
    // let ghost = JSON.parse(JSON.stringify(this.player))
    const ghost = {
      matrix: [...this.player.matrix],
      position: {...this.player.position}
    }
     while (true) {
      // move player down until collide
      ghost.position.y++
      if (this.arena.collide(ghost)) {
        // move back up one
        ghost.position.y--
        return ghost.position.y
      }
    }
  }

  updateForecast() {
    // have box display piece
    this.foreContext.fillStyle = '#202028'
    this.foreContext.fillRect(0, 0, this.foreCanvas.width, this.foreCanvas.height)
    const pieceMatrixA = this.getPieceMatrix(this.player.forecastArray[0])
    this.drawSideBox(pieceMatrixA, this.foreContext);

    this.foreContextB.fillStyle = '#202028'
    this.foreContextB.fillRect(0, 0, this.foreCanvas.width, this.foreCanvas.height)
    const pieceMatrixB = this.getPieceMatrix(this.player.forecastArray[1])
    this.drawSideBox(pieceMatrixB, this.foreContextB);

    this.foreContextC.fillStyle = '#202028'
    this.foreContextC.fillRect(0, 0, this.foreCanvas.width, this.foreCanvas.height)
    const pieceMatrixC = this.getPieceMatrix(this.player.forecastArray[2])
    this.drawSideBox(pieceMatrixC, this.foreContextC);
  }

  updateHeld() {
    // have box display piece
    this.heldContext.fillStyle = '#202028'
    this.heldContext.fillRect(0, 0, this.heldCanvas.width, this.heldCanvas.height)
    const pieceMatrix = this.getPieceMatrix(this.player.heldLetter)
    this.drawSideBox(pieceMatrix, this.heldContext);
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
        [0, 0, 0, 0],
        [5, 5, 5, 5],
        [0, 0, 0, 0]
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

  updateScore(newScore) {
    const amountOfDigits = newScore.toString().length
    const zeroesToAdd = 10 - amountOfDigits
    const score = this.element.querySelector('.score')
    score.innerText = "0".repeat(zeroesToAdd) + newScore.toString()
  }

  gameOver() {
    this.arena.clear()
    this.player.score = 0
    this.updateScore(0)
  }
  // End of Tetris Class
}
