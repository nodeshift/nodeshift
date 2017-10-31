'use strict';

const jsyaml = require('js-yaml');
const fs = require('fs');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');

// Take yaml as a string that has already been loaded from a file or something.
function yamlToJson (yamlToParse) {
  // TODO: better error handling
  return jsyaml.safeLoad(yamlToParse);
}

function normalizeFileList (fileList) {
  const result = {
    existing: [],
    nonexistent: []
  };
  fileList.forEach((file) => {
    if (fs.existsSync(file)) {
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

module.exports = {
  yamlToJson: yamlToJson,
  normalizeFileList: normalizeFileList,
  createDir: createDir,
  cleanUp: cleanUp
};
