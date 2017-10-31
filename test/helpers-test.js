'use strict';

const test = require('tape');
const proxyquire = require('proxyquire');

test('checks existing and nonexistent files', (t) => {
  const helpers = require('../lib/helpers');
  t.plan(2);
  const fileList = require('../package.json').files;
  fileList.push('bar');
  const result = helpers.normalizeFileList(fileList);
  t.deepEqual(result.existing, [ 'package.json', 'README.md', 'LICENSE', 'index.js', 'lib', 'bin' ], `existing files: ${result.existing}`);
  t.deepEqual(result.nonexistent, ['example.js', 'bar'], 'example.js and bar do not exist.');
  t.end();
});

test('test createDir function - success', (t) => {
  const helpers = proxyquire('../lib/helpers', {
    mkdirp: (dir, cb) => {
      return cb();
    }
  });

  t.equal(typeof helpers.createDir, 'function', 'this module exports a function');
  const p = helpers.createDir();
  t.equals(p instanceof Promise, true, 'createDir function is a promise');

  p.then(() => {
    t.pass('should pass');
    t.end();
  });
});

test('test createDir function - fail', (t) => {
  const helpers = proxyquire('../lib/helpers', {
    mkdirp: (dir, cb) => {
      return cb(new Error('error creating directory'));
    }
  });

  helpers.createDir().catch((err) => {
    t.equal('Error: error creating directory', err.message, 'error message should be displayed');
    t.end();
  });
});

test('test cleanup function - success', (t) => {
  const helpers = proxyquire('../lib/helpers', {
    rimraf: (dir, cb) => {
      return cb();
    }
  });

  t.equal(typeof helpers.cleanUp, 'function', 'this module exports a function');
  const p = helpers.cleanUp();
  t.equals(p instanceof Promise, true, 'cleanUp function is a promise');

  p.then(() => {
    t.pass('should pass');
    t.end();
  });
});

test('test cleanUp function - fail', (t) => {
  const helpers = proxyquire('../lib/helpers', {
    rimraf: (dir, cb) => {
      return cb(new Error('error cleaning up'));
    }
  });

  helpers.cleanUp().catch((err) => {
    t.equal('Error: error cleaning up', err.message, 'error message should be displayed');
    t.end();
  });
});
