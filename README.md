# LGTV

## Installation

`npm install @w4f/lgtv` and set up the TV per below.

## Discovering the TV

```js
const { discover } = require('@w4f/lgtv/src/discover');
discover(2000).then(tvInfo => {
  console.log(tvInfo);
});
```

## Connecting to the TV

```js
const { connect } = require('@w4f/lgtv/src/connect');
connect(address).then(tv => {
  console.log(tv);
});
```

## Sending a command

```js
const { discover } = require('@w4f/lgtv/src/discover');
const { connect } = require('@w4f/lgtv/src/connect');
const { setVolume } = require('@w4f/lgtv/src/commands');

async function run() {
  let { address } = await discover(2000);
  let tv = await connect(address);

  await tv.send(setVolume(15));
  tv.disconnect();
}

run();
```

## Subscribing to events

```js
const { discover } = require('@w4f/lgtv/src/discover');
const { connect } = require('@w4f/lgtv/src/connect');
const { getVolume } = require('@w4f/lgtv/src/commands');

function listener({ payload }) {
  const { changed, action, muted, volume } = payload;
  if (typeof changed === 'undefined' || action !== 'changed') {
    return;
  }
  if (changed.includes('muted')) {
    console.log('Muted', muted);
  }
  if (changed.includes('volume')) {
    console.log('Volume', volume);
  }
}
async function run() {
  let { address } = await discover(2000);
  let tv = await connect(address);
  let unsubscribe = await tv.send(getVolume(listener));
}

run();
```
