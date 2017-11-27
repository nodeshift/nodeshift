'use strict';

const test = require('tape');
const proxyquire = require('proxyquire');

const config = {
  projectName: 'Project Name',
  version: '1.0.0'
};

test('Route enricher - no route resource', (t) => {
  const routeEnricher = proxyquire('../../lib/resource-enrichers/route-enricher', {
    '../definitions/route-spec': () => {
      t.fail('this should not be hit');
    }
  });
  const resourceList = [
    {
      kind: 'Service',
      metadata: {
        name: 'service meta'
      }
    }
  ];

  const re = routeEnricher(config, resourceList);

  t.equal(typeof routeEnricher, 'function', 'is a function');
  t.equal(Array.isArray(re), true, 'should return an array');
  t.notEqual(re, resourceList, 'arrays should not be equal');
  t.end();
});

test('Route enricher - no route resource', (t) => {
  const routeEnricher = proxyquire('../../lib/resource-enrichers/route-enricher', {
    '../definitions/route-spec': () => {}
  });
  const resourceList = [
    {
      kind: 'Service',
      metadata: {
        name: 'service meta'
      }
    },
    {
      kind: 'Route',
      metadata: {
        name: 'route name'
      }
    }
  ];

  const re = routeEnricher(config, resourceList);

  t.equal(typeof routeEnricher, 'function', 'is a function');
  t.equal(Array.isArray(re), true, 'should return an array');
  t.notEqual(re, resourceList, 'arrays should not be equal');
  t.ok(re[1].spec, 'spec should exist');
  t.end();
});
