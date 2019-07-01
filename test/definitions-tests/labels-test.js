'use strict';

const test = require('tape');
const labels = require('../../lib/definitions/labels');

test('labels test', (t) => {
  const l = labels({ label: 'cool thing' });
  t.equal(l.provider, 'nodeshift', 'nodeshift provider prop gets added');
  t.equal(l.label, 'cool thing', 'original label is still there');
  t.end();
});
