class Player {
  constructor(tetris) {
    this.tetris = tetris
    this.arena = tetris.arena

    this.position = { x: 0, y: 0 }
    this.matrix = null // matrix of current piece
    this.letter = null // letter of current piece
    this.rotaStateIndex = 0 // rotation state of current piece

    this.events = new Events();

    this.canHold = true
    this.heldLetter = null
    this.score = 0
    this.dropInterval = 1000
    this.dropCounter = 0
    this.incomingGarbage = [];
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

  getCircularIndex(direction) {
    const newRotaState = this.rotaStateIndex + direction
    if (newRotaState === 4) {
      return 0
    } else if (newRotaState === -1) {
      return 3
    } else {
      return newRotaState
    }
  }

  // returns SRS Offset Data based on letter
  offsetData = () => {
    if (this.letter === "O") {
      return {
        0: [ {x:0, y:0} ],
        1: [ {x:0, y:1} ],
        2: [ {x:-1, y:1} ],
        3: [ {x:-1, y:0} ]
      }
    } else if (this.letter === "I") {
      return {
        0: [ {x:0, y:0}, {x:-1, y:0}, {x:2, y:0}, {x:-1, y:0}, {x:2, y:0} ],
        1: [ {x:-1, y:0}, {x:0, y:0}, {x:0, y:0}, {x:0, y:-1}, {x:0, y:2}, ],
        2: [ {x:-1, y:-1}, {x:1, y:-1}, {x:-2, y:-1}, {x:1, y:0}, {x:-2, y:0} ],
        3: [ {x:0, y:-1}, {x:0, y:-1}, {x:0, y:-1}, {x:0, y:1}, {x:0, y:-2} ]
      }
    } else {
      return {
        0: [ {x:0, y:0}, {x:0, y:0}, {x:0, y:0}, {x:0, y:0}, {x:0, y:0} ],
        1: [ {x:0, y:0}, {x:1, y:0}, {x:1, y:+1}, {x:0, y:-2}, {x:1, y:-2}, ],
        2: [ {x:0, y:0}, {x:0, y:0}, {x:0, y:0}, {x:0, y:0}, {x:0, y:0} ],
        3: [ {x:0, y:0}, {x:-1, y:0}, {x:-1, y:+1}, {x:0, y:-2}, {x:-1, y:-2} ]
      }
    }
  }

  rotate(direction) {
    const originalPositionX = this.position.x;
    const originalPositionY = this.position.y;
    // get current rotaState's offsetData
    const offsetData = this.offsetData()
    const currentOffsetData = offsetData[this.rotaStateIndex]
    // find attemptedRotaIndex and its offsetData
    const attemptedRotaIndex = this.getCircularIndex(direction)
    const attemptedOffsetData = offsetData[attemptedRotaIndex]
    // apply rotation
    this._rotateMatrix(this.matrix, direction)

    // while there is still offset data,
    for (let i = 0; i < currentOffsetData.length; i++) {
      const currOffset = currentOffsetData[i] // {x:0, y:0}
      const attemptedOffset = attemptedOffsetData[i] // {x:0, y:0}
      // subtract currOffset[i] with attemptedOffset[i]
      const translation = {
        x: currOffset.x - attemptedOffset.x,
        y: currOffset.y - attemptedOffset.y
      }
      // apply offset
      const dummyPosition = {
        x: this.position.x + translation.x,
        y: this.position.y + translation.y
      }
      if (this.arena.collide({matrix:this.matrix, position: dummyPosition})) {
        // if collision, check next offsetData
        continue;
      } else {
        // if no collision, finalize position
        this.position.x = dummyPosition.x
        this.position.y = dummyPosition.y
        // change current rotaState to new one
        this.rotaStateIndex = attemptedRotaIndex
        return;
      }

    }
    // if end of offset data, return to originalPosition
    this._rotateMatrix(this.matrix, -direction)
    this.position.x = originalPositionX
    this.position.y = originalPositionY
    return;
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
        // save new piece to box
        this.heldLetter = this.letter
        // update the savedLetter canvas
        this.tetris.updateHeld()
        this.tetris.updateForecast()
        this.reset(null) // move onto next piece
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
    // Allow holding again
    if (!this.canHold) {
      this.canHold = true;
    }

    // calculate rows cleared
    const rowsCleared = this.arena.sweep(this);

    if (rowsCleared > 0) {
      // nullify incoming garbage if cleared rows this turn
      // will also send attack if it can
      this.calculateGarbage(rowsCleared);
      this.tetris.updateIndicator();

    } else if (this.incomingGarbage.length > 0) {
      // if there is incoming garbage, receive the attack
      this.arena.receiveAttack(this, this.incomingGarbage);
      this.tetris.clearCanvas(this.tetris.garbageCanvas, this.tetris.garbageContext)
      this.incomingGarbage = [];
      this.events.emit('incomingGarbage', this.incomingGarbage);
    }

    // put player back on top with new letter
    this.reset()
    this.tetris.updateForecast()
    this.events.emit('score', this.score);
  }

  reset(providedLetter) {
    this.rotaStateIndex = 0

    if (!providedLetter) {
      // if this is a normal turn, get next letter from forecast
      this.letter = this.forecast.shift()
      if (this.forecast.length < 7) {
        this.generateNewBag()
      }
    } else {
      // if this follows a hold, use the former held letter
      this.letter =  providedLetter
    }

    // set player at top with new piece
    this.matrix = this.tetris.getPieceMatrix(this.letter)
    this.position.y = 0
    this.position.x = (this.arena.matrix[0].length / 2 | 0) - Math.ceil(this.matrix[0].length / 2)     // sets at middle and lowers it to fit in this.arena

    // if there is collision upon reset, end game
    if (this.arena.collide(this)) {
      // merges final piece onto arena
      this.matrix.shift()
      this.arena.merge(this)
      this.tetris.gameOver()
    }
    this.events.emit('position', this.position);
    this.events.emit('matrix', this.matrix);
    this.events.emit('heldLetter', this.heldLetter);
    this.events.emit('forecast', this.forecast);
  }

  generateNewBag() {
    const pieces = 'ILJOSTZ'.split('')
    const randomizedBag = this.shuffle(pieces)
    this.forecast = this.forecast.concat(randomizedBag)
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
    } else { // if score >= 3000
      this.dropInterval = 500
    }
  }

  removeGarbage(attackAmount) {
    // grab oldest incomingGarbage and subtract our leftover/rowsCleared
    const leftoverAttackLines = attackAmount - this.incomingGarbage[0];

    // if we ran out of leftover/rowsCleared, set oldestGarb to new number remainder
    if (leftoverAttackLines <= 0) {
      this.incomingGarbage[0] = -leftoverAttackLines
      return;
    } else if (this.incomingGarbage.length > 0) {
      // if there is still more garbage (and consequently we still have more leftover),
      // shift the incomingGarbage and run this function again
      this.incomingGarbage.shift()
      return this.removeGarbage(leftoverAttackLines)
    } else {
      // else (no garb and we have leftover) return the remainder as an attack
      return this.events.emit('garbage', attackAmount);
    }
    this.events.emit('incomingGarbage', this.incomingGarbage)
  }

  calculateGarbage(rowsCleared) {
    const adjustedLines = rowsCleared < 4 ? rowsCleared - 1 : rowsCleared;
    if (this.incomingGarbage.length > 0) { // if there is incoming garbage
      this.removeGarbage(adjustedLines) // recursively remove garbage
    } else { // no garbage, immediately send attack
      this.events.emit('garbage', adjustedLines);
    }
  }

  receiveIncomingAttack(rowCount) {
    this.incomingGarbage.push(rowCount);

    // visualize rows in garbage indicator pillar
    this.tetris.updateIndicator();

    // emit event for opponent to see
    this.events.emit('incomingGarbage', this.incomingGarbage)
  }

  getInitialForecast() {
    return this.shuffle(['I', 'L', 'J', 'O', 'S', 'T', 'Z'])
  }

  shuffle(array) {
    // Fisher-Yates shuffle
    let currentIndex = array.length, temporaryValue, randomIndex;

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
