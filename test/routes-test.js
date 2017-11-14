'use strict';

const test = require('tape');

test('test routes, already created', (t) => {
  const routes = require('../lib/routes');
  const resource = {
    apiVersion: 'v1',
    kind: 'Service',
    metadata: {
      name: 'my route'
    },
    spec: {
      host: '192.168.1.1'
    }
  };

  const config = {
    projectName: 'test-project',
    context: {
      namespace: 'namespace'
    },
    projectVersion: '1.0.0',
    openshiftRestClient: {
      routes:
      {
        find: (name) => {
          if (name !== resource.metadata.name) {
            t.fail('name argument does not match the resource.metadata.name');
          }
          return { code: 200, metadata: { name: 'route' }, spec: {host: '192.168.1.1'} };
        }
      }
    }
  };

  const p = routes(config, resource).then((service) => {
    t.equal(service.code, 200, 'route response code should be 200');
    t.end();
  });

  t.equal(p instanceof Promise, true, 'should return a Promise');
});

test('test routes, not created', (t) => {
  const routes = require('../lib/routes');
  const resource = {
    apiVersion: 'v1',
    kind: 'Route',
    metadata: {
      name: 'my route'
    },
    spec: {
      host: '192.168.1.1'
    }
  };

  const config = {
    projectName: 'test-project',
    context: {
      namespace: 'namespace'
    },
    projectVersion: '1.0.0',
    openshiftRestClient: {
      routes:
      {
        find: (name) => {
          return { code: 404 };
        },
        create: route => route
      }
    }
  };

  const p = routes(config, resource).then((route) => {
    t.equal(route.kind, 'Route', 'is a Route Kind');
    t.equal(route.metadata.name, 'my route', 'metadata.name should be my service');
    t.end();
  });

  t.equal(p instanceof Promise, true, 'should return a Promise');
});
