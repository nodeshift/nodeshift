'use strict';

const test = require('tape');
const proxyquire = require('proxyquire');

test('undeploy goal', (t) => {
  const undeploy = require('../../lib/goals/undeploy');

  t.equal(typeof undeploy, 'function', 'should export a function');
  t.end();
});

test('return list with no items', (t) => {
  const undeploy = proxyquire('../../lib/goals/undeploy', {
    fs: {
      readFile: (location, cb) => { return cb(null, '{}'); }
    }
  });

  undeploy({}).then(() => {
    t.pass('this should pass');
    t.end();
  });
});

test('return list error', (t) => {
  const undeploy = proxyquire('../../lib/goals/undeploy', {
    fs: {
      readFile: (location, cb) => { return cb(new Error('no file found'), null); }
    }
  });

  undeploy({}).then(() => {
    t.fail();
  }).catch(() => {
    t.pass('this should pass');
    t.end();
  });
});

test('return list items', (t) => {
  const metadata = {
    name: 'projectName'
  };

  const resourceList = {
    kind: 'List',
    items: [
      {
        kind: 'Route',
        apiVersion: 'v1',
        metadata: metadata
      },
      {
        kind: 'Service',
        apiVersion: 'v1',
        metadata: metadata
      },
      {
        kind: 'Service',
        apiVersion: 'serving.knative.dev/v1',
        metadata: metadata
      },
      {
        kind: 'Secret',
        apiVersion: 'v1',
        metadata: metadata
      },
      {
        kind: 'DeploymentConfig',
        apiVersion: 'v1',
        metadata: metadata
      },
      {
        kind: 'Deployment',
        apiVersion: 'v1',
        metadata: metadata
      },
      {
        kind: 'Ingress',
        apiVersion: 'v1',
        metadata: metadata
      },
      {
        kind: 'ConfigMap',
        apiVersion: 'v1',
        metadata: metadata
      }
    ]
  };

  const config = {
    projectName: 'project name',
    namespace: {
      name: ''
    },
    openshiftRestClient: {
      api: {
        v1: {
          ns: (name) => {
            return {
              secrets: (name) => {
                t.equal(name, metadata.name, 'name should be equal');
                return {
                  delete: (resource) => {
                    return Promise.resolve({ code: 204 });
                  }
                };
              },
              service: (name) => {
                t.equal(name, metadata.name, 'name should be equal');
                return {
                  delete: (resource) => {
                    return Promise.resolve({ code: 204 });
                  }
                };
              },
              configmaps: (name) => {
                t.equal(name, metadata.name, 'name should be equal');
                return {
                  delete: (resource) => {
                    return Promise.resolve({ code: 204 });
                  }
                };
              }
            };
          }
        }
      },
      apis: {
        extensions: {
          v1beta1: {
            ns: (name) => {
              return {
                ingresses: (name) => {
                  t.equal(name, metadata.name, 'name should be equal');
                  return {
                    delete: (resource) => {
                      return Promise.resolve({ code: 204 });
                    }
                  };
                }
              };
            }
          }
        },
        route: {
          v1: {
            ns: (name) => {
              return {
                routes: (name) => {
                  t.equal(name, metadata.name, 'name should be equal');
                  return {
                    delete: (resource) => {
                      return Promise.resolve({ code: 204 });
                    }
                  };
                }
              };
            }
          }
        },
        'serving.knative.dev': {
          v1: {
            ns: (name) => {
              return {
                service: (name) => {
                  t.equal(name, metadata.name, 'name should be equal');
                  return {
                    delete: (resource) => {
                      return Promise.resolve({ code: 204 });
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

  const undeploy = proxyquire('../../lib/goals/undeploy', {
    fs: {
      readFile: (location, cb) => { return cb(null, JSON.stringify(resourceList)); }
    },
    '../deployment-config': {
      undeploy: () => { return Promise.resolve(); }
    },
    '../deployment': {
      removeDeployment: () => { return Promise.resolve(); }
    }
  });

  undeploy(config).then(() => {
    t.pass('this should pass');
    t.end();
  });
});

test('return list items that do not match the item kind', (t) => {
  const metadata = {
    name: 'projectName'
  };

  const resourceList = {
    kind: 'List',
    items: [
      {
        kind: 'Other',
        metadata: metadata
      }
    ]
  };

  const config = {
    projectName: 'project name'
  };

  const undeploy = proxyquire('../../lib/goals/undeploy', {
    fs: {
      readFile: (location, cb) => { return cb(null, JSON.stringify(resourceList)); }
    },
    '../deployment-config': {
      undeploy: () => { return Promise.resolve(); }
    },
    '../common-log': () => {
      return {
        info: info => info,
        error: error => error,
        warning: (warning) => {
          t.equal(warning, 'Other is not recognized');
          return warning;
        }
      };
    }
  });

  undeploy(config).then(() => {
    t.pass('this should pass');
    t.end();
  });
});

test('remove build and image stream', (t) => {
  t.plan(3);
  const config = {
    removeAll: true
  };

  const resourceList = {
    kind: 'List',
    items: []
  };

  const undeploy = proxyquire('../../lib/goals/undeploy', {
    fs: {
      readFile: (location, cb) => { return cb(null, JSON.stringify(resourceList)); }
    },
    '../deployment-config': {
      undeploy: () => { return Promise.resolve(); }
    },
    '../build-config': {
      removeBuildsAndBuildConfig: () => {
        t.pass('should land here');
      }
    },
    '../image-stream': {
      removeImageStream: () => {
        t.pass('should land here');
      }
    }
  });

  undeploy(config).then(() => {
    t.pass('this should pass');
    t.end();
  });
});
