'use strict';

const test = require('tape');

test('test knative serving service, already created', (t) => {
  const knServices = require('../lib/knative-serving-service');
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
        'serving.knative.dev': {
          v1: {
            ns: (namespace) => {
              return {
                service: (name) => {
                  if (name !== resource.metadata.name) {
                    t.fail('name argument does not match the resource.metadata.name');
                  }
                  return {
                    get: () => {
                      return Promise.resolve({ code: 200, body: { kind: 'Service', apiVersion: 'serving.knative.dev/v1', metadata: { name: 'service' } } });
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

  const p = knServices(config, resource).then((knService) => {
    t.equal(knService.code, 200, 'knService response code should be 200');
    t.end();
  });

  t.equal(p instanceof Promise, true, 'should return a Promise');
});

test('test routes, not created', (t) => {
  const knServices = require('../lib/knative-serving-service');
  const resource = {
    apiVersion: 'serving.knative.dev/v1',
    kind: 'Service',
    metadata: {
      name: 'my knService'
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
        'serving.knative.dev': {
          v1: {
            ns: (namespace) => {
              if (call === 0) {
                call++;
                return {
                  service: (name) => {
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
                  service: {
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

  const p = knServices(config, resource).then((knService) => {
    t.equal(knService.body.kind, 'Service', 'is a Service Kind');
    t.equal(knService.body.apiVersion, 'serving.knative.dev/v1', 'apiVerion should be serving.knative.dev/v1');
    t.end();
  });

  t.equal(p instanceof Promise, true, 'should return a Promise');
});
