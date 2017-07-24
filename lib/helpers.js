'use strict';

const jsyaml = require('js-yaml');
const fs = require('fs');

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

module.exports = {
  yamlToJson: yamlToJson,
  normalizeFileList: normalizeFileList
};
