'use strict';

const test = require('tape');
const proxyquire = require('proxyquire');

test('builc-config-spec', (t) => {
  const proxyFunc = () => {};
  const buildConfigSpec = proxyquire('../../lib/definitions/build-config-spec', {
    './build-source': proxyFunc,
    './build-strategy': proxyFunc,
    './build-output': proxyFunc
  });

  const bcs = buildConfigSpec();

  t.ok(bcs.triggers, 'should have a triggers array');
  t.end();
});
