const lgtv = require('../src/');
const { discover, connect, getVolume, setVolume } = lgtv;

function listener({ payload }) {
  console.log('subscription: ', payload.volume);
}

async function run() {
  let { address } = await discover(2000);
  let tv = await connect(address);

  console.log(await tv.send(getVolume));

  let unsubscribe = await tv.send(getVolume(listener));

  await tv.send(setVolume(5));
  unsubscribe();
  await tv.send(setVolume(15));
  tv.disconnect();
}

run();
