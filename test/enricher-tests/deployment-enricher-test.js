'use strict';

const test = require('tape');

const deploymentEnricher = require('../../lib/resource-enrichers/deployment-enricher');
const config = {
  projectName: 'Project Name',
  version: '1.0.0',
  namespace: {
    name: 'namespace'
  }
};

test('deployment enricher - no deployment', (t) => {
  const resourceList = [
    {
      kind: 'Service',
      metadata: {
        name: 'service meta'
      }
    }
  ];

  t.ok(deploymentEnricher.enrich, 'has an enrich property');
  t.equal(typeof deploymentEnricher.enrich, 'function', 'is a function');

  t.ok(deploymentEnricher.name, 'has an name property');
  t.equal(deploymentEnricher.name, 'deployment');

  const p = deploymentEnricher.enrich(config, resourceList);
  t.ok(p instanceof Promise, 'enricher should return a promise');

  p.then((dce) => {
    t.ok(dce[1].metadata.annotations, 'has annotations');
    t.ok(dce[1].spec.template.metadata.labels.deploymentconfig);
    t.equal(Array.isArray(dce), true, 'should return an array');
    t.equal(dce.length, 2, 'array should have 2 things');
    t.equal(dce[1].kind, 'Deployment', 'should have the deployment type');
    t.end();
  });
});

test('deployment enricher - deployment', async (t) => {
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

  const dce = await deploymentEnricher.enrich(config, resourceList);

  t.equal(Array.isArray(dce), true, 'should return an array');
  t.notEqual(dce, resourceList, 'should not be equal');
  t.equal(dce[1].kind, 'Deployment', 'should have the deployment type');
  t.end();
});

test('deployment enricher - no deployment - kube flag', (t) => {
  const resourceList = [
    {
      kind: 'Service',
      metadata: {
        name: 'service meta'
      }
    }
  ];

  t.ok(deploymentEnricher.enrich, 'has an enrich property');
  t.equal(typeof deploymentEnricher.enrich, 'function', 'is a function');

  t.ok(deploymentEnricher.name, 'has an name property');
  t.equal(deploymentEnricher.name, 'deployment');

  const config = {
    kube: true,
    projectName: 'Project Name',
    version: '1.0.0',
    namespace: {
      name: 'namespace'
    }
  };
  const p = deploymentEnricher.enrich(config, resourceList);
  t.ok(p instanceof Promise, 'enricher should return a promise');

  p.then((dce) => {
    t.equal(Array.isArray(dce), true, 'should return an array');
    t.equal(dce.length, 2, 'array should have 2 things');
    t.equal(dce[1].kind, 'Deployment', 'should have the deployment type');
    t.end();
  });
});
