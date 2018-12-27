const WebSocketClient = require('websocket').client;
const { Connection } = require('./Connection');

const WSURL = 'ws://lgsmarttv.lan:3000';

function connect(address) {
  let client = new WebSocketClient();
  let url = address ? `ws://${address}:3000` : WSURL;
  return new Promise((resolve, reject) => {
    client.on('connect', connection => {
      console.log(`Client Connected on URL: ${url}`);
      resolve(new Connection(connection))
    });
    client.on('connectFailed', err => {
      console.log(`Connection falied on URL: ${url}`);
      reject(err);
    });
    try {
      client.connect(url);
    } catch (e) {
      reject(e);
    }
  });
}

module.exports.connect = connect;
