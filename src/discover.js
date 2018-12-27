const { createSocket } = require("dgram");

function sendSSDPDiscover(server) {
  let host = "239.255.255.250";
  let port = 1900;

  // these fields(with blank) are all required, tabs sensitive
  let message = `M-SEARCH * HTTP/1.1
HOST: ${host}:${port}
MAN: "ssdp:discover"
MX: 5
ST: urn:dial-multiscreen-org:service:dial:1
USER-AGENT: iOS/5.0 UDAP/2.0 iPhone/4

`;

  let buffer = Buffer.from(message);
  server.send(buffer, 0, buffer.length, port, host, (err, bytes) => {
    if (err) {
      throw err;
    }
  });
}

function discover(timeout = 0) {
  return new Promise(resolve => {
    let server = createSocket("udp4");
    let timer = null;
    server.on("listening", () => {
      let trySend = () => {
        sendSSDPDiscover(server);
        if (timeout > 0) {
          timer = setTimeout(() => {
            console.log('Timeout. Retrying.');
            trySend();
          }, timeout);
        }
      }
      trySend();
    });

    server.on("message", (message, remote) => {
      if (message.includes("Server: WebOS")) {
        clearTimeout(timer);
        server.close();
        resolve(remote);
      }
    });

    server.bind(); // listen to 0.0.0.0:random
  });
}

module.exports.discover = discover;
