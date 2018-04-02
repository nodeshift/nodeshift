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
const rimraf = require('rimraf');
const {promisify} = require('util');
const readdir = promisify(fs.readdir);

// Take yaml as a string that has already been loaded from a file or something.
function yamlToJson (yamlToParse) {
  // TODO: better error handling
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

// TODO: make this a promise with the util.promisify
function createDir (directoryToCreate) {
  return new Promise((resolve, reject) => {
    mkdirp(directoryToCreate, (err) => {
      if (err) {
        return reject(new Error(err));
      }

      return resolve();
    });
  });
}

// TODO: make this a promise with the util.promisify
function cleanUp (directoryToClean) {
  return new Promise((resolve, reject) => {
    rimraf(directoryToClean, (err) => {
      if (err) {
        return reject(new Error(err));
      }
      return resolve();
    });
  });
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

module.exports = {
  yamlToJson: yamlToJson,
  normalizeFileList: normalizeFileList,
  createDir: createDir,
  cleanUp: cleanUp,
  listFiles: listFiles,
  parseMultiOption: parseMultiOption
};
