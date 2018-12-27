const { discover } = require('./src/discover');
const { connect } = require('./src/connect');

async function run() {
  let { address } = await discover(20);
  console.log('jhgfds');
  
  let tv = await connect(address);
  await tv.setInput('HDMI_1');
  await tv.setVolume(15);
  tv.disconnect();
}

run();
