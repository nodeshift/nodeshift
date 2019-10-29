const test = require('tape');
const BuildStrategy = require('../lib/definitions/build-strategy');

test('defaults to using latest ubi7/nodejs-10 s2i builder image', t => {
  const buildStrategy = BuildStrategy();
  t.equals(buildStrategy.sourceStrategy.from.name, 'registry.access.redhat.com/ubi7/nodejs-10:latest');
  t.end();
});

test('accepts a node version using imageTag option', t => {
  const buildStrategy = BuildStrategy({ imageTag: '1-20' });
  t.equals(buildStrategy.sourceStrategy.from.name, 'registry.access.redhat.com/ubi7/nodejs-10:1-20');
  t.end();
});
