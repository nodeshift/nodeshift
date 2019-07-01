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
  let i = 0;
  const enrichResource = proxyquire('../lib/enrich-resources', {
    './load-enrichers': () => {
      return {
        'deployment-config': () => {
          i++;
          t.pass('should get called');
        },
        'route': () => {
          i++;
          t.pass('should get called');
        },
        'service': () => {
          i++;
          t.pass('should get called');
        },
        'labels': () => {
          i++;
          t.pass('should get called');
        },
        'git-info': () => {
          i++;
          t.pass('should get called');
        },
        'health-check': () => {
          i++;
          t.pass('should get called');
        }
      };
    }
  });

  const p = enrichResource({}, []);
  t.ok(p instanceof Promise, 'should return a promise');

  p.then(() => {
    t.equal(i, 6, 'should have 6 default enrichers');
    t.pass('success');
    t.end();
  });
});
