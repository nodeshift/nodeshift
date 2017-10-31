'use strict';

// This module will be used to output the resources to a file called openshift.yml and/or openshift.json
// Pass in the config object and the Array of resources, which will be added to a Kind = List item template thing

const {promisify} = require('util');
const fs = require('fs');
const jsonfile = require('jsonfile');
const jsonfileAsync = promisify(jsonfile.writeFile);
const writeFileAsync = promisify(fs.writeFile);
const jsyaml = require('js-yaml');
const helpers = require('./helpers');

const logger = require('./common-log')();

const DEFAULT_NODESHIFT_DIR = 'tmp/nodeshift';
const DEFAULT_NODESHIFT_RESOURCE_DIR = `${DEFAULT_NODESHIFT_DIR}/resource`;

async function writeResource (config, resources) {
  const list = {
    apiVersion: 'v1',
    kind: 'List',
    items: resources
  };

  try {
    // Create the directory
    await helpers.createDir(`${config.projectLocation}/${DEFAULT_NODESHIFT_RESOURCE_DIR}`);
    // Now write the json to a file
    await jsonfileAsync(`${config.projectLocation}/${DEFAULT_NODESHIFT_RESOURCE_DIR}/openshift.json`, list, {encoding: 'utf8', spaces: 2});
    // Then write the yaml to a file
    await writeFileAsync(`${config.projectLocation}/${DEFAULT_NODESHIFT_RESOURCE_DIR}/openshift.yaml`, jsyaml.safeDump(list, {skipInvalid: true}), {encoding: 'utf8'});

    logger.info(`openshift.yaml and openshift.json written to ${config.projectLocation}/${DEFAULT_NODESHIFT_RESOURCE_DIR}/`);
  } catch (err) {
    logger.error(`error writing files: ${err}`);
    return Promise.reject(err);
  }

  return list;
}

module.exports = writeResource;
