'use strict';

const test = require('tape');
const proxyquire = require('proxyquire');

test('checks existing and nonexistent files', (t) => {
  const helpers = require('../lib/helpers');
  t.plan(2);
  const fileList = require('../package.json').files;
  fileList.push('bar');
  const result = helpers.normalizeFileList(fileList, process.cwd());
  t.deepEqual(result.existing, ['package.json', 'README.md', 'LICENSE', 'index.js', 'lib', 'bin'], `existing files: ${result.existing}`);
  t.deepEqual(result.nonexistent, ['example.js', 'bar'], 'example.js and bar do not exist.');
  t.end();
});

test('test createDir function - success', (t) => {
  const helpers = proxyquire('../lib/helpers', {
    mkdirp: (dir) => {
      return Promise.resolve();
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
    mkdirp: (dir) => {
      return Promise.reject(new Error('Error: error creating directory'));
    }
  });

  helpers.createDir().catch((err) => {
    t.equal('Error: error creating directory', err.message, 'error message should be displayed');
    t.end();
  });
});

test('test cleanup function - success', (t) => {
  const helpers = proxyquire('../lib/helpers', {
    './utils/rmrf': () => Promise.resolve()
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
    './utils/rmrf': () => Promise.reject(new Error('Error: error cleaning up'))
  });

  helpers.cleanUp().catch((err) => {
    t.equal('Error: error cleaning up', err.message, 'error message should be displayed');
    t.end();
  });
});

test('test parseMultiOption function', (t) => {
  const helpers = require('../lib/helpers');
  const arrayOfOptions = [
    'NODE_ENV=development',
    'YARN_ENABLED=true',
    'KEY'
  ];
  const parsed = helpers.parseMultiOption(arrayOfOptions);

  t.equal(Array.isArray(parsed), true, 'should return an array');
  t.equal(parsed.length, 3, 'should return an array of length 3');
  t.equal(parsed[0].name, 'NODE_ENV', 'first array with name prop');
  t.equal(parsed[0].value, 'development', 'first array wih value');
  t.equal(parsed[1].name, 'YARN_ENABLED', 'second array with name prop');
  t.equal(parsed[1].value, 'true', 'second array wih value');
  t.end();
});

test('test listFiles function - success', (t) => {
  const helpers = proxyquire('../lib/helpers', {
    fs: {
      readdir: (dir, cb) => cb(null, [])
    }
  });

  t.equal(typeof helpers.listFiles, 'function', 'this module exports a function');

  const p = helpers.listFiles();

  t.equals(p instanceof Promise, true, 'listFiles function is a promise');

  p.then(() => {
    t.pass('should pass');
    t.end();
  });
});

test('test listFiles function - fail', (t) => {
  const helpers = proxyquire('../lib/helpers', {
    fs: {
      readdir: (dir, cb) => cb(new Error('Error: error reading directory content'))
    }
  });

  helpers.listFiles().catch((err) => {
    t.equal('Error: error reading directory content', err.message, 'error message should be displayed');
    t.end();
  });
});

test('test awaitRequest function - success', (t) => {
  const helpers = require('../lib/helpers');
  const request = Promise.resolve('Request resolved successfully');

  helpers.awaitRequest(request).then(res => {
    t.equal('Request resolved successfully', res, 'success message should be displayed');
    t.end();
  });
});

test('test awaitRequest function - fail', (t) => {
  const helpers = require('../lib/helpers');
  const request = Promise.reject(new Error('Error: an error occurred'));

  helpers.awaitRequest(request).catch((err) => {
    t.equal('Error: an error occurred', err.message, 'error message should be displayed');
    t.end();
  });
});

test('test awaitRequest function - 404 fail', (t) => {
  const helpers = require('../lib/helpers');

  const error = new Error('Error: an 404 error occurred');
  error.code = 404;

  const request = Promise.reject(error);

  helpers.awaitRequest(request).then((res) => {
    t.equal('Error: an 404 error occurred', res.message, '404 errors should not be thrown');
    t.end();
  });
});

test('test yamlToJson function', (t) => {
  const helpers = proxyquire('../lib/helpers', {
    'js-yaml': {
      safeLoad: () => ({})
    }
  });

  t.equal(typeof helpers.yamlToJson, 'function', 'this module exports a function');

  const result = helpers.yamlToJson();

  t.deepEquals({}, result, 'should return json object');
  t.end();
});
