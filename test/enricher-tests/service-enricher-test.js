'use strict';

const test = require('tape');

const serviceEnricher = require('../../lib/resource-enrichers/service-enricher');

const config = {
  projectName: 'Project Name',
  version: '1.0.0',
  namespace: {
    name: 'the namespace'
  },
  port: 8080
};

test('service enricher test - no service', (t) => {
  const resourceList = [];

  t.ok(serviceEnricher.enrich, 'has an enrich property');
  t.equal(typeof serviceEnricher.enrich, 'function', 'is a function');
  t.ok(serviceEnricher.name, 'has an name property');
  t.equal(serviceEnricher.name, 'service', 'name property is service');

  const p = serviceEnricher.enrich(config, resourceList);
  t.ok(p instanceof Promise, 'enricher should return a Promise');

  p.then((se) => {
    t.equal(Array.isArray(se), true, 'should return an array');
    t.equal(resourceList.length, 1, 'resourceList size increases by 1');
    t.ok(se[0].spec.selector, 'selector prop should be here');
    t.equal(se[0].spec.selector.provider, 'nodeshift', 'provider should be nodeshift');
    t.equal(se[0].spec.selector.project, config.projectName, `spec.selector.project should be ${config.projectName}`);
    t.ok(se[0].spec.ports, 'ports prop should be here');
    t.equal(se[0].spec.ports[0].port, 8080, 'port should be 8080');
    t.equal(se[0].spec.ports[0].targetPort, 8080, 'targetPort should be 8080');
    t.ok(Array.isArray(se[0].spec.ports), 'ports prop should be here');
    t.ok(se[0].spec.type, 'type prop should be here');
    t.equal(se[0].spec.type, 'ClusterIP', 'spec.type should be ClusterIP');
    t.end();
  });
});

test('service enricher test - service', async (t) => {
  const resourceList = [
    {
      kind: 'Service',
      spec: {
        ports: [
          {
            protocol: 'TCP',
            port: 3000,
            targetPort: 3000
          }
        ]
      }
    },
    { kind: 'Deployment' }
  ];
  const se = await serviceEnricher.enrich(config, resourceList);

  t.notEqual(se, resourceList, 'arrays should not be equal');
  t.equal(Array.isArray(se), true, 'should return an array');
  t.equal(resourceList.length, 2, 'resourceList size should not increases by 2');
  t.ok(se[0].spec.selector, 'selector prop should be here');
  t.equal(se[0].spec.selector.provider, 'nodeshift', 'provider should be nodeshift');
  t.equal(se[0].spec.selector.project, config.projectName, `spec.selector.project should be ${config.projectName}`);
  t.ok(se[0].spec.ports, 'ports prop should be here');
  t.equal(se[0].spec.ports[0].port, 3000, 'port should be 3000');
  t.equal(se[0].spec.ports[0].targetPort, 3000, 'targetPort should be 3000');
  t.ok(Array.isArray(se[0].spec.ports), 'ports prop should be here');
  t.ok(se[0].spec.type, 'type prop should be here');
  t.equal(se[0].spec.type, 'ClusterIP', 'spec.type should be ClusterIP');
  t.equal(se[0].spec.ports[0].name, 'http');
  t.end();
});

test('service enricher test - no service - kube flag', (t) => {
  const resourceList = [];

  t.ok(serviceEnricher.enrich, 'has an enrich property');
  t.equal(typeof serviceEnricher.enrich, 'function', 'is a function');
  t.ok(serviceEnricher.name, 'has an name property');
  t.equal(serviceEnricher.name, 'service', 'name property is service');

  const config = {
    kube: true,
    projectName: 'Project Name',
    version: '1.0.0',
    namespace: {
      name: 'the namespace'
    },
    port: 8080
  };

  const p = serviceEnricher.enrich(config, resourceList);
  t.ok(p instanceof Promise, 'enricher should return a Promise');

  p.then((se) => {
    t.equal(Array.isArray(se), true, 'should return an array');
    t.equal(resourceList.length, 1, 'resourceList size increases by 1');
    t.ok(se[0].spec.selector, 'selector prop should be here');
    t.equal(se[0].spec.selector.app, config.projectName, `spec.selector.app should be ${config.projectName}`);
    t.ok(se[0].spec.ports, 'ports prop should be here');
    t.equal(se[0].spec.ports[0].port, 8080, 'port should be 8080');
    t.equal(se[0].spec.ports[0].targetPort, 8080, 'targetPort should be 8080');
    t.ok(Array.isArray(se[0].spec.ports), 'ports prop should be here');
    t.ok(se[0].spec.type, 'type prop should be here');
    t.equal(se[0].spec.type, 'LoadBalancer', 'spec.type should be LoadBalancer');
    t.end();
  });
});
