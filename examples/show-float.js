const { discover } = require('../src/discover');
const { connect } = require('../src/connect');
const { showFloat } = require('../src/commands');

async function run() {
  let { address } = await discover(2000);
  let tv = await connect(address);

  tv.send(showFloat('It works.'));

  tv.disconnect();
}

run();
