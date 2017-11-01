'use strict';

const test = require('tape');
const proxyquire = require('proxyquire');

test('api export', (t) => {
  const api = proxyquire('../', {
    './bin/cli': () => {}
  });

  t.ok(api.deployApplication, 'should have a deployApplication function');
  t.equals(typeof api.deployApplication, 'function', 'should be a function');
  t.ok(api.resource, 'should have a resource function');
  t.equals(typeof api.resource, 'function', 'should be a function');
  t.ok(api.applyResource, 'should have a applyResource function');
  t.equals(typeof api.applyResource, 'function', 'should be a function');

  t.end();
});

test('deploy application api', (t) => {
  const api = proxyquire('../', {
    './bin/cli': (options) => {
      t.equal(options.cmd, 'deploy', 'should be the deploy cmd');
      t.end();
    }
  });

  api.deployApplication();
});

test('resource application api', (t) => {
  const api = proxyquire('../', {
    './bin/cli': (options) => {
      t.equal(options.cmd, 'resource', 'should be the resource cmd');
      t.end();
    }
  });

  api.resource();
});

test('applyResource application api', (t) => {
  const api = proxyquire('../', {
    './bin/cli': (options) => {
      t.equal(options.cmd, 'apply-resource', 'should be the apply-resource cmd');
      t.end();
    }
  });

  api.applyResource();
});
