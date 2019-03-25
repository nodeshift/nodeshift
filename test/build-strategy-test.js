const test = require('tape');
const BuildStrategy = require('../lib/definitions/build-strategy');

test('defaults to using the latest nodeshift s2i builder image', t => {
  const buildStrategy = BuildStrategy();
  t.equals(buildStrategy.sourceStrategy.from.name, 'nodeshift/centos7-s2i-nodejs:latest');
  t.end();
});

test('accepts a node version using imageTag option', t => {
  const buildStrategy = BuildStrategy({ imageTag: '8.x' });
  t.equals(buildStrategy.sourceStrategy.from.name, 'nodeshift/centos7-s2i-nodejs:8.x');
  t.end();
});
