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

  const enrichResource = proxyquire('../lib/enrich-resources', {
    './load-enrichers': () => { return {}; }
  });

  enrichResource({}, resourceList);

  t.pass('success');
  t.end();
});

test('enrich-resource - enricher is not a function', (t) => {
  const enrichResource = proxyquire('../lib/enrich-resources', {
    './load-enrichers': () => {
      return {
        'deployment-config': () => {
          t.pass('should get called');
        }
      };
    }
  });

  enrichResource({}, []);

  t.pass('success');
  t.end();
});
