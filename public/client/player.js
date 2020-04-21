class Player {
  constructor(tetris) {
    this.tetris = tetris
    this.arena = tetris.arena
    this.position = { x: 0, y: 0 }
    this.matrix = null // matrix of current piece
    this.letter = null // letter of current piece

    this.events = new Events();

    this.canHold = true
    this.heldLetter = null
    this.score = 0
    this.dropInterval = 1000
    this.dropCounter = 0
    this.incomingGarbage = 0;
    this.forecast = this.getInitialForecast();

    this.reset();
  }

  move(direction) {
    this.position.x += direction
    if (this.arena.collide(this)) {
      this.position.x -= direction
      return;
    }
    this.events.emit('position', this.position);
  }

  rotate(direction) {
    const originalPosition = this.position.x;
    let offset = 1;
    this._rotateMatrix(this.matrix, direction)
    while (this.arena.collide(this)) {
      this.position.x += offset
      offset = -(offset + (offset > 0 ? 1 : -1))
      if (offset > this.matrix[0].length + 1) {
        this._rotateMatrix(this.matrix, -direction)
        this.position.x = originalPosition
        return;
      }
    }
    this.events.emit('matrix', this.matrix);
  }

  _rotateMatrix(matrix, direction) {
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
    if (direction > 0) {
      matrix.forEach(row => row.reverse())
    } else {
      matrix.reverse()
    }
  }

  update(deltaTime) {
    this.dropCounter += deltaTime;
    if (this.dropCounter > this.dropInterval) {
      this.drop()
    }
  }

  hold() {
    if (this.canHold) {
      // prevent another switch this round
      this.canHold = false
      if (this.heldLetter) {
        // grab saved letter and switch
        [this.heldLetter, this.letter] = [this.letter, this.heldLetter]
        this.tetris.updateHeld() // update the savedLetter canvas
        this.reset(this.letter) // use saved piece
      } else {
        this.reset() // move onto next piece
        // save new piece to box
        this.heldLetter = this.letter
        // update the savedLetter canvas
        this.tetris.updateHeld()
        this.tetris.updateForecast()
      }
    }
  }

  drop(purposefulDrop) {
    this.position.y++
    this.dropCounter = 0
    if (purposefulDrop) {
      this.score += 1
      this.events.emit('score', this.score);
    }
    if (this.arena.collide(this)) {
      this.position.y--
      this.arena.merge(this)
      this.nextTurn()
      return;
    }
    this.events.emit('position', this.position);
  }

  hardDrop() {
    const originalPosition = this.position.y
    this.position.y = this.tetris.getGhostCoordinate()
    this.score += (this.position.y - originalPosition)
    this.events.emit('score', this.score);
    this.arena.merge(this)
    this.nextTurn()
    this.dropCounter = 0
  }

  nextTurn() {
    // calculate rows cleared
    const rowsCleared = this.arena.sweep(this);

    // nullify incoming garbage
    if (rowsCleared > 0) {
      this.calculateGarbage(rowsCleared);
    }

    // put player back on top with new letter
    this.reset()
    this.tetris.updateForecast()
    this.events.emit('score', this.score);
  }

  reset(providedLetter) {
    // if there is incoming garbage, receive the attack
    if (!providedLetter && this.incomingGarbage > 0) {
      if (this.heldLetter) {
        this.arena.receiveAttack(this, this.incomingGarbage);
        this.incomingGarbage = 0;
      }
    }

    if (!providedLetter) {
      // if this is a normal turn, get next letter from forecast
      this.letter = this.forecast.shift()
      const newPiece = this.getTetriminoLetter()
      this.forecast.push(newPiece)
    } else {
      // if this follows a hold, use the former held letter
      this.letter =  providedLetter
    }

    // set player at top with new piece
    this.matrix = this.tetris.getPieceMatrix(this.letter)
    this.position.y = 0
    this.position.x = (this.arena.matrix[0].length / 2 | 0) - (this.matrix[0].length / 2 | 0)     // sets at middle and lowers it to fit in this.arena

    // if there is collision upon reset, end game
    if (this.arena.collide(this)) {
      // merges final piece onto arena
      this.matrix.shift()
      this.arena.merge(this)
      this.gameOver()
    }
    this.events.emit('position', this.position);
    this.events.emit('matrix', this.matrix);
    this.events.emit('heldLetter', this.heldLetter);
    this.events.emit('forecast', this.forecast);
  }

  gameOver() {
    // pauses game and ends it
    this.tetris.paused = true
    this.tetris.gameEnded = true
  }

  getTetriminoLetter() {
    const pieces = 'ILJOSTZ'
    const randomIndex = pieces.length * Math.random() | 0
    return pieces[randomIndex]
  }

  calculateScore(additionalRowsCleared) {
    let baseScore = 100
    if (additionalRowsCleared === 3) {
      baseScore += 100
    }
    this.score += baseScore + additionalRowsCleared * 200
  }

  calculateSpeed() {
    if (this.score < 1000 ) {
      this.dropInterval = 1000
    } else if (this.score < 3000) {
      this.dropInterval = 750
    } else { // if score >= 500
      this.dropInterval = 500
    }
  }

  calculateGarbage(rowsCleared) {
    const adjustedLines = rowsCleared < 4 ? rowsCleared - 1 : rowsCleared;
    if (this.incomingGarbage > 0) { // if garbage
      const leftover = adjustedLines - this.incomingGarbage;
      if (leftover > 0) { // if cleared > garbage
        this.incomingGarbage = 0;
        this.events.emit('garbage', leftover);
      } else { // didn't block enough
        this.incomingGarbage = -leftover;
      }
    } else { // no garbage, immediately send attack
      this.events.emit('garbage', adjustedLines);
    }
  }

  getInitialForecast() {
    return this.shuffle(['I', 'L', 'J', 'O', 'S', 'T', 'Z'])
  }

  shuffle(array) {
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
}
// End of Player Class
