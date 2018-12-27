const path = require('path');
const fs = require('fs');
const uuid = require('uuid/v4');
const hello = require('./hello');

const filename = path.join(__dirname, '..', 'client-key.txt');

function getKey() {
  return fs.readFileSync(filename, 'utf8');
}

function setKey(key) {
  console.log('Storing client key:' + key);
  fs.writeFileSync(filename, key);
}

function getHandshake() {
  if (fs.existsSync(filename)) {
    var key = getKey();
    console.log('Client key:' + key);
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
        let json = JSON.parse(message.utf8Data);
        console.log('<--- received: %o', json);
        this.stack.get(json.id)(json);
      }
    });
  }

  disconnect() {
    this.connection.close();
  }

  async handshake() {
    let { connection, handshaken, stack } = this;
    return new Promise(resolve => {
      if (handshaken) {
        resolve(this);
      } else {
        let handshake = getHandshake();
        console.log('Sending handshake: %s', handshake);
        stack.set('register_0', message => {
          if (message.type === 'registered') {
            let { 'client-key': key } = message.payload;
            setKey(key);
            this.handshaken = true;
            resolve(this);
          }
        });
        connection.send(handshake);
      }
    });
  }

  async sendRequest(uri, payload = null) {
    if (!this.handshaken) {
      await this.handshake();
    }
    return this.sendCommand({ uri, payload, type: 'request' });
  }

  sendCommand(request) {
    let id = uuid();
    let { connection, stack } = this;
    let message = JSON.stringify({ id, ...request });
    console.log('---> Sending command:' + message);
    return new Promise((resolve, reject) => {
      stack.set(id, message => {
        resolve(message);
      });
      if (connection.connected) {
        connection.send(message);
      } else {
        console.log('Error, not connected to TV:' + err.toString());
        reject('Not connected');
      }
    });
  }

  showFloat(message) {
    return this.sendRequest('ssap://system.notifications/createToast', {
      message
    });
  }

  getInputs() {
    return this.sendRequest('ssap://tv/getExternalInputList').then(
      ({ payload }) => {
        let { devices } = payload;
        return devices;
      }
    );
  }

  launchApp(id, params = null) {
    return this.sendRequest('ssap://system.launcher/launch', { id, params });
  }

  launchYoutube(contentTarget) {
    return this.launchApp('youtube.leanback.v4', { contentTarget });
  }

  getServices() {
    return this.sendRequest('ssap://api/getServiceList');
  }

  getApps() {
    return this.sendRequest(
      'ssap://com.webos.applicationManager/listLaunchPoints'
    );
  }

  setInput(inputId) {
    return this.sendRequest('ssap://tv/switchInput', {inputId})
  }

  setVolume(volume) {
    return this.sendRequest('ssap://audio/setVolume', {volume})
  }
}

module.exports.Connection = Connection;
