'use strict';

const test = require('tape');
const proxyquire = require('proxyquire');

test('api export', (t) => {
  const api = proxyquire('../', {
    './bin/cli': () => {}
  });

  t.ok(api.login, 'should have a login function');
  t.equals(typeof api.login, 'function', 'should be a function');
  t.ok(api.logout, 'should have a logout function');
  t.equals(typeof api.logout, 'function', 'should be a function');
  t.ok(api.deploy, 'should have a deploy function');
  t.equals(typeof api.deploy, 'function', 'should be a function');
  t.ok(api.resource, 'should have a resource function');
  t.equals(typeof api.resource, 'function', 'should be a function');
  t.ok(api.applyResource, 'should have a applyResource function');
  t.equals(typeof api.applyResource, 'function', 'should be a function');
  t.ok(api.undeploy, 'should have a undeploy function');
  t.equals(typeof api.undeploy, 'function', 'should be a function');
  t.ok(api.build, 'should have a build function');
  t.equals(typeof api.build, 'function', 'should be a function');

  t.end();
});

test('login api', (t) => {
  const api = proxyquire('../', {
    './bin/cli': (options) => {
      t.equal(options.cmd, 'login', 'should be the login cmd');
      t.end();
    }
  });

  api.login();
});

test('logout api', (t) => {
  const api = proxyquire('../', {
    './bin/cli': (options) => {
      t.equal(options.cmd, 'logout', 'should be the logout cmd');
      t.end();
    }
  });

  api.logout();
});

test('deploy api', (t) => {
  const api = proxyquire('../', {
    './bin/cli': (options) => {
      t.equal(options.cmd, 'deploy', 'should be the deploy cmd');
      t.end();
    }
  });

  api.deploy();
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

test('undeploy application api', (t) => {
  const api = proxyquire('../', {
    './bin/cli': (options) => {
      t.equal(options.cmd, 'undeploy', 'should be the undeploy cmd');
      t.end();
    }
  });

  api.undeploy();
});

test('build application api', (t) => {
  const api = proxyquire('../', {
    './bin/cli': (options) => {
      t.equal(options.cmd, 'build', 'should be the build cmd');
      t.end();
    }
  });

  api.build();
});
