class Player {
  constructor() {
    this.position = { x: 0, y: 0 }
    this.matrix = null // matrix of current piece
    this.letter = null // letter of current piece

    this.canHold = true
    this.heldLetter = null
    this.score = 0
    this.dropInterval = 1000
    this.dropCounter = 0
    this.forecastArray = this.getInitialForecast()
  }

  move(dir) {
    this.position.x += dir
    if (collide(arena, this)) {
      this.position.x -= dir
    }
  }

  rotate(dir) {
    const originalPosition = this.position.x
    let offset = 1
    this._rotateMatrix(this.matrix, dir)
    while (collide(arena, this)) {
      this.position.x += offset
      offset = -(offset + (offset > 0 ? 1 : -1))
      if (offset > this.matrix[0].length) {
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
    if (collide(arena, this)) {
      this.position.y--
      merge(arena, this)
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
        updateHeld() // update the savedLetter canvas
        this.reset(this.letter) // use saved piece
      } else {
        // OR save piece to box
        this.heldLetter = this.letter
        updateHeld() // update the savedLetter canvas
        this.reset() // move onto next piece
        updateForecast()
      }
    }
  }

  hardDrop() {
    const originalPosition = this.position.y
    while (true) {
      // move this down until collide
      this.position.y++
      if (collide(arena, this)) {
        // move back up one, merge with field
        this.position.y--
        this.score += (this.position.y - originalPosition)
        updateScore()
        merge(arena, this)
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
      const newPiece = getTetriminoLetter()
      this.forecastArray.push(newPiece)
    } else {
      this.letter =  providedLetter
    }
    this.matrix = getPieceMatrix(this.letter)
    this.position.y = 0
    // sets at middle and lowers it to fit in arena
    this.position.x = (arena[0].length / 2 | 0) - (this.matrix[0].length / 2 | 0)
    if (collide(arena, this)) return gameOver()
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
