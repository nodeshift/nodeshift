'use strict';

// This module will try to find a "nodeshift" directory inside the users project
// In this directory should be the "resource" files for an openshift application
// See the wildfly-swarm booster for an example: https://github.com/wildfly-swarm-openshiftio-boosters/wfswarm-rest-http/tree/master/src/main/fabric8

const fs = require('fs');
const helpers = require('./helpers');
const logger = require('./common-log')();
const jsonfile = require('jsonfile');
const {promisify} = require('util');
const jsonReadFile = promisify(jsonfile.readFile);
const readFile = promisify(fs.readFile);

function loadYaml (fileLocation) {
  return readFile(fileLocation, {encoding: 'utf8'}).then((data) => {
    return helpers.yamlToJson(data);
  });
}

function loadJSON (fileLocation) {
  return jsonReadFile(fileLocation);
}

function loadFiles (resourceList, config) {
  // Read in the files in our resource list;
  // This will return an array of strings
  const resourcePromises = resourceList.map(async (resource) => {
    let loadedResource;

    if (resource.type === 'json') {
      loadedResource = await loadJSON(`${config.projectLocation}/${config.nodeshiftDirectory}/${resource.filename}`);
    } else {
      loadedResource = await loadYaml(`${config.projectLocation}/${config.nodeshiftDirectory}/${resource.filename}`);
    }

    if (!config.definedProperties) {
      return loadedResource;
    }

    const stringJSON = JSON.stringify(loadedResource);
    /* eslint prefer-template: "off" */
    const reduced = config.definedProperties.reduce((acc, curr) => {
      return acc.split('${' + curr.key + '}').join(curr.value);
    }, stringJSON);
    const backToJSON = JSON.parse(reduced);

    return backToJSON;
  });

  return Promise.all(resourcePromises);
}

function findFiles (config) {
  return new Promise((resolve, reject) => {
    fs.readdir(`${config.projectLocation}/${config.nodeshiftDirectory}`, (err, files) => {
      // Probably can ignore, or maybe have a warning or something if the directory doesn't exist
      if (err && err.code === 'ENOENT') {
        logger.warning(`No ${config.nodeshiftDirectory} directory`);
        return resolve([]);
      }

      if (err && err.code !== 'ENOENT') {
        return reject(err);
      }

      // Map the files into an object that has the type and fileLocation
      // Then filter since we only want the .yml or .yaml or .json files
      const filtered = files.map((file) => {
        const filesSplit = file.split('.');
        return {
          type: filesSplit[1],
          filename: file
        };
      }).filter((file) => {
        return file.type === 'yml' || file.type === 'yaml' || file.type === 'json';
      });
      return resolve(filtered);
    });
  });
}

/**
  @returns {Promise} - A list of the resource .yml or .yaml or .json files as JSON Objects
*/
module.exports = async function loadResources (config) {
  return loadFiles(await findFiles(config), config);
};
