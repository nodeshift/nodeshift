'use strict';

const test = require('tape');
const proxyquire = require('proxyquire');

const nodeshiftConfig = proxyquire('../lib/nodeshift-config', {
  'openshift-config-loader': () => { return Promise.resolve({}); },
  'openshift-rest-client': () => { return Promise.resolve({}); }
});

test('nodeshift-config basic setup', (t) => {
  const p = nodeshiftConfig();

  t.equal(p instanceof Promise, true, 'should return a Promise');
  t.end();
});

test('nodeshift-config other project location', (t) => {
  const options = {
    projectLocation: '../examples/sample-project'
  };

  nodeshiftConfig(options).then(() => {
    console.log('should be here');
    t.end();
  });
});

test('nodeshift-config no package.json', (t) => {
  const options = {
    projectLocation: './not-here'
  };

  nodeshiftConfig(options).catch((err) => {
    t.equal(err.message, 'No package.json could be found', 'Error Should be "No package.json could be found"');
    t.end();
  });
});
