'use strict';

const test = require('tape');
const proxyquire = require('proxyquire');

test('namespace', t => {
  const namespace = require('../lib/namespace');

  t.ok(namespace.create, 'should have a create method');
  t.ok(namespace.remove, 'should have a remove method');
  t.equal(typeof namespace.create, 'function', 'should be a function');
  t.equal(typeof namespace.remove, 'function', 'should be a function');

  t.end();
});

test('namespace - create the namespace', t => {
  const namespace = require('../lib/namespace');
  const config = {
    namespace: {
      name: 'projectname'
    },
    openshiftRestClient: {
      apis: {
        project: {
          v1: {
            projects: {
              get: () => {
                return Promise.resolve({ code: 200, body: { kind: 'Project', items: [] } });
              }
            },
            projectrequests: {
              post: (resource) => {
                return Promise.resolve({ code: 201, body: resource });
              }
            }
          }
        }
      }
    }
  };

  const n = namespace.create(config);

  t.equal(n instanceof Promise, true, 'instanceof a Promise');

  n.then(() => {
    t.pass();
    t.end();
  });
});

test('namespace - create the namespace, others exist', t => {
  const namespace = require('../lib/namespace');

  const config = {
    namespace: {
      name: 'projectname'
    },
    openshiftRestClient: {
      apis: {
        project: {
          v1: {
            projects: {
              get: () => {
                return Promise.resolve({ code: 200, body: { kind: 'Project', items: [{ metadata: { name: 'not_this_one' } }] } });
              }
            },
            projectrequests: {
              post: (resource) => {
                return Promise.resolve({ code: 201, body: resource });
              }
            }
          }
        }
      }
    }
  };

  const n = namespace.create(config);

  t.equal(n instanceof Promise, true, 'instanceof a Promise');

  n.then(() => {
    t.pass();
    t.end();
  });
});

test('namespace - namespace exists', t => {
  const namespace = require('../lib/namespace');

  const config = {
    namespace: {
      name: 'projectname'
    },
    openshiftRestClient: {
      apis: {
        project: {
          v1: {
            projects: {
              get: () => {
                return Promise.resolve({ code: 200, body: { kind: 'Project', items: [{ metadata: { name: 'projectname' }, status: { phase: 'Created' } }] } });
              }
            },
            projectrequests: {
              post: (resource) => {
                return Promise.reject(new Error('should fail'));
              }
            }
          }
        }
      }
    }
  };

  const n = namespace.create(config);

  t.equal(n instanceof Promise, true, 'instanceof a Promise');

  n.then((proj) => {
    t.equal(proj.metadata.name, 'projectname', 'returns a project object with the name');
    t.pass();
    t.end();
  });
});

test('namespace - namespace exists but is Terminating', t => {
  const namespace = require('../lib/namespace');

  const config = {
    namespace: {
      name: 'projectname'
    },
    openshiftRestClient: {
      apis: {
        project: {
          v1: {
            projects: {
              get: () => {
                return Promise.resolve({ code: 200, body: { kind: 'Project', items: [{ metadata: { name: 'projectname' }, status: { phase: 'Terminating' } }] } });
              }
            },
            projectrequests: {
              post: (resource) => {
                return Promise.reject(new Error('should fail'));
              }
            }
          }
        }
      }
    }
  };

  const n = namespace.create(config);

  t.equal(n instanceof Promise, true, 'instanceof a Promise');

  n.catch((error) => {
    t.equal(error.message, 'Project namespace: projectname is still Terminating', 'returns a project object with the name');
    t.pass();
    t.end();
  });
});

test('namespace - remove the namespace', t => {
  const namespace = require('../lib/namespace');

  const config = {
    namespace: {
      name: 'projectname'
    },
    openshiftRestClient: {
      apis: {
        project: {
          v1: {
            projects: (namespace) => {
              t.equal(namespace, config.namespace.name, 'should be passing in the correct namespace name');
              return {
                delete: () => {
                  return Promise.resolve({ code: 204 });
                }
              };
            }
          }
        }
      }
    }
  };

  const n = namespace.remove(config);

  t.equal(n instanceof Promise, true, 'instanceof a Promise');

  n.then(() => {
    t.pass();
    t.end();
  });
});

test('namespace - create the namespace kube flag', t => {
  const namespace = proxyquire('../lib/namespace', {
    './common-log': () => ({
      warn: (message) => {
        t.equal(message, 'This feature is not available using the --kube flag');
      }
    })
  });
  const config = {
    namespace: {
      name: 'projectname'
    },
    kube: true
  };

  const n = namespace.create(config);

  t.equal(n instanceof Promise, true, 'instanceof a Promise');

  n.then(() => {
    t.pass();
    t.end();
  });
});
