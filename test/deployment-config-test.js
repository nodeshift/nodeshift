'use strict';

const test = require('tape');
const deploymentConfig = require('../lib/deployment-config');

test('deployment config', (t) => {
  t.ok(deploymentConfig.deploy, 'should have a deploy method');
  t.ok(deploymentConfig.undeploy, 'should have a undeploy method');
  t.equal(typeof deploymentConfig.deploy, 'function', 'should be a function');
  t.equal(typeof deploymentConfig.undeploy, 'function', 'should be a function');

  t.end();
});

test('deploy - not created yet', (t) => {
  const deploymentConfigResource = {
    kind: 'DeploymentConfig',
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
        'apps.openshift.io': {
          v1: {
            ns: (namespace) => {
              if (call === 0) {
                call++;
                return {
                  deploymentconfigs: (deploymentName) => {
                    t.equal(deploymentName, deploymentConfigResource.metadata.name, 'names should be equal');
                    return {
                      get: () => {
                        return Promise.resolve({ code: 404 });
                      }
                    };
                  }
                };
              } else {
                return {
                  deploymentconfigs: {
                    post: (resource) => {
                      t.equal(resource.body, deploymentConfigResource, 'resource should be the same as passed in');
                      Promise.resolve({ code: 201, body: resource });
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

  const p = deploymentConfig.deploy(config, deploymentConfigResource);
  t.equal(p instanceof Promise, true, 'should return a promise');

  p.then(() => {
    t.pass();
    t.end();
  });
});

test('deploy - created already', (t) => {
  const deploymentConfigResource = {
    kind: 'DeploymentConfig',
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
        'apps.openshift.io': {
          v1: {
            ns: (namespace) => {
              if (call === 0) {
                call++;
                return {
                  deploymentconfigs: (deploymentName) => {
                    t.equal(deploymentName, deploymentConfigResource.metadata.name, 'names should be equal');
                    return {
                      get: () => {
                        return Promise.resolve({ code: 200, body: deploymentConfigResource });
                      }
                    };
                  }
                };
              } else {
                return {
                  deploymentconfigs: {
                    post: (resource) => {
                      t.fail();
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

  const p = deploymentConfig.deploy(config, deploymentConfigResource);
  t.equal(p instanceof Promise, true, 'should return a promise');

  p.then(() => {
    t.pass();
    t.end();
  });
});

test('undeploy', (t) => {
  const deploymentConfigResource = {
    kind: 'DeploymentConfig',
    metadata: {
      name: 'deployment'
    }
  };

  const rcList = {
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
        'apps.openshift.io': {
          v1: {
            ns: (namespace) => {
              return {
                deploymentconfigs: (deploymentName) => {
                  t.equal(deploymentName, deploymentConfigResource.metadata.name, 'names should be equal');
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
      },
      api: {
        v1: {
          ns: (namespace) => {
            if (call === 1) {
              return {
                replicationcontrollers: (projectName) => {
                  t.equal(projectName, rcList.items[0].metadata.name, 'name should be equal');
                  return {
                    delete: (removal) => {
                      t.pass();
                      t.equal(removal.body.body.orphanDependents, false, 'this options should be false');
                      return Promise.resolve({ code: 204 });
                    }
                  };
                }
              };
            } else {
              return {
                replicationcontrollers: {
                  get: (options) => {
                    call++;
                    t.equal(options.qs.labelSelector, `openshift.io/deployment-config.name=${config.projectName}`, 'should be equal');
                    return Promise.resolve({ code: 200, body: rcList });
                  }
                }
              };
            }
          }
        }
      }
    }
  };

  const p = deploymentConfig.undeploy(config, deploymentConfigResource);
  t.equal(p instanceof Promise, true, 'should return a promise');

  p.then(() => {
    t.pass();
    t.end();
  });
});
