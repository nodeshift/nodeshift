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

test('resource goal - knative is true', (t) => {
  const resourceGoal = proxyquire('../../lib/goals/resource', {
    '../resource-loader': () => Promise.resolve([{ kind: 'Deployment', apiVersion: 'v1' }, { kind: 'Service', apiVersion: 'serving.knative.dev' }]),
    '../enrich-resources': (config, list) => {
      t.equal(list.length, 1, 'non-knative resources should get removed');
      return Promise.resolve(list);
    },
    '../resource-writer': () => Promise.resolve()
  });

  const rg = resourceGoal({ knative: true }).then(() => {
    t.pass('successful call');
    t.end();
  });

  t.equal(rg instanceof Promise, true, 'returns a promise');
});
