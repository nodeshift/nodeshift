'use strict';

const test = require('tape');
const proxyquire = require('proxyquire');

test('apply resource test', (t) => {
  const resourceList = [];

  const applyResources = require('../lib/apply-resources');
  const ar = applyResources({}, resourceList).then(() => {
    t.end();
  });

  t.equal(ar instanceof Promise, true, 'function returns a promise');
});

test('apply resource test', (t) => {
  const resourceList = [
    { kind: 'Service' },
    { kind: 'Route' },
    { kind: 'DeploymentConfig' },
    { kind: 'Secret' },
    { kind: 'other' }
  ];

  const mockedPromiseResolve = () => Promise.resolve();

  const applyResources = proxyquire('../lib/apply-resources', {
    './services': mockedPromiseResolve,
    './routes': mockedPromiseResolve,
    './deployment-config': {
      deploy: mockedPromiseResolve
    },
    './secrets': mockedPromiseResolve
  });
  const ar = applyResources({}, resourceList).then(() => {
    t.end();
  });

  t.equal(ar instanceof Promise, true, 'function returns a promise');
});
