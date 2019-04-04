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
    namespace: {
      name: 'namespace'
    },
    projectVersion: '1.0.0',
    openshiftRestClient: {
      api: {
        v1: {
          ns: (namespace) => {
            return {
              configmaps: (configMapName) => {
                if (configMapName !== resource.metadata.name) {
                  t.fail('configMapName argument does not match the resource.metadata.name');
                }
                return {
                  get: () => {
                    return Promise.resolve({ code: 200, body: { metadata: { name: 'ConfigMap' } } });
                  }
                };
              }
            };
          }
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

  let call = 0;

  const config = {
    projectName: 'test-project',
    namespace: {
      name: 'namespace'
    },
    projectVersion: '1.0.0',
    openshiftRestClient: {
      api: {
        v1: {
          ns: (namespace) => {
            if (call === 0) {
              call++;
              return {
                configmaps: (configMapName) => {
                  return {
                    get: () => {
                      return Promise.resolve({ code: 404 });
                    }
                  };
                }
              };
            } else {
              return {
                configmaps: {
                  post: (resource) => {
                    return Promise.resolve({ code: 201, body: resource.body });
                  }
                }
              };
            }
          }
        }
      }
    }
  };

  const p = configMap(config, resource).then((configMap) => {
    t.equal(configMap.body.kind, 'ConfigMap', 'is a configMap Kind');
    t.equal(configMap.body.metadata.name, 'some-config-map', 'metadata.name should be some-config-map');
    t.end();
  });

  t.equal(p instanceof Promise, true, 'should return a Promise');
});
