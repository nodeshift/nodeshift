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

// This module will try to find a "nodeshift" directory inside the users project
// In this directory should be the "resource" fragment files for an openshift application

const fs = require('fs');
const helpers = require('./helpers');
const logger = require('./common-log')();
const {promisify} = require('util');
const readFile = promisify(fs.readFile);

// These are the different kinds of resources we support
// key is the filename and value is the kind
const kindMappings = {
  route: 'Route',
  svc: 'Service',
  service: 'Service',
  secret: 'Secret',
  deployment: 'Deployment'
};

function loadYaml (fileLocation) {
  return readFile(fileLocation, {encoding: 'utf8'}).then((data) => {
    return helpers.yamlToJson(data);
  });
}

async function loadJSON (fileLocation) {
  const jsonFile = await readFile(fileLocation, {encoding: 'uttf8'});
  return JSON.parse(jsonFile);
}

function addIfNonExistent (fragment, key, value) {
  if (!fragment[key]) {
    fragment[key] = value;
  }
}

function loadFiles (resourceList, config) {
  // Read in the files in our resource list;
  // This will return an array of strings
  const resourcePromises = resourceList.map(async (resource) => {
    let loadedResource;

    if (resource.ext === 'json') {
      loadedResource = await loadJSON(`${config.projectLocation}/${config.nodeshiftDirectory}/${resource.filename}`);
    } else {
      loadedResource = await loadYaml(`${config.projectLocation}/${config.nodeshiftDirectory}/${resource.filename}`);
    }

    let kind;
    // Figure the kind from the name of the file
    if (resource.type) {
      // Validate that the resrouce type is in our list of supported kinds
      kind = kindMappings[resource.type.toLowerCase()];
      if (!kind) {
        return Promise.reject(new Error(`unknown type: ${resource.type} for filen: ${resource.filename}`));
      }
    } else {
      // lets try the name to see if that is it
      kind = kindMappings[resource.name.toLowerCase()];
    }

    // Add the kind and apiVersion if needed
    if (!kind && !loadedResource.kind) {
      return Promise.reject(new Error(`No type given as part of the file name (e.g. 'app-rc.yml') and no 'Kind' defined in resource descriptor ${resource.filename}`));
    }

    addIfNonExistent(loadedResource, 'kind', kind);

    // Add in apiVersion
    const apiVersion = 'v1'; // probably going to be different for kube stuff
    addIfNonExistent(loadedResource, 'apiVersion', apiVersion);

    // Check for metadata and add metadata.name if not there, if not there metadata.name defaults to appname
    if (!loadedResource.metadata) {
      loadedResource.metadata = {};
    }

    addIfNonExistent(loadedResource.metadata, 'name', config.projectName);

    // add a namespace value in the metadata
    addIfNonExistent(loadedResource.metadata, 'namespace', config.context.namespace);

    if (!config.definedProperties) {
      return loadedResource;
    }

    // substitute any parameters with any defined properties that were passed in
    const stringJSON = JSON.stringify(loadedResource);
    /* eslint prefer-template: "off" */
    const reduced = config.definedProperties.reduce((acc, curr) => {
      return acc.split('${' + curr.name + '}').join(curr.value);
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

      // Map the files into an object that has the ext and fileLocation
      // Then filter since we only want the .yml or .yaml or .json files
      const filtered = files.map((file) => {
        // this will split the filename [0] and extension [1]
        const filesSplit = file.split('.');

        // this will split the filename into name [0] and type [1]
        const filenameSplit = filesSplit[0].split('-');
        return {
          ext: filesSplit[1],
          name: filenameSplit[0],
          type: filenameSplit[1],
          filename: file
        };
      }).filter((file) => {
        return file.ext === 'yml' || file.ext === 'yaml' || file.ext === 'json';
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
