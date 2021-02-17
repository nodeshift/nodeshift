'use strict';

const test = require('tape');

const meteringEnricher = require('../../lib/resource-enrichers/metering-enricher');
const config = {
  projectName: 'Project Name',
  version: '1.0.0',
  namespace: {
    name: 'namespace'
  }
};

test('metering enricher - no metering', (t) => {
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
      },
      spec: {
        template: {
          metadata: {
            labels: {}
          }
        }
      }
    }
  ];

  t.ok(meteringEnricher.enrich, 'has an enrich property');
  t.equal(typeof meteringEnricher.enrich, 'function', 'is a function');

  t.ok(meteringEnricher.name, 'has an name property');
  t.equal(meteringEnricher.name, 'metering');

  const p = meteringEnricher.enrich({ ...config, metering: false }, resourceList);
  t.ok(p instanceof Promise, 'enricher should return a promise');

  p.then((me) => {
    t.equal(Array.isArray(me), true, 'should return an array');
    t.equal(me.length, 2, 'array should have 1 things');
    t.equal(me[1].spec.template.metadata.labels['com.redhat.component-name'], undefined, 'should be no metering labels');
    t.equal(me[1].spec.template.metadata.labels['com.redhat.component-type'], undefined, 'should be no metering labels');
    t.equal(me[1].spec.template.metadata.labels['com.redhat.component-version'], undefined, 'should be no metering labels');
    t.equal(me[1].spec.template.metadata.labels['com.redhat.product-name'], undefined, 'should be no metering labels');
    t.equal(me[1].spec.template.metadata.labels['com.redhat.product-version'], undefined, 'should be no metering labels');
    t.end();
  });
});

test('metering enricher - no deployment', (t) => {
  const resourceList = [
    {
      kind: 'Service',
      metadata: {
        name: 'service meta'
      }
    }
  ];

  t.ok(meteringEnricher.enrich, 'has an enrich property');
  t.equal(typeof meteringEnricher.enrich, 'function', 'is a function');

  t.ok(meteringEnricher.name, 'has an name property');
  t.equal(meteringEnricher.name, 'metering');

  const p = meteringEnricher.enrich({ ...config, metering: true }, resourceList);
  t.ok(p instanceof Promise, 'enricher should return a promise');

  p.then((me) => {
    t.equal(Array.isArray(me), true, 'should return an array');
    t.equal(me.length, 1, 'array should have 1 things');
    t.end();
  });
});

test('metering enricher - metering', async (t) => {
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
      },
      spec: {
        template: {
          metadata: {
            labels: {}
          }
        }
      }
    }
  ];

  const me = await meteringEnricher.enrich({ ...config, metering: true, dockerImage: 'registry.access.redhat.com/ubi8/nodejs-14' }, resourceList);

  t.equal(Array.isArray(me), true, 'should return an array');
  t.notEqual(me, resourceList, 'should not be equal');
  t.equal(me[1].kind, 'Deployment', 'should have the deployment type');
  t.equal(me[1].spec.template.metadata.labels['com.redhat.component-name'], 'Node.js', 'should be metering labels');
  t.equal(me[1].spec.template.metadata.labels['com.redhat.component-type'], 'application', 'should be metering labels');
  t.equal(me[1].spec.template.metadata.labels['com.redhat.component-version'], '14', 'should be metering labels');
  t.equal(me[1].spec.template.metadata.labels['com.redhat.product-name'], 'Red_Hat_Runtimes', 'should be metering labels');
  t.equal(me[1].spec.template.metadata.labels['com.redhat.product-version'], '2021/Q1', 'should be metering labels');

  t.end();
});

test('metering enricher - metering, override node version', async (t) => {
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
      },
      spec: {
        template: {
          metadata: {
            labels: {}
          }
        }
      }
    }
  ];

  const me = await meteringEnricher.enrich({ ...config, metering: { nodeVersion: '14.15.4' } }, resourceList);

  t.equal(Array.isArray(me), true, 'should return an array');
  t.notEqual(me, resourceList, 'should not be equal');
  t.equal(me[1].kind, 'Deployment', 'should have the deployment type');
  t.equal(me[1].spec.template.metadata.labels['com.redhat.component-name'], 'Node.js', 'should be metering labels');
  t.equal(me[1].spec.template.metadata.labels['com.redhat.component-type'], 'application', 'should be metering labels');
  t.equal(me[1].spec.template.metadata.labels['com.redhat.component-version'], '14.15.4', 'should be metering labels');
  t.equal(me[1].spec.template.metadata.labels['com.redhat.product-name'], 'Red_Hat_Runtimes', 'should be metering labels');
  t.equal(me[1].spec.template.metadata.labels['com.redhat.product-version'], '2021/Q1', 'should be metering labels');

  t.end();
});

test('metering enricher - metering, unknown node version', async (t) => {
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
      },
      spec: {
        template: {
          metadata: {
            labels: {}
          }
        }
      }
    }
  ];

  const me = await meteringEnricher.enrich({ ...config, metering: { nodeVersion: '16.1.0' } }, resourceList);

  t.equal(Array.isArray(me), true, 'should return an array');
  t.notEqual(me, resourceList, 'should not be equal');
  t.equal(me[1].kind, 'Deployment', 'should have the deployment type');
  t.equal(me[1].spec.template.metadata.labels['com.redhat.component-name'], 'Node.js', 'should be metering labels');
  t.equal(me[1].spec.template.metadata.labels['com.redhat.component-type'], 'application', 'should be metering labels');
  t.equal(me[1].spec.template.metadata.labels['com.redhat.component-version'], '16.1.0', 'should be metering labels');
  t.equal(me[1].spec.template.metadata.labels['com.redhat.product-name'], 'Red_Hat_Runtimes', 'should be metering labels');
  t.equal(me[1].spec.template.metadata.labels['com.redhat.product-version'], 'unknown', 'should be metering labels');

  t.end();
});
