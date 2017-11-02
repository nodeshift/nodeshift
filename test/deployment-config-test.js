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

  const config = {
    projectName: 'my Project',
    openshiftRestClient: {
      deploymentconfigs: {
        find: (deploymentName) => {
          t.equal(deploymentName, deploymentConfigResource.metadata.name, 'names should be equal');
          return Promise.resolve({code: 404});
        },
        create: (resource) => {
          t.equal(resource, deploymentConfigResource, 'resource should be the same as passed in');
          return Promise.resolve(resource);
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

  const config = {
    projectName: 'my Project',
    openshiftRestClient: {
      deploymentconfigs: {
        find: (deploymentName) => {
          t.equal(deploymentName, deploymentConfigResource.metadata.name, 'names should be equal');
          return Promise.resolve(Object.assign({}, deploymentConfigResource, {code: 200}));
        },
        create: (resource) => {
          t.fail();
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

  const config = {
    projectName: 'my Project',
    openshiftRestClient: {
      deploymentconfigs: {
        remove: (deploymentName, options) => {
          t.equal(deploymentName, deploymentConfigResource.metadata.name, 'names should be equal');
          t.equal(options.body.orphanDependents, true, 'this options should be true');
          return Promise.resolve();
        }
      },
      replicationcontrollers: {
        findAll: (options) => {
          t.equal(options.qs.labelSelector, `openshift.io/deployment-config.name=${config.projectName}`, 'should be equal');
          return Promise.resolve(rcList);
        },
        remove: (rcName, options) => {
          t.equal(rcName, rcList.items[0].metadata.name, 'name should be equal');
          t.equal(options.body.orphanDependents, false, 'this options should be false');
          return Promise.resolve();
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
