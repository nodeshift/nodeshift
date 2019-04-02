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
      apis: {
        route: {
          v1: {
            ns: (namespace) => {
              return {
                routes: (name) => {
                  if (name !== resource.metadata.name) {
                    t.fail('name argument does not match the resource.metadata.name');
                  }
                  return {
                    get: () => {
                      return Promise.resolve({ code: 200, body: { metadata: { name: 'route' }, spec: { host: '192.168.1.1' } } });
                    }
                  };
                }
              };
            }
          }
        }
      }
    }
  };

  const p = routes(config, resource).then((route) => {
    t.equal(route.code, 200, 'route response code should be 200');
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

  let call = 0;

  const config = {
    projectName: 'test-project',
    context: {
      namespace: 'namespace'
    },
    projectVersion: '1.0.0',
    openshiftRestClient: {
      apis: {
        route: {
          v1: {
            ns: (namespace) => {
              if (call === 0) {
                call++;
                return {
                  routes: (name) => {
                    if (name !== resource.metadata.name) {
                      t.fail('name argument does not match the resource.metadata.name');
                    }
                    return {
                      get: () => {
                        return Promise.resolve({ code: 404 });
                      }
                    };
                  }
                };
              } else {
                return {
                  routes: {
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
    }
  };

  const p = routes(config, resource).then((route) => {
    t.equal(route.body.kind, 'Route', 'is a Route Kind');
    t.equal(route.body.metadata.name, 'my route', 'metadata.name should be my route');
    t.end();
  });

  t.equal(p instanceof Promise, true, 'should return a Promise');
});
