'use strict';

const cli = require('./bin/cli');
// Expose some API

function deployApplication (options) {
  // This will do the whole thing
  return cli(options);
}

module.exports = {
  deployApplication
};
