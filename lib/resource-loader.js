'use strict';

// This module will try to find a "nodeshift" directory inside the users project
// In this directory should be the "resource" files for an openshift application
// See the wildfly-swarm booster for an example: https://github.com/wildfly-swarm-openshiftio-boosters/wfswarm-rest-http/tree/master/src/main/fabric8

const fs = require('fs');
const helpers = require('./helpers');

const DEFAULT_NODESHIFT_DIRECTORY = '.nodeshift';

function loadYamls (resourceList, options) {
  // Read in the files in our resource list;
  // This will return an array of strings
  const resoucePromises = resourceList.map((resource) => {
    return new Promise((resolve, reject) => {
      fs.readFile(`${options.projectLocation}/${options.nodeshiftDir}/${resource}`, 'utf-8', (err, data) => {
        if (err) {
          return reject(err);
        }
        // Do i parse the result here? or should i wait?
        return resolve(helpers.yamlToJson(data));
      });
    });
  });

  return Promise.all(resoucePromises).then((resources) => {
    return resources;
  });
}

function findYamls (options) {
  return new Promise((resolve, reject) => {
    fs.readdir(`${options.projectLocation}/${options.nodeshiftDir}`, (err, files) => {
      // Probably can ignore, or maybe have a warning or something if the directory doesn't exist
      if (err && err.code === 'ENOENT') {
        console.warn(`No ${options.nodeshiftDir} directory, moving on`);
        return resolve([]);
      }

      if (err && err.code !== 'ENOENT') {
        return reject(err);
      }

      // only want the .yml files
      const filtered = files.filter((file) => {
        const filesSplit = file.split('.');
        return filesSplit[1] && filesSplit[1] === 'yml';
      });

      return resolve(filtered);
    });
  });
}

/**
  @param {object} [options] -
  @param {string} [options.projectLocation] - the location(directory) of your projects package.json. Defaults to `process.cwd`
  @param {string} [options.nodeshiftDir] - the location(directory) of your resource files, defaults to the ".nodeshift" directory in your projects location
  @returns {Promise} - A list of the resource .yml files as JSON Objects
*/
function loadResources (options) {
  options = options || {};

  options.nodeshiftDir = options.nodeshiftDir || DEFAULT_NODESHIFT_DIRECTORY;
  options.projectLocation = options.projectLocation || process.cwd();

  return findYamls(options).then((files) => {
    return loadYamls(files, options);
  });
}

module.exports = loadResources;
