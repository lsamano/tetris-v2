const WebSocketServer = require('ws').Server;

const Session = require('./session');
const Client = require('./client');

const server = new WebSocketServer({port: 9000});

const sessions = new Map;

function createId(length = 6, chars = 'abcdefghjkmnopqrstwxyz0123456789') {
  let id = '';
  while (length--) {
    id += chars[Math.random() * chars.length | 0];
  }
  return id;
}

function createClient(conn, id = createId()) {
  return new Client(conn, id);
}

function createSession(id = createId()) {
  if (sessions.has(id)) {
    throw new Error(`Session ${id} already exists`);
  }
  const session = new Session(id);
  console.log('Creating session', session);

  sessions.set(id, session)
  return session;
}

function getSession(id) {
  return sessions.get(id)
}

function broadcastSession(session) {
  const clients = [...session.clients];
  clients.forEach(client => {
    client.send({
      type: 'session-broadcast',
      peers: {
        you: client.id,
        clients: clients.map(client => client.id)
      }
    })
  })
}

server.on('connection', conn => {
  console.log("Connection established");
  const client = createClient(conn);

  conn.on('message', message => {
    console.log('Message received', message);
    const data = JSON.parse(message)

    if (data.type === 'create-session') {
      const session = createSession();
      session.join(client);
      client.send({
        type: 'session-created',
        id: session.id
      });
    } else if (data.type === 'join-session') {
      const session = getSession(data.id) || createSession(data.id);
      session.join(client);

      broadcastSession(session);
    }

    console.log('Sessions', sessions);
  })

  conn.on('close', () => {
    console.log("Connection closed");
    const session = client.session;
    if (session) {
      session.leave(client);
      if (session.clients.size === 0) {
        sessions.delete(session.id);
      }
    }

    broadcastSession(session);
  })
})
