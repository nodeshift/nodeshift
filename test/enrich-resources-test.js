'use strict';

const test = require('tape');
const proxyquire = require('proxyquire');

test('enrich-resource', (t) => {
  const resourceList = [
    { kind: 'Service' },
    { kind: 'Route' },
    { kind: 'Deployment' },
    { kind: 'Secret' },
    { kind: 'other' }
  ];

  const mockedFunc = (config, resourceList) => resourceList;

  const enrichResource = proxyquire('../lib/enrich-resources', {
    './resource-enrichers/service-enricher': mockedFunc,
    './resource-enrichers/route-enricher': mockedFunc,
    './resource-enrichers/deployment-config-enricher': mockedFunc,
    './resource-enrichers/labels-enricher': mockedFunc,
    './resource-enrichers/git-info-enricher': mockedFunc
  });

  enrichResource({}, resourceList);

  t.pass('success');
  t.end();
});
