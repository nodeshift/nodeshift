'use strict';

const test = require('tape');
const proxyquire = require('proxyquire');

test('build goal', (t) => {
  const build = require('../../lib/goals/build');

  t.equal(typeof build, 'function', 'should export a function');
  t.end();
});

const config = {
  projectLocation: 'location'
};

test('build goal function', (t) => {
  const build = proxyquire('../../lib/goals/build', {
    '../project-archiver': {
      archiveAndTar: () => Promise.resolve()
    },
    '../build-config': {
      createOrUpdateBuildConfig: () => Promise.resolve()
    },
    '../image-stream': {
      createOrUpdateImageStream: () => Promise.resolve()
    },
    '../binary-build': () => Promise.resolve()
  });

  const b = build(config).then(() => {
    t.pass();
    t.end();
  });

  t.equal(b instanceof Promise, true, 'returns a promise');
});

test('build goal function - kube flag', (t) => {
  const build = proxyquire('../../lib/goals/build', {
    '../project-archiver': {
      createContainer: (config) => {
        t.pass();
        return '12345';
      }
    }
  });

  const config = {
    projectLocation: 'location',
    kube: true
  };

  const b = build(config).then((imageId) => {
    t.pass();
    t.equal(imageId, '12345', 'should have the 12345 image ID');
    t.end();
  });

  t.equal(b instanceof Promise, true, 'returns a promise');
});
