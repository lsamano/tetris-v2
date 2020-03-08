const PORT = process.env.PORT || 9000;
//
// const express = require('express');
// const server = express();
// var path = require("path");
//
// server.use(express.static(__dirname + '/'));
// server.use('/client', express.static('client'))
// // server.use('/views', express.static('client'))
//
// server.use((req, res) => res.sendFile('index.html', { root: __dirname }))
//
// server.listen(PORT, () => console.log(`Listening on ${PORT}`));
//
//
// server.get('/', function (req, res) {
//   res.sendFile(path.join(__dirname + '/../client/index.html'));
// });
//
// // const WebSocketServer = require('ws').Server;
// const Session = require('./session');
// const Client = require('./client');
//
// // const server = new WebSocketServer({port: 9000});
// const { Server } = require('ws');
// const wss = new Server({ server, port:8000 });
//
// console.log("hi", wss);

const http = require('http');
const express = require('express');
const WebSocketServer = require('ws').Server;
const Session = require('./session');
const Client = require('./client');

const app = express();
app.use(express.static('./public'));

const server = http.createServer(app);
const wss = new WebSocketServer({server});

server.listen(PORT, () => console.log(`Listening on ${PORT}`));

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
        clients: clients.map(client => {
          return {
            id: client.id,
            state: client.state
          }
        })
      }
    });
  })
}

wss.on('connection', (conn, req) => {
  console.log("Connection established");
  const client = createClient(conn);

  console.log(req.connection.remoteAddress);

  conn.on('message', message => {
    console.log('Message received', message);
    const data = JSON.parse(message)

    if (data.type === 'create-session') {
      const session = createSession();
      session.join(client);
      client.state = data.state;
      client.send({
        type: 'session-created',
        id: session.id
      });
    } else if (data.type === 'join-session') {
      const session = getSession(data.id) || createSession(data.id);
      session.join(client);
      client.state = data.state;
      broadcastSession(session);
    } else if (data.type === 'state-update') {
      const [prop, value] = data.state;
      client.state[data.fragment][prop] = value;
      client.broadcast(data);
    }
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
