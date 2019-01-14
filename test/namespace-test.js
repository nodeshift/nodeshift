'use strict';

const test = require('tape');
const namespace = require('../lib/namespace');

test('namespace', t => {
  t.ok(namespace.create, 'should have a create method');
  t.ok(namespace.remove, 'should have a remove method');
  t.equal(typeof namespace.create, 'function', 'should be a function');
  t.equal(typeof namespace.remove, 'function', 'should be a function');

  t.end();
});

test('namespace - create the namespace', t => {
  const config = {
    namespace: {
      name: 'projectname'
    },
    openshiftRestClient: {
      projects: {
        findAll: () => {
          return Promise.resolve({
            kind: 'Project',
            items: []
          });
        }
      },
      projectrequests: {
        create: (projectRequest) => {
          return Promise.resolve({});
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
  const config = {
    namespace: {
      name: 'projectname'
    },
    openshiftRestClient: {
      projects: {
        findAll: () => {
          return Promise.resolve({
            kind: 'Project',
            items: [{
              metadata: {
                name: 'not_this_one'
              }
            }]
          });
        }
      },
      projectrequests: {
        create: (projectRequest) => {
          return Promise.resolve({});
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
  const config = {
    namespace: {
      name: 'projectname'
    },
    openshiftRestClient: {
      projects: {
        findAll: () => {
          return Promise.resolve({
            kind: 'Project',
            items: [{
              metadata: {
                name: 'projectname'
              },
              status: {
                phase: 'Created'
              }
            }]
          });
        }
      },
      projectrequests: {
        create: (projectRequest) => {
          return Promise.reject(new Error('should fail'));
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
  const config = {
    namespace: {
      name: 'projectname'
    },
    openshiftRestClient: {
      projects: {
        findAll: () => {
          return Promise.resolve({
            kind: 'Project',
            items: [{
              metadata: {
                name: 'projectname'
              },
              status: {
                phase: 'Terminating'
              }
            }]
          });
        }
      },
      projectrequests: {
        create: (projectRequest) => {
          return Promise.reject(new Error('should fail'));
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
  const config = {
    namespace: {
      name: 'projectname'
    },
    openshiftRestClient: {
      projects: {
        remove: () => {
          return Promise.resolve({});
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
// test('deploy - not created yet', (t) => {
//   const deploymentConfigResource = {
//     kind: 'DeploymentConfig',
//     metadata: {
//       name: 'deployment'
//     }
//   };

//   const config = {
//     projectName: 'my Project',
//     openshiftRestClient: {
//       deploymentconfigs: {
//         find: (deploymentName) => {
//           t.equal(deploymentName, deploymentConfigResource.metadata.name, 'names should be equal');
//           return Promise.resolve({ code: 404 });
//         },
//         create: (resource) => {
//           t.equal(resource, deploymentConfigResource, 'resource should be the same as passed in');
//           return Promise.resolve(resource);
//         }
//       }
//     }
//   };

//   const p = deploymentConfig.deploy(config, deploymentConfigResource);
//   t.equal(p instanceof Promise, true, 'should return a promise');

//   p.then(() => {
//     t.pass();
//     t.end();
//   });
// });
