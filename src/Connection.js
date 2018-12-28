const path = require('path');
const fs = require('fs');
const util = require('util');
const uuid = require('uuid/v4');
const hello = require('./hello');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const exists = util.promisify(fs.exists);

const filename = path.join(__dirname, '..', 'client-key.txt');

async function getKey() {
  return readFile(filename, 'utf8');
}

async function setKey(key) {
  return writeFile(filename, key);
}

async function getHandshake() {
  if (await exists(filename)) {
    var key = await getKey();
    return JSON.stringify({
      ...hello,
      payload: { ...hello.payload, 'client-key': key }
    });
  } else {
    console.log("First usage, let's pair with TV.");
    return JSON.stringify(hello);
  }
}

class Connection {
  constructor(connection) {
    this.connection = connection;
    this.stack = new Map();
    this.handshaken = false;

    connection.on('error', error => {
      console.error('Connection Error: ' + error.toString());
      throw new Error('Websocket connection error:' + error.toString());
    });
    connection.on('close', () => {
      console.log('LG TV Disconnected');
      this.connection = null;
    });
    connection.on('message', message => {
      if (message.type !== 'utf8') {
        console.warn('<--- received: %s', message.toString());
      } else {
        let {id, ...data} = JSON.parse(message.utf8Data);
        // console.log('<--- received: %o', message);
        if (this.stack.has(id)) {
          this.stack.get(id)(data);
        }
      }
    });
  }

  disconnect() {
    this.connection.close();
  }

  async handshake() {
    let { connection, handshaken, stack } = this;
    return new Promise(async resolve => {
      if (handshaken) {
        resolve(this);
      } else {
        let handshake = await getHandshake();
        console.log('Sending handshake.');
        stack.set('register_0', async message => {
          if (message.type === 'registered') {
            let { 'client-key': key } = message.payload;
            // @todo
            await setKey(key);
            this.handshaken = true;
            resolve(this);
          }
        });
        connection.send(handshake);
      }
    });
  }

  async send(params) {
    if (!this.handshaken) {
      await this.handshake();
    }

    let id = uuid();
    let { listener, ...request } =
      typeof params === 'function' ? params() : params;
    let { connection, stack } = this;
    let message = JSON.stringify({ id, ...request });
    console.log('---> Sending command: ', { id, ...request });
    return new Promise((resolve, reject) => {
      if (request.type === 'subscribe' && listener) {
        stack.set(id, listener);
        resolve(() => stack.delete(id));
      } else {
        stack.set(id, resolve);
      }
      if (connection.connected) {
        connection.send(message);
      } else {
        console.log('Error, not connected to TV:' + err.toString());
        reject('Not connected');
      }
    });
  }
}

module.exports.Connection = Connection;
