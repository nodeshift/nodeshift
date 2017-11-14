'use strict';

const test = require('tape');
const buildOutput = require('../../lib/definitions/build-output');

test('buildOutput test', (t) => {
  const bo = buildOutput('buildOutput');
  t.equal(bo.to.kind, 'ImageStreamTag', 'defaults to ImageStreamTag');
  t.equal(bo.to.name, 'buildOutput', 'should have a name that is the value of the argument');
  t.end();
});
