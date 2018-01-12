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

// This module will be used to output the resources to a file called openshift.yml and/or openshift.json in ./tmp/nodeshift/resource/
// Pass in the config object and the Array of resources, which will be added to a Kind = List item template thing

const {promisify} = require('util');
const fs = require('fs');
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
    await writeFileAsync(`${config.projectLocation}/${DEFAULT_NODESHIFT_RESOURCE_DIR}/openshift.json`, JSON.stringify(list, null, 2), {encoding: 'utf8'});
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
