class ConnectionManager {
  constructor(tetrisManager) {
    this.conn = null;
    this.peers = new Map;
    this.tetrisManager = tetrisManager;
    this.localTetris = [...tetrisManager.instances][0]
  }

  connect(address) {
    this.conn = new WebSocket(address);

    this.conn.addEventListener('open', event => {
      console.log('Connection established');
      this.initSession();
      this.watchEvents();
    });

    this.conn.addEventListener('message', event => {
      // console.log('Received message,', event.data);
      this.receive(event.data);
    })
  }

  initSession() {
    const sessionId = window.location.hash.split('#')[1];
    const state = this.localTetris.serialize();
    if (sessionId) {
      this.send({
        type: 'join-session',
        id: sessionId,
        state
      })
    } else {
      this.send({
        type: 'create-session',
        state
      });
    }
  }

  watchEvents() {
    const local = this.localTetris;
    const player = local.player;

    const propsArray = ['position', 'matrix', 'score', 'heldLetter', 'forecast', 'incomingGarbage']
    propsArray.forEach(prop => {
      player.events.listen(prop, value => {
        this.send({
          type: 'state-update',
          fragment: 'player',
          state: [prop, value]
        })
      })
    })

    player.events.listen('garbage', value => {
      this.send({
        type: 'update-my-state',
        rowCount: value
      })
    })

    const arena = local.arena;
    ['matrix'].forEach(prop => {
      arena.events.listen(prop, value => {
        this.send({
          type: 'state-update',
          fragment: 'arena',
          state: [prop, value]
        })
      })
    })
  }

  updateManager(peers) {
    const myId = peers.you;
    const clients = peers.clients.filter(client => myId !== client.id);
    clients.forEach(client => {
      if (!this.peers.has(client.id)) {
        const tetris = this.tetrisManager.createPlayer(true);

        this.peers.set(client.id, tetris);
        tetris.unserialize(client.state);
      }
    });

    [...this.peers.entries()].forEach(([id, tetris]) => {
      if (!clients.some(client => client.id === id)) {
        this.tetrisManager.removePlayer(tetris);
        this.peers.delete(id);
      }
    });
    const sorted = peers.clients.map(client => {
      return this.peers.get(client.id) || this.localTetris
    })
    this.tetrisManager.sortPlayers(sorted);
  }

  updatePeer(id, fragment, [prop, value]) {
    if (!this.peers.has(id)) {
      // console.log(id);
      throw new Error('Client does not exist', id);
    }
    const tetris = this.peers.get(id);
    tetris[fragment][prop] = value;

    if (prop === 'score') {
      tetris.updateScore(value);
    } else if (prop === 'incomingGarbage') {
      tetris.updateIndicator();
    }
    else {
      tetris.drawNextTurn();
    }
  }

  updateSelf(rowCount) {
    this.localTetris.receiveIncomingAttack(rowCount);
  }

  receive(message) {
    const data = JSON.parse(message);
    if (data.type === 'session-created') {
      window.location.hash = data.id;
    } else if (data.type === 'session-broadcast') {
      this.updateManager(data.peers);
    } else if (data.type === 'state-update') {
      this.updatePeer(data.clientId, data.fragment, data.state);
    } else if (data.type === 'update-my-state') {
      this.updateSelf(data.rowCount);
    }
  }

  send(data) {
    const message = JSON.stringify(data);
    // console.log(`Sending message ${message}`);
    this.conn.send(message);
  }
}
