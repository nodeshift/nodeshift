'use strict';

const test = require('tape');
const proxyquire = require('proxyquire');

const config = {
  projectName: 'Project Name',
  version: '1.0.0',
  namespace: {
    name: 'namespace'
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

  t.ok(deploymentConfigEnricher.enrich, 'has an enrich property');
  t.equal(typeof deploymentConfigEnricher.enrich, 'function', 'is a function');

  t.ok(deploymentConfigEnricher.name, 'has an name property');
  t.equal(deploymentConfigEnricher.name, 'deployment-config');

  const p = deploymentConfigEnricher.enrich(config, resourceList);
  t.ok(p instanceof Promise, 'enricher should return a promise');

  p.then((dce) => {
    t.equal(Array.isArray(dce), true, 'should return an array');
    t.equal(dce.length, 2, 'array should have 2 things');
    t.equal(dce[1].kind, 'DeploymentConfig', 'should have the deploymentConfig type');
    t.end();
  });
});

test('deployment config enricher - deployment', async (t) => {
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

  const dce = await deploymentConfigEnricher.enrich(config, resourceList);

  t.equal(Array.isArray(dce), true, 'should return an array');
  t.notEqual(dce, resourceList, 'should not be equal');
  t.equal(dce[1].kind, 'DeploymentConfig', 'should have the deploymentConfig type');
  t.end();
});

test('deployment config enricher - deployment config', async (t) => {
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
      kind: 'DeploymentConfig',
      metadata: {
        name: 'deploymentConfigName'
      }
    }
  ];

  const dce = await deploymentConfigEnricher.enrich(config, resourceList);

  t.equal(Array.isArray(dce), true, 'should return an array');
  t.equal(dce.length, 2, 'should have the same length');
  t.equal(dce[1].kind, 'DeploymentConfig', 'should have the deploymentConfig type');
  t.equal(dce[1].metadata.namespace, config.namespace.name, 'should be enriched with the namespace value');
  t.end();
});
