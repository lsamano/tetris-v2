class TetrisManager {
  constructor(document) {
    this.document = document
    this.template = document.getElementById('full-game-template')
    this.instances = new Set;
  }

  createPlayer(opponent) {
    const element = this.document.importNode(this.template.content, true).children[0];
    const tetris = new Tetris(element);
    this.instances.add(tetris);

    if (opponent) {
      const startButton = element.querySelector(".start-button")
      startButton.remove()
    }
    
    this.document.body.appendChild(tetris.element);
    return tetris;
  }

  removePlayer(tetris) {
    this.instances.delete(tetris)
    this.document.body.removeChild(tetris.element);
  }

  sortPlayers(tetrisGames) {
    tetrisGames.forEach(tetris => {
      this.document.body.appendChild(tetris.element);
    })
  }
}
