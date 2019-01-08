const { discover } = require('./src/discover');
const { connect } = require('./src/connect');
const { getVolume } = require('./src/commands');
const loudness = require('loudness');

function listener({ payload }) {
  const {changed, action, muted, volume} = payload;
  if (typeof changed === 'undefined' || action !== 'changed') {
    return;
  }
  if (changed.includes('muted')) {
    console.log('Set mute', muted);
    loudness.setMuted(muted);
  }
  if (changed.includes('volume')) {
    console.log('Set volume', volume);
    loudness.setVolume(volume);
  }
}
async function run() {
  let { address } = await discover(2000);
  let tv = await connect(address);
  let unsubscribe = await tv.send(getVolume(listener));
}

run();
