'use strict';

const test = require('tape');

const serviceEnricher = require('../../lib/resource-enrichers/knative-service-enricher');

const config = {
  projectName: 'Project Name',
  version: '1.0.0',
  namespace: {
    name: 'the namespace'
  },
  port: 8080
};

test('knservice enricher test - no knservice', (t) => {
  const resourceList = [];

  t.ok(serviceEnricher.enrich, 'has an enrich property');
  t.equal(typeof serviceEnricher.enrich, 'function', 'is a function');
  t.ok(serviceEnricher.name, 'has an name property');
  t.equal(serviceEnricher.name, 'knative-serving-service', 'name property is knative-serving-service');

  const p = serviceEnricher.enrich(config, resourceList);
  t.ok(p instanceof Promise, 'enricher should return a Promise');

  p.then((se) => {
    t.equal(Array.isArray(se), true, 'should return an array');
    t.equal(resourceList.length, 1, 'resourceList size increases by 1');
    t.ok(se[0].spec.template.spec.containers, 'props should be here');
    t.equal(se[0].spec.template.spec.containers[0].image, `image-registry.openshift-image-registry.svc:5000/${config.namespace.name}/${config.projectName}`, 'container image should be here');
    t.end();
  });
});

test('knservice enricher test - knservice', async (t) => {
  const resourceList = [
    {
      kind: 'Service',
      apiVersion: 'serving.knative.dev'
    },
    { kind: 'Deployment' }
  ];
  const se = await serviceEnricher.enrich(config, resourceList);

  t.notEqual(se, resourceList, 'arrays should not be equal');
  t.equal(Array.isArray(se), true, 'should return an array');
  t.equal(resourceList.length, 2, 'resourceList size should not increases by 2');
  t.ok(se[0].spec.template.spec.containers, 'props should be here');
  t.equal(se[0].spec.template.spec.containers[0].image, `image-registry.openshift-image-registry.svc:5000/${config.namespace.name}/${config.projectName}`, 'container image should be here');
  t.end();
});
