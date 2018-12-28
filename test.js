const { discover } = require('./src/discover');
const { connect } = require('./src/connect');
const { getVolume, setVolume } = require('./src/commands');

function listener(json) {
  console.log('BLIA', json.payload.volume);
}

async function run() {
  let { address } = await discover(2000);
  let tv = await connect(address);

  let unsubscribe = await tv.send(getVolume(listener));

  await tv.send(setVolume(5));
  await tv.send(setVolume(25));
  unsubscribe();
  await tv.send(setVolume(15));
  // tv.disconnect();
}

run();
