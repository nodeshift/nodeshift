'use strict';

const test = require('tape');
const buildStrategy = require('../../lib/definitions/build-strategy');

test('default strategy', (t) => {
  const result = buildStrategy();

  t.equal(result.type, 'Source', 'default is Source type');
  t.equal(result.sourceStrategy.from.name, 'bucharestgold/centos7-s2i-nodejs:latest', 'docker image should be latet BG gold image');
  t.equal(result.sourceStrategy.forcePull, undefined, 'no forcePull by default');

  t.end();
});

test('strategy with changed dockerTag', (t) => {
  const result = buildStrategy({nodeVersion: '8.x'});
  t.equal(result.sourceStrategy.from.name, 'bucharestgold/centos7-s2i-nodejs:8.x', 'docker image should be 8.x BG gold image');
  t.end();
});

test('strategy with changed forcePull', (t) => {
  const result = buildStrategy({forcePull: true});
  t.equal(result.sourceStrategy.forcePull, true, 'forcePull on');
  t.end();
});

test('strategy with changed forcePull to false', (t) => {
  const result = buildStrategy({forcePull: false});
  t.equal(result.sourceStrategy.forcePull, false, 'forcePull off');
  t.end();
});

test('strategy with change dockerImage', (t) => {
  const result = buildStrategy({dockerImage: 'lholmquist/centos7-s2i-nodejs'});

  t.equal(result.sourceStrategy.from.name, 'lholmquist/centos7-s2i-nodejs:latest', 'docker image should be latet lholmquist image');
  t.end();
});
