'use strict';

const test = require('tape');

test('test config map, already created', (t) => {
  const configMap = require('../lib/config-map');
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
      configmaps:
      {
        find: (name) => {
          if (name !== resource.metadata.name) {
            t.fail('name argument does not match the resource.metadata.name');
          }
          return { code: 200, metadata: { name: 'ConfigMap' } };
        }
      }
    }
  };

  const p = configMap(config, resource).then((service) => {
    t.equal(service.code, 200, 'configMap response code should be 200');
    t.end();
  });

  t.equal(p instanceof Promise, true, 'should return a Promise');
});

test('test configMap, not created', (t) => {
  const configMap = require('../lib/config-map');
  const resource = {
    apiVersion: 'v1',
    kind: 'ConfigMap',
    metadata: {
      name: 'some-config-map'
    }
  };

  const config = {
    projectName: 'test-project',
    context: {
      namespace: 'namespace'
    },
    projectVersion: '1.0.0',
    openshiftRestClient: {
      configmaps:
      {
        find: (name) => {
          return { code: 404 };
        },
        create: configMap => configMap
      }
    }
  };

  const p = configMap(config, resource).then((configMap) => {
    t.equal(configMap.kind, 'ConfigMap', 'is a configMap Kind');
    t.equal(configMap.metadata.name, 'some-config-map', 'metadata.name should be some-config-map');
    t.end();
  });

  t.equal(p instanceof Promise, true, 'should return a Promise');
});
