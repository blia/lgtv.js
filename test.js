const { discover } = require("./src/discover");

discover(5000)
  .then(tv => console.log(tv))
  .catch(err => console.error(err))
