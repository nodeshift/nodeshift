'use strict';

// This module will try to find a "nodeshift" directory inside the users project
// In this directory should be the "resource" files for an openshift application
// See the wildfly-swarm booster for an example: https://github.com/wildfly-swarm-openshiftio-boosters/wfswarm-rest-http/tree/master/src/main/fabric8

const fs = require('fs');
const helpers = require('./helpers');
const logger = require('./common-log')();

function loadYamls (resourceList, config) {
  // Read in the files in our resource list;
  // This will return an array of strings
  const resourcePromises = resourceList.map((resource) => {
    return new Promise((resolve, reject) => {
      fs.readFile(`${config.projectLocation}/${config.nodeshiftDirectory}/${resource}`, 'utf-8', (err, data) => {
        if (err) {
          return reject(err);
        }
        // TODO: Do any string substituion here
        // Do i parse the result here? or should i wait?
        const jsonYaml = helpers.yamlToJson(data);
        if (!config.definedProperties) {
          return resolve(jsonYaml);
        }

        const stringJSON = JSON.stringify(jsonYaml);

        /* eslint prefer-template: "off" */
        const reduced = config.definedProperties.reduce((acc, curr) => {
          return acc.split('${' + curr.key + '}').join(curr.value);
        }, stringJSON);
        const backToJSON = JSON.parse(reduced);
        return resolve(backToJSON);
      });
    });
  });

  return Promise.all(resourcePromises);
}

function findYamls (config) {
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

      // only want the .yml or .yaml files
      const filtered = files.filter((file) => {
        const filesSplit = file.split('.');
        return (filesSplit[1] && filesSplit[1]) === 'yml' || (filesSplit[1] && filesSplit[1]) === 'yaml';
      });

      return resolve(filtered);
    });
  });
}

/**
  @returns {Promise} - A list of the resource .yml files as JSON Objects
*/
module.exports = async function loadResources (config) {
  return loadYamls(await findYamls(config), config);
};
