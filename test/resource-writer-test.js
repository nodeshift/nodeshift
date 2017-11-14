'use strict';

const test = require('tape');
const proxyquire = require('proxyquire');

test('write resource', (t) => {
  const resourceWriter = proxyquire('../lib/resource-writer', {
    './helpers': {
      createDir: () => Promise.resolve()
    },
    'js-yaml': {
      safeDump: x => x
    },
    jsonfile: {
      writeFile: (fileName, data, options, cb) => {
        return cb(null, data);
      }
    },
    fs: {
      writeFile: (name, data, options, cb) => {
        return cb(null, data);
      }
    }
  });

  const config = {};
  const resources = [];
  const rw = resourceWriter(config, resources).then((list) => {
    t.equal(list.kind, 'List', 'should be a list kind of object');
    t.equal(Array.isArray(list.items), true, 'items.list should be an array');
    t.end();
  });

  t.equal(rw instanceof Promise, true, 'should return a promise');
});

test('write resource - error', (t) => {
  const resourceWriter = proxyquire('../lib/resource-writer', {
    './helpers': {
      createDir: () => Promise.reject(new Error('some error'))
    }
  });

  const config = {};
  const resources = [];
  const rw = resourceWriter(config, resources).catch(() => {
    t.pass('errors should be caught');
    t.end();
  });

  t.equal(rw instanceof Promise, true, 'should return a promise');
});
