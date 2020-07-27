'use strict';

const test = require('tape');
const deployment = require('../lib/deployment');

test('deployment', (t) => {
  t.ok(deployment.applyDeployment, 'should have an applyDeployment method');
  t.ok(deployment.removeDeployment, 'should have a removeDeployment method');
  t.equal(typeof deployment.applyDeployment, 'function', 'should be a function');
  t.equal(typeof deployment.removeDeployment, 'function', 'should be a function');

  t.end();
});

test('deploy - not created yet', (t) => {
  const deploymentResource = {
    kind: 'Deployment',
    metadata: {
      name: 'deployment'
    }
  };

  const config = {
    projectName: 'my Project',
    namespace: {
      name: ''
    },
    openshiftRestClient: {
      apis: {
        apps: {
          v1: {
            namespaces: (namespace) => {
              return {
                deployments: {
                  post: (resource) => {
                    t.equal(resource.body, deploymentResource, 'resource should be the same as passed in');
                    Promise.resolve({ code: 201, body: resource });
                  }
                }
              };
            }
          }
        }
      }
    }
  };

  const p = deployment.applyDeployment(config, deploymentResource);
  t.equal(p instanceof Promise, true, 'should return a promise');

  p.then(() => {
    t.pass();
    t.end();
  });
});

test('deploy - created already', (t) => {
  const deploymentResource = {
    kind: 'Deployment',
    metadata: {
      name: 'deployment'
    }
  };

  let call = 0;

  const config = {
    projectName: 'my Project',
    namespace: {
      name: ''
    },
    openshiftRestClient: {
      apis: {
        apps: {
          v1: {
            namespaces: (namespace) => {
              if (call === 0) {
                call++;
                return {
                  deployments: {
                    post: (resource) => {
                      t.equal(resource.body, deploymentResource, 'resource should be the same as passed in');
                      /* eslint prefer-promise-reject-errors: "off" */
                      return Promise.reject({ code: 409 });
                    }
                  }
                };
              } else {
                return {
                  deployments: (deploymentName) => {
                    return {
                      put: (resource) => {
                        Promise.resolve({ code: 201 });
                      }
                    };
                  }
                };
              }
            }
          }
        }
      }
    }
  };

  const p = deployment.applyDeployment(config, deploymentResource);
  t.equal(p instanceof Promise, true, 'should return a promise');

  p.then(() => {
    t.pass();
    t.end();
  });
});

test('deploy - created already - but error', (t) => {
  const deploymentResource = {
    kind: 'Deployment',
    metadata: {
      name: 'deployment'
    }
  };

  let call = 0;

  const config = {
    projectName: 'my Project',
    namespace: {
      name: ''
    },
    openshiftRestClient: {
      apis: {
        apps: {
          v1: {
            namespaces: (namespace) => {
              return {
                deployments: {
                  post: (resource) => {
                    t.equal(resource.body, deploymentResource, 'resource should be the same as passed in');
                    /* eslint prefer-promise-reject-errors: "off" */
                    return Promise.reject({ code: 401 });
                  }
                }
              };
            }
          }
        }
      }
    }
  };

  const p = deployment.applyDeployment(config, deploymentResource);
  t.equal(p instanceof Promise, true, 'should return a promise');

  p.then(() => {
    t.fail();
  }).catch(() => {
    t.pass();
    t.end();
  });
});

test('undeploy', (t) => {
  const deploymentResource = {
    kind: 'Deployment',
    metadata: {
      name: 'deployment'
    }
  };

  const replicasetList = {
    items: [{
      metadata: {
        name: 'replicant'
      }
    }]
  };

  let call = 0;

  const config = {
    projectName: 'my Project',
    namespace: {
      name: ''
    },
    openshiftRestClient: {
      apis: {
        apps: {
          v1: {
            ns: (namespace) => {
              let replicaSet;
              if (call === 1) {
                // do the delete
                replicaSet = (projectName) => {
                  t.equal(projectName, replicasetList.items[0].metadata.name, 'name should be equal');
                  return {
                    delete: (removal) => {
                      t.pass();
                      t.equal(removal.body.body.orphanDependents, false, 'this options should be false');
                      return Promise.resolve({ code: 204 });
                    }
                  };
                };
              } else {
                replicaSet = {
                  get: (options) => {
                    call++;
                    t.equal(options.qs.labelSelector, `app=${config.projectName}`, 'should be equal');
                    return Promise.resolve({ code: 200, body: replicasetList });
                  }
                };
              }
              return {
                replicasets: replicaSet,
                deployments: (deploymentName) => {
                  t.equal(deploymentName, deploymentResource.metadata.name, 'names should be equal');
                  return {
                    delete: (removeThisResource) => {
                      t.equal(removeThisResource.body.body.orphanDependents, true, 'this options should be true');
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

  const p = deployment.removeDeployment(config, deploymentResource);
  t.equal(p instanceof Promise, true, 'should return a promise');

  p.then(() => {
    t.pass();
    t.end();
  });
});
