'use strict';

const test = require('tape');
const proxyquire = require('proxyquire');

test('apply resource test', (t) => {
  const resourceList = [];

  const applyResources = require('../../lib/goals/apply-resources');
  const ar = applyResources({}, resourceList).then(() => {
    t.end();
  });

  t.equal(ar instanceof Promise, true, 'function returns a promise');
});

test('apply resource test', (t) => {
  const resourceList = [
    { kind: 'Service', apiVersion: 'v1' },
    { kind: 'Service', apiVersion: 'serving.knative.dev/v1' },
    { kind: 'Route', apiVersion: 'v1' },
    { kind: 'DeploymentConfig', apiVersion: 'v1' },
    { kind: 'Deployment', apiVersion: 'v1' },
    { kind: 'Secret', apiVersion: 'v1' },
    { kind: 'Ingress', apiVersion: 'v1' },
    { kind: 'ConfigMap', apiVersion: 'v1' },
    { kind: 'other', apiVersion: 'v1' }
  ];

  const mockedPromiseResolve = () => Promise.resolve();

  const applyResources = proxyquire('../../lib/goals/apply-resources', {
    '../services': mockedPromiseResolve,
    '../knative-serving-service': mockedPromiseResolve,
    '../routes': mockedPromiseResolve,
    '../deployment-config': {
      deploy: mockedPromiseResolve
    },
    '../deployment': {
      applyDeployment: mockedPromiseResolve
    },
    '../secrets': mockedPromiseResolve,
    '../ingress': mockedPromiseResolve,
    '../config-map': mockedPromiseResolve
  });
  const ar = applyResources({}, resourceList).then(() => {
    t.end();
  });

  t.equal(ar instanceof Promise, true, 'function returns a promise');
});
