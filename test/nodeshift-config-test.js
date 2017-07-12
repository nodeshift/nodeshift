'use strict';

const test = require('tape');
const proxyquire = require('proxyquire');

const nodeshiftConfig = proxyquire('../lib/nodeshift-config', {
  'openshift-config-loader': () => {
    return Promise.resolve({
      context: {
        namespace: 'test-namespace'
      },
      cluster: 'http://mock-cluster'
    });
  },
  'openshift-rest-client': () => { return Promise.resolve({}); }
});

test('nodeshift-config basic setup', (t) => {
  const p = nodeshiftConfig().then((config) => {
    t.ok(config.projectLocation, 'projectLocation prop should be here');
    t.equal(config.projectLocation, process.cwd(), 'projectLocation prop should be cwd by default');
    t.ok(config.nodeshiftDirectory, 'nodeshiftDir prop should be here');
    t.equal(config.nodeshiftDirectory, '.nodeshift', 'nodeshiftDir prop should be .nodeshift by default');
    t.end();
  }).catch(t.fail);

  t.equal(p instanceof Promise, true, 'should return a Promise');
});

test('nodeshift-config other project location and nodeshiftDir', (t) => {
  const options = {
    projectLocation: '../examples/sample-project',
    nodeshiftDirectory: '.notnodeshift'
  };

  nodeshiftConfig(options).then((config) => {
    t.equal(config.projectLocation, '../examples/sample-project', 'projectLocation prop should be changed');
    t.equal(config.nodeshiftDirectory, '.notnodeshift', 'nodeshiftDir prop should be changed');
    t.end();
  });
});

test('nodeshift-config no project Version', (t) => {
  const options = {
    projectLocation: '../examples/sample-project-no-version'
  };

  nodeshiftConfig(options).then((config) => {
    t.equal(config.projectVersion, '0.0.0', 'projectVersion should be 0.0.0');
    t.end();
  });
});

test('nodeshift-config no package.json', (t) => {
  const options = {
    projectLocation: './not-here'
  };

  nodeshiftConfig(options).catch((err) => {
    t.equal(err.message, 'Cannot find module \'./not-here/package.json\'', 'Error Should be "\'Cannot find module \'./not-here/package.json\'\'"');
    t.end();
  });
});
