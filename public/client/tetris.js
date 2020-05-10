class Tetris {
  constructor(element) {
    this.element = element
    this.paused = true
    this.gameOn = false
    this.gameDone = false

    // Initializes context, and sets it as dary grey
    const initializeBox = (element, contextString, size) => {
      this[contextString] = element.getContext('2d')
      this.clearCanvas(element, this[contextString], size)
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
    this.arena = new Arena(10, 21);

    // make default player
    this.player = new Player(this);

    this.player.events.listen('score', score => {
      this.updateScore(score);
    });

    // colors array for obtaining tetris piece colors
    // null, violet, yellow, orange, blue,
    // cyan, green, red, grey, white
    this.colors = [
      null, '#8A2BE2', '#e6c719', '#FF8C00', '#2b2bff',
      '#20dfdf', '#80e619', '#FF0032', '#808080', '#382c2f'
    ]

    this.lastTime = 0
    let requestId;

    this._update = (time = this.lastTime) => {
      if (this.paused) {
        cancelAnimationFrame(requestId);
        return;
      }
      const deltaTime = time - this.lastTime;
      this.lastTime = time
      this.player.update(deltaTime)

      this.drawNextFrame()
      requestId = requestAnimationFrame(this._update)
    }

    // Set intial score at 0
    this.updateScore(0)
  }

  run() {
    this.lastTime = performance.now();
    this._update();
  }

  drawNextFrame() {
    const context = this.context
    this.clearCanvas(this.canvas, context)
    this.drawMatrix([[9, 9, 9, 9, 9, 9, 9, 9, 9, 9]], context, {x: 0, y: 0}, 35, 0, true)
     this.drawMatrix(this.arena.matrix, context, {x: 0, y: 0}, 35) // draws previous board
     this.drawMatrix(
       this.player.matrix,
       context,
       { x: this.player.position.x, y: this.getGhostCoordinate() },
       35, 0, true
     ); // draw ghost piece
     this.drawMatrix(this.player.matrix, context, this.player.position, 35); // draws active piece
     this.updateHeld();
     this.updateForecast();
  }

  drawMatrix(matrix, givenContext, offset, scale, nudge, ghost, center) {
    // Fills a given context with a given matrix
    // scale and nudge are for styling the bevel
    // Can also center the matrix in the context
    let centerXBy = 0;
    let centerYBy = 0;
    if (center) {
      centerXBy = (givenContext.canvas.width - matrix[0].length*scale) / 2
      centerYBy = (givenContext.canvas.height - matrix.length*scale) / 2
    }

    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const colorCode = this.colors[value]
          const adj_x = (x + offset.x)*scale + centerXBy
          const adj_y = (y + offset.y)*scale + centerYBy

          if (ghost) {
            this.applyRadialGradient(givenContext, colorCode, adj_x, adj_y, scale)

          } else {
            this.applyGradients(givenContext, colorCode, adj_x, adj_y, scale, nudge)
          }
        }
      });
    });
  }

  applyRadialGradient(context, colorCode, x, y, scale) {
    const nudge = Math.ceil(scale / 2)
    const xCenter = x + nudge
    const yCenter = y + nudge
    let grd = context.createRadialGradient(xCenter, yCenter, 0, xCenter, yCenter, scale);
    grd.addColorStop(0, `${colorCode}00`);
    grd.addColorStop(1, colorCode);
    context.fillStyle = grd;
    context.fillRect(x, y, scale, scale);
  }

  applyGradients(context, colorCode, x, y, size, nudge = 3) {
    // base
    this.addOneGradient(context, "#e6e6e6", colorCode, x, y, size)
    // shadow
    this.addOneGradient(context, "#e6e6e600", "#D178784f", x, y, size)
    // inner bevel with shadow
    this.addOneGradient(context, colorCode, "#e6e6e6", x, y, size, nudge, 1.25)
    this.addOneGradient(context, "#D178784f", "#e6e6e600", x, y, size, nudge, 1.25)
    // innermost square
    this.addOneGradient(context, "#e6e6e6", colorCode, x, y, size, nudge+3, 1.5)
  }

  addOneGradient(context, color1, color2, x, y, size, nudge = 0, multiplier = 1) {
    const gradient = context.createLinearGradient(x, y, x+30*multiplier, y+30*multiplier);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    context.fillStyle = gradient;
    context.fillRect(
      x+nudge,
      y+nudge,
      size-nudge*2, size-nudge*2);
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
    let totalGarbage = this.player.incomingGarbage.reduce((total, num) => total + num, 0)
    totalGarbage = totalGarbage > 17 ? 17 : totalGarbage
    const newIndicatorArray = Array(17).fill([0]).fill([8], 17 - totalGarbage)
    this.drawMatrix(newIndicatorArray, this.garbageContext, {x: 0, y: 0}, 35, 3)
  }

  updateSideBox = (element, i) => {
    const context = i !== undefined ? `foreContext${i}` : "heldContext";
    const letter = i !== undefined ? this.player.forecast[i] : this.player.heldLetter;

    this.clearCanvas(element, this[context], 30)
    const pieceMatrix = this.getPieceMatrix(letter, "trimmed");

    this.drawSideBox(pieceMatrix, this[context], 30);
  }

  drawSideBox(matrix, providedContext, scale, nudge = 2) {
    // For drawing hold and forecast
    this.drawMatrix(matrix, providedContext, {x: 0, y: 0}, scale, nudge, false, true)
  }

  clearCanvas(element, context, scale = 35) {
    for (let h = 0; h < element.height; h += scale) {
      for (let w = 0; w < element.width; w += scale) {
        context.fillStyle = '#31313d';
        context.fillRect(w, h, scale, scale);
        this.addOneGradient(context, "#202028", "#16161c", w, h, scale, 1, 1)
      }
    }

  }

  getPieceMatrix(type, trimmed) {
    if (trimmed) {
      switch (type) {
        case 'T':
        return [
          [0, 1, 0],
          [1, 1, 1]
        ]
        case 'O':
        return [
          [2, 2],
          [2, 2],
        ]
        case 'Z':
        return [
          [7, 7, 0],
          [0, 7, 7]
        ]
        case 'S':
        return [
          [0, 6, 6],
          [6, 6, 0]
        ]
        case 'J':
        return [
          [4, 0, 0],
          [4, 4, 4],
        ]
        case 'L':
        return [
          [0, 0, 3],
          [3, 3, 3],
        ]
        case 'I':
        return [
          [0, 0, 0, 0],
          [5, 5, 5, 5],
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
    switch (type) {
      case 'T':
      return [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
      ]
      case 'O':
      return [
        [0, 2, 2],
        [0, 2, 2],
        [0, 0, 0]
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
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 5, 5, 5, 5],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0]
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
      this.drawNextFrame();
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
    startButton.remove();

    this.paused = false;
    this.gameOn = true;
    this.player.events.emit('gameOn', true);
    this.run();
  }

  gameOver() {
    // draws final board, pauses game, and ends it
    this.drawMatrix(this.arena.matrix, this.context, {x: 0, y: 0}, 35)
    this.arena.events.emit('matrix', this.matrix);
    this.paused = true;
    this.gameOn = false;
    this.gameDone = true;
  }

}
