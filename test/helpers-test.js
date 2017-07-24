'use strict';

const test = require('tape');

const helpers = require('../lib/helpers');

test('checks existing and nonexistent files', (t) => {
  t.plan(2);
  const fileList = require('../package.json').files;
  fileList.push('bar');
  const result = helpers.normalizeFileList(fileList);
  t.deepEqual(result.existing, [ 'package.json', 'README.md', 'LICENSE', 'index.js', 'lib', 'bin' ], `existing files: ${result.existing}`);
  t.deepEqual(result.nonexistent, ['example.js', 'bar'], 'example.js and bar do not exist.');
  t.end();
});
