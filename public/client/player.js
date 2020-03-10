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
      // this.dropCounter -= 50;
      // console.log('slow', this.dropCounter);
      this.position.x += offset
      offset = -(offset + (offset > 0 ? 1 : -1))
      if (offset > this.matrix[0].length) {
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
        // OR save piece to box
        this.heldLetter = this.letter
        this.tetris.updateHeld() // update the savedLetter canvas
        this.reset() // move onto next piece
        this.tetris.updateForecast()
      }
    }
  }

  hardDrop() {
    const originalPosition = this.position.y
    while (true) {
      // move this down until collide
      this.position.y++
      if (this.arena.collide(this)) {
        // move back up one, merge with field
        this.position.y--
        this.score += (this.position.y - originalPosition)
        this.events.emit('score', this.score);
        this.arena.merge(this)
        this.nextTurn()
        this.dropCounter = 0
        break;
      }
    }
  }

  update(deltaTime) {
    this.dropCounter += deltaTime;
    if (this.dropCounter > this.dropInterval) {
      this.drop()
    }
  }

  reset(providedLetter) {
    if (this.incomingGarbage > 0) {
      this.arena.receiveAttack(this, this.incomingGarbage);
      this.incomingGarbage = 0;
    }

    if (!providedLetter) {
      this.letter = this.forecast.shift()
      const newPiece = this.getTetriminoLetter()
      this.forecast.push(newPiece)
    } else {
      this.letter =  providedLetter
    }
    this.matrix = this.tetris.getPieceMatrix(this.letter)
    this.position.y = 0
    // sets at middle and lowers it to fit in this.arena
    this.position.x = (this.arena.matrix[0].length / 2 | 0) - (this.matrix[0].length / 2 | 0)

    if (this.arena.collide(this)) return this.gameOver()

    this.events.emit('position', this.position);
    this.events.emit('matrix', this.matrix);
    this.events.emit('heldLetter', this.heldLetter);
    this.events.emit('forecast', this.forecast);
  }

  gameOver() {
    this.arena.clear()
    this.score = 0
    this.events.emit('score', this.score);
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

  nextTurn() {
    const rowsCleared = this.arena.sweep(this);
    if (rowsCleared > 0) {
      this.calculateGarbage(rowsCleared);
    }

    this.reset()
    this.tetris.updateForecast()
    this.events.emit('score', this.score);
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
