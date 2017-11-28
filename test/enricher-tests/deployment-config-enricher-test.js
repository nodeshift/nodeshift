'use strict';

const test = require('tape');
const proxyquire = require('proxyquire');

const config = {
  projectName: 'Project Name',
  version: '1.0.0',
  context: {
    namespace: 'namespace'
  }
};

test('deployment config enricher - no deployment', (t) => {
  const deploymentConfigEnricher = proxyquire('../../lib/resource-enrichers/deployment-config-enricher', {
    '../definitions/deployment-config-spec': deploymentConfig => deploymentConfig
  });

  const resourceList = [
    {
      kind: 'Service',
      metadata: {
        name: 'service meta'
      }
    }
  ];

  const dce = deploymentConfigEnricher(config, resourceList);

  t.equal(typeof deploymentConfigEnricher, 'function', 'is a function');
  t.equal(Array.isArray(dce), true, 'should return an array');
  t.equal(dce.length, 2, 'array should have 2 things');
  t.equal(dce[1].kind, 'DeploymentConfig', 'should have the depoymentConfig type');
  t.end();
});

test('deployment config enricher - deployment', (t) => {
  const deploymentConfigEnricher = proxyquire('../../lib/resource-enrichers/deployment-config-enricher', {
    '../definitions/deployment-config-spec': deploymentConfig => deploymentConfig
  });

  const resourceList = [
    {
      kind: 'Service',
      metadata: {
        name: 'service meta'
      }
    },
    {
      kind: 'Deployment',
      metadata: {
        name: 'deploymentName'
      }
    }
  ];

  const dce = deploymentConfigEnricher(config, resourceList);

  t.equal(typeof deploymentConfigEnricher, 'function', 'is a function');
  t.equal(Array.isArray(dce), true, 'should return an array');
  t.notEqual(dce, resourceList, 'should not be equal');
  t.equal(dce[1].kind, 'DeploymentConfig', 'should have the depoymentConfig type');
  t.end();
});
