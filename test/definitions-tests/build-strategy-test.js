'use strict';

const test = require('tape');
const buildStrategy = require('../../lib/definitions/build-strategy');

test('default strategy', (t) => {
  const result = buildStrategy({ buildStrategy: 'Source', dockerImage: 'registry.access.redhat.com/ubi8/nodejs-14', imageTag: 'latest' });

  t.equal(result.type, 'Source', 'default is Source type');
  t.ok(result.sourceStrategy, 'Source strategy object');
  t.equal(result.sourceStrategy.from.name, 'registry.access.redhat.com/ubi8/nodejs-14:latest', 'docker image should be ubi8/nodejs-14:latest image');
  t.equal(result.sourceStrategy.forcePull, undefined, 'no forcePull by default');

  t.end();
});

test('strategy with changed dockerTag', (t) => {
  const result = buildStrategy({ imageTag: '1-20', buildStrategy: 'Source', dockerImage: 'registry.access.redhat.com/ubi8/nodejs-14' });
  t.equal(result.sourceStrategy.from.name, 'registry.access.redhat.com/ubi8/nodejs-14:1-20', 'docker image should be 1-20 ubi8/nodejs-14 image');
  t.end();
});

test('strategy with imageStream specified and updated tag', (t) => {
  const result = buildStrategy({ imageTag: '1-20', buildStrategy: 'Source', imageStream: 'odbc-base' });
  t.equal(result.sourceStrategy.from.name, 'odbc-base:1-20', 'image stream should be odbc-base:1-20');
  t.end();
});

test('strategy with changed forcePull', (t) => {
  const result = buildStrategy({ forcePull: true, buildStrategy: 'Source' });
  t.equal(result.sourceStrategy.forcePull, true, 'forcePull on');
  t.end();
});

test('strategy with changed forcePull to false', (t) => {
  const result = buildStrategy({ forcePull: false, buildStrategy: 'Source' });
  t.equal(result.sourceStrategy.forcePull, false, 'forcePull off');
  t.end();
});

test('strategy with changed incremental', (t) => {
  const result = buildStrategy({ incremental: true, buildStrategy: 'Source' });
  t.equal(result.sourceStrategy.incremental, true, 'incremental on');
  t.end();
});

test('strategy with changed incremental to false', (t) => {
  const result = buildStrategy({ incremental: false, buildStrategy: 'Source' });
  t.equal(result.sourceStrategy.incremental, false, 'incremental off');
  t.end();
});

test('strategy with change dockerImage', (t) => {
  const result = buildStrategy({ dockerImage: 'lholmquist/centos7-s2i-nodejs', buildStrategy: 'Source', imageTag: 'latest' });

  t.equal(result.sourceStrategy.from.name, 'lholmquist/centos7-s2i-nodejs:latest', 'docker image should be latest lholmquist image');
  t.equal(result.sourceStrategy.from.kind, 'DockerImage', 'kind should be DockerImage');
  t.end();
});

test('strategy with imageStream specified', (t) => {
  const result = buildStrategy({ imageStream: 'odbc-base', buildStrategy: 'Source', imageTag: 'latest' });

  t.equal(result.sourceStrategy.from.name, 'odbc-base:latest', 'image name should be odbc-base:latest');
  t.equal(result.sourceStrategy.from.kind, 'ImageStreamTag', 'kind should be ImageStreamTag');
  t.end();
});

test('strategy with env vars', (t) => {
  const envs = [
    {
      name: 'NODE_ENV',
      value: 'development'
    }
  ];

  const result = buildStrategy({ buildEnv: envs, buildStrategy: 'Source' });

  t.ok(result.sourceStrategy.env, 'env prop exists');
  t.equal(result.sourceStrategy.env[0].name, 'NODE_ENV', 'has the name value');
  t.equal(result.sourceStrategy.env[0].value, 'development', 'has the value value');
  t.end();
});

test('defaults to using latest ubi8/nodejs-14 s2i builder image', t => {
  const result = buildStrategy({ buildStrategy: 'Source', dockerImage: 'registry.access.redhat.com/ubi8/nodejs-14', imageTag: 'latest' });

  t.equals(result.sourceStrategy.from.name, 'registry.access.redhat.com/ubi8/nodejs-14:latest');
  t.end();
});

test('accepts a node version using imageTag option', t => {
  const result = buildStrategy({ imageTag: '1-20', buildStrategy: 'Source', dockerImage: 'registry.access.redhat.com/ubi8/nodejs-14' });

  t.equals(result.sourceStrategy.from.name, 'registry.access.redhat.com/ubi8/nodejs-14:1-20');
  t.end();
});

test('Docker strategy', (t) => {
  const result = buildStrategy({ buildStrategy: 'Docker' });

  t.equal(result.type, 'Docker', 'use Docker type');
  t.ok(result.dockerStrategy, 'correct strategy object');
  t.end();
});
