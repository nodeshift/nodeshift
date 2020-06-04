'use strict';

const test = require('tape');
const proxyquire = require('proxyquire');

test('resource goal', (t) => {
  const resourceGoal = proxyquire('../../lib/goals/resource', {
    '../resource-loader': () => Promise.resolve([]),
    '../enrich-resources': () => Promise.resolve([]),
    '../resource-writer': () => Promise.resolve()
  });

  const rg = resourceGoal({}).then(() => {
    t.pass('successful call');
    t.end();
  });

  t.equal(rg instanceof Promise, true, 'returns a promise');
});
