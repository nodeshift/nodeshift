const test = require('tape');

const binaryBuild = require('../lib/binary-build');

test('binary build test', (t) => {
  t.equal(typeof binaryBuild, 'function', 'this module exports a function');
  t.end();
});
