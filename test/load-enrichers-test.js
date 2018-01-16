'use strict';

const test = require('tape');
const proxyquire = require('proxyquire');

test('load enrichers', (t) => {
  const loadEnrichers = proxyquire('../lib/load-enrichers', {
    fs: {
      readdirSync: (dir) => {
        return [
          'modulea.json',
          'deployment-config-enricher.js'
        ];
      }
    },
    './resource-enrichers/deployment-config-enricher.js': {
      enrich: () => {},
      name: 'deployment-config-enricher'
    }
  });

  const enrichers = loadEnrichers();
  t.ok(enrichers['deployment-config-enricher'], 'has the prop from the enricher');
  t.equal(Object.keys(enrichers).length, 1, 'should only have 1 key');
  t.end();
});
