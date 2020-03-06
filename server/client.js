class Client {
  constructor(conn) {
    this.conn = conn;
    this.session = null;
  }

  send(data) {
    const message = JSON.stringify(data);
    console.log(`Sending message ${message}`);
    this.conn.send(message, function ack(error) {
      if (error) {
        console.error('Message failed', message, error)
      }
    })
  }
}

module.exports = Client;
