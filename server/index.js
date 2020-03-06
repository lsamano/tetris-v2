const WebSocketServer = require('ws').Server;

const server = new WebSocketServer({port: 9000});

const sessions = new Map;

class Session {
  constructor(id) {
    this.id = id;
    this.clients = new Set;
  }

  join(client) {
    if (client.session) {
      throw new Error('Client already in session');
    }
    this.clients.add(client);
    client.session = this;
  }

  leave(client) {
    if (client.session !== this) {
      throw new Error('Client not in session');
    }
    this.clients.delete(client);
  }
}

class Client {
  constructor(conn) {
    this.conn = conn;
    this.session = null;
  }
}

function createId(length = 6, chars = 'abcdefghjkmnopqrstwxyz0123456789') {
  let id = '';
  while (length--) {
    id += chars[Math.random() * chars.length | 0];
  }
  return id;
}

server.on('connection', conn => {
  console.log("Connection established");
  const client = new Client(conn);

  conn.on('message', message => {
    console.log('Message received', message);

    if (message === 'create-session') {
      const id = createId();
      const session = new Session(id);
      sessaion.join(client);
      sessions.set(session.id, session);
      console.log(sessions);
    }
  })

  conn.on('close', () => {
    console.log("Connection closed");
  })
})
