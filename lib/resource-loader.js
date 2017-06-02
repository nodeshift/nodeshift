'use strict';

// This module will try to find a "nodeshift" directory inside the users project
// In this directory should be the "resource" files for an openshift application
// See the wildfly-swarm booster for an example: https://github.com/wildfly-swarm-openshiftio-boosters/wfswarm-rest-http/tree/master/src/main/fabric8

const fs = require('fs');
const helpers = require('./helpers');

const cwd = process.cwd();
const defaultNodeshiftDirectory = 'nodeshift';

function loadYamls (resourceList) {
  // Read in the files in our resource list;
  // This will return an array of strings
  const resoucePromises = resourceList.map((resource) => {
    return new Promise((resolve, reject) => {
      fs.readFile(`${cwd}/${defaultNodeshiftDirectory}/${resource}`, 'utf-8', (err, data) => {
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

function findYamls () {
  return new Promise((resolve, reject) => {
    fs.readdir(`${cwd}/${defaultNodeshiftDirectory}`, (err, files) => {
      // Probably can ignore, or maybe have a warning or something if the directory doesn't exist
      if (err) {
        console.warn(err);
      }

      if (!files) {
        return resolve([]);
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

// will return a list of resouce .yml files as JSON objects
function loadResources () {
  return findYamls().then((files) => {
    return loadYamls(files);
  });
}

module.exports = {
  loadResources,
  findYamls// ,
  // parseYamls
};
