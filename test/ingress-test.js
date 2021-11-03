'use strict';

const test = require('tape');

test('test ingress, already created', (t) => {
  const ingress = require('../lib/ingress');
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
      apis: {
        'networking.k8s.io': {
          v1: {
            ns: (namespace) => {
              return {
                ingresses: (ingressName) => {
                  if (ingressName !== resource.metadata.name) {
                    t.fail('ingressName argument does not match the resource.metadata.name');
                  }
                  return {
                    get: () => {
                      return Promise.resolve({ code: 200, body: { metadata: { name: 'ingress' } } });
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

  const p = ingress(config, resource).then((service) => {
    t.equal(service.code, 200, 'ingress response code should be 200');
    t.end();
  });

  t.equal(p instanceof Promise, true, 'should return a Promise');
});

test('test ingress, not created', (t) => {
  const ingress = require('../lib/ingress');
  const resource = {
    apiVersion: 'networking.k8s.io/v1',
    kind: 'Ingress',
    metadata: {
      name: 'nodejs-istio-circuit-breaker-gateway'
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
      apis: {
        'networking.k8s.io': {
          v1: {
            ns: (namespace) => {
              if (call === 0) {
                call++;
                return {
                  ingresses: (name) => {
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
                  ingresses: {
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

  const p = ingress(config, resource).then((ingress) => {
    t.equal(ingress.body.metadata.name, 'nodejs-istio-circuit-breaker-gateway', 'metadata.name should be nodejs-istio-circuit-breaker-gateway');
    t.end();
  });

  t.equal(p instanceof Promise, true, 'should return a Promise');
});
