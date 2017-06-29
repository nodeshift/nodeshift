const test = require('tape');
const BuildStrategy = require('../lib/definitions/build-strategy');

test('defaults to using the latest bucharestgold s2i builder image', t => {
  const buildStrategy = BuildStrategy();
  t.equals(buildStrategy.sourceStrategy.from.name, 'bucharestgold/centos7-s2i-nodejs:latest');
  t.end();
});

test('accepts a node version option', t => {
  const buildStrategy = BuildStrategy({nodeVersion: '8.x'});
  t.equals(buildStrategy.sourceStrategy.from.name, 'bucharestgold/centos7-s2i-nodejs:8.x');
  t.end();
});