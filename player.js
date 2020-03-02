class Player {
  constructor(tetris) {
    this.tetris = tetris
    this.arena = tetris.arena
    this.position = { x: 0, y: 0 }
    this.matrix = null // matrix of current piece
    this.letter = null // letter of current piece

    this.canHold = true
    this.heldLetter = null
    this.score = 0
    this.dropInterval = 1000
    this.dropCounter = 0
    this.forecastArray = this.getInitialForecast()

    this.reset()
  }

  move(dir) {
    this.position.x += dir
    if (this.arena.collide(this)) {
      this.position.x -= dir
    }
  }

  rotate(dir) {
    const originalPosition = this.position.x
    let offset = 1
    this._rotateMatrix(this.matrix, dir)
    while (this.arena.collide(this)) {
      this.position.x += offset
      offset = -(offset + (offset > 0 ? 1 : -1))
      if (offset > this.matrix[0].length) {
        console.log("no turn");
        this._rotateMatrix(this.matrix, -dir)
        this.position.x = originalPosition
        return;
      }
    }
  }

  _rotateMatrix(matrix, dir) {
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
    if (dir > 0) {
      matrix.forEach(row => row.reverse())
    } else {
      matrix.reverse()
    }
  }

  drop(purposefulDrop) {
    this.position.y++
    if (purposefulDrop) {
      this.score += 1
      updateScore()
    }
    if (this.arena.collide(this)) {
      this.position.y--
      this.arena.merge(this)
      nextTurn()
    }
    this.dropCounter = 0
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
        updateScore()
        this.arena.merge(this)
        nextTurn()
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
    if (!providedLetter) {
      this.letter = this.forecastArray.shift()
      const newPiece = this.getTetriminoLetter()
      this.forecastArray.push(newPiece)
    } else {
      this.letter =  providedLetter
    }
    this.matrix = this.tetris.getPieceMatrix(this.letter)
    this.position.y = 0
    // sets at middle and lowers it to fit in this.arena
    this.position.x = (this.arena.matrix[0].length / 2 | 0) - (this.matrix[0].length / 2 | 0)
    if (this.arena.collide(this)) return gameOver()
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
