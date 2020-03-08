class Arena {
  constructor(width, height) {
    const newMatrix = []
    while (height--) {
      newMatrix.push(new Array(width).fill(0))
    }
    this.matrix = newMatrix

    this.events = new Events;
  }

  sweep(player) {
    let rowCount = 0;
    outer: for (let y = this.matrix.length - 1; y > 0; --y) {
      for (let x = 0; x < this.matrix[y].length; ++x) {
        if (this.matrix[y][x] === 0) { // if any pixel is not filled, move onto next row
            continue outer;
        }
      } // checks that all pixels are filled

      const row = this.matrix.splice(y, 1)[0].fill(0) // remove row
      this.matrix.unshift(row); // add blank row to top of arena
      ++y // check next arena row
      rowCount += 1
    }
    if (rowCount > 0) {
      player.calculateScore(rowCount - 1)
      player.calculateSpeed()
    }
    this.events.emit('matrix', this.matrix);
  }

  collide(player) {
    const [playerMatrix, playerPosition] = [player.matrix, player.position]
    for (let y = 0; y < playerMatrix.length; ++y) { // per row
      const arenaRow = this.matrix[y + playerPosition.y]
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

  merge(player) {
    player.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          this.matrix[y + player.position.y][x + player.position.x] = value
        }
      });
    });
    // if merged, set ability to switch back to true
    player.canHold = true;
    this.events.emit('matrix', this.matrix);
  }

  clear() {
    this.matrix.forEach(row => row.fill(0));
    this.events.emit('matrix', this.matrix);
  }
}
