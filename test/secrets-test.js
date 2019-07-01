'use strict';

const test = require('tape');

const secrets = require('../lib/secrets');

test('test getsecrets, already created', (t) => {
  const resource = {
    apiVersion: 'v1',
    kind: 'Secret',
    metadata: {
      name: 'my-database-secret'
    },
    stringData: {
      user: 'luke',
      password: 'secret'
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
              secrets: (name) => {
                if (name !== resource.metadata.name) {
                  t.fail('name argument does not match the resource.metadata.name');
                }
                return {
                  get: () => {
                    return Promise.resolve({ code: 200, body: { metadata: { name: 'secret' } } });
                  }
                };
              }
            };
          }
        }
      }
    }
  };

  const p = secrets(config, resource).then((secret) => {
    t.equal(secret.code, 200, 'secret response code should be 200');
    t.end();
  });

  t.equal(p instanceof Promise, true, 'should return a Promise');
});

test('test getsecrets need to create', (t) => {
  const resource = {
    apiVersion: 'v1',
    kind: 'Secret',
    metadata: {
      name: 'my-database-secret'
    },
    stringData: {
      user: 'luke',
      password: 'secret'
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
                secrets: (name) => {
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
                secrets: {
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

  secrets(config, resource).then((secret) => {
    t.equal(secret.body.kind, 'Secret', 'is a secret Kind');
    t.equal(secret.body.metadata.name, 'my-database-secret', 'metadata.name should not be overridden');
    t.end();
  });
});
