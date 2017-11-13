'use strict';

const test = require('tape');
const buildSource = require('../../lib/definitions/build-source');

test('build-source', (t) => {
  const bs = buildSource();
  t.equal(bs.type, 'Binary', 'Binary type by default');
  t.ok(bs.binary, 'should have a binary object property');
  t.end();
});
