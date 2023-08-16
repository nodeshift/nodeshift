/*
 *
 *  Copyright 2016-2017 Red Hat, Inc, and individual contributors.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

'use strict';

const jsyaml = require('js-yaml');
const fs = require('fs');
const mkdirp = require('mkdirp');
const { promisify } = require('util');
const { minimatch } = require('minimatch');
const parse = require('parse-gitignore');

const rmrf = require('./utils/rmrf');

const readdir = promisify(fs.readdir);
const readfile = promisify(fs.readFile);

// Take yaml as a string that has already been loaded from a file or something.
function yamlToJson (yamlToParse) {
  return jsyaml.safeLoad(yamlToParse);
}

function normalizeFileList (fileList, projectLocation) {
  const result = {
    existing: [],
    nonexistent: []
  };
  fileList.forEach((file) => {
    if (fs.existsSync(`${projectLocation}/${file}`)) {
      result.existing.push(file);
    } else {
      result.nonexistent.push(file);
    }
  });
  return result;
}

function createDir (directoryToCreate) {
  return mkdirp(directoryToCreate);
}

function cleanUp (directoryToClean) {
  return rmrf(directoryToClean);
}

function listFiles (dir) {
  return readdir(dir);
}

function parseMultiOption (arr) {
  // split on the "=" then convert an array of objects where the name is the 0 index and value is the 1 index
  return arr.map((props) => {
    return props.split('=');
  }).map((v) => {
    return {
      name: v[0],
      value: v[1]
    };
  });
}

function wait (timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}

async function awaitRequest (promise) {
  let result;
  try {
    result = await promise;
  } catch (err) {
    if (err.code !== 404) {
      return Promise.reject(err);
    }
    result = err;
  }
  return result;
}

async function parseIgnoreFile (path) {
  if (!fs.existsSync(path)) {
    return [];
  }
  const file = await readfile(path);
  return parse(file);
}

function matchRule (filename, rule) {
  return minimatch(filename, rule);
}

function generateUUID () {
  // Quick and dirty solution, since we are only using this for generating an appID
  return Math.random().toString(26).slice(2);
}

function parseMeteringEntry (arr) {
  return arr.reduce((accum, curr, index, sourceArray) => {
    if (typeof curr === 'object') {
      return Object.assign({}, accum, curr);
    }
  }, {});
}

module.exports = {
  yamlToJson: yamlToJson,
  normalizeFileList: normalizeFileList,
  createDir: createDir,
  cleanUp: cleanUp,
  listFiles: listFiles,
  parseMultiOption: parseMultiOption,
  wait,
  awaitRequest,
  parseIgnoreFile,
  matchRule,
  generateUUID,
  parseMeteringEntry
};
