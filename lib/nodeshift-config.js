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

const logger = require('./common-log')();
const openshiftConfigLoader = require('openshift-config-loader');
const restClient = require('openshift-rest-client');

/**
  This module will attempt to load the Openshift configuration using the openshift-config-loader module. https://www.npmjs.com/package/openshift-config-loader

  The options passed in are the options specified on the command line or from the API
*/
async function setup (options = {}) {
  options.nodeshiftDirectory = '.nodeshift';
  options.projectLocation = options.projectLocation || process.cwd();

  logger.info('loading configuration');
  const projectPackage = require(`${options.projectLocation}/package.json`);
  const config = await openshiftConfigLoader(Object.assign({}, {tryServiceAccount: options.tryServiceAccount, configLocation: options.configLocation}));
  logger.info(`using namespace ${config.context.namespace} at ${config.cluster}`);

  if (!projectPackage.name.match(/^[a-z][0-9a-z-]+[0-9a-z]$/)) {
    throw new Error('"name" in package.json can only consist lower-case letters, numbers, and dashes. It must start with a letter and can\'t end with a -.');
  }

  // Return a new object with the config, the rest client and other data.
  return Object.assign({}, config, {
    projectPackage,
    projectName: projectPackage.name,
    projectVersion: projectPackage.version || '0.0.0',
    // Since we are only doing s2i builds(atm), append the s2i bit to the end
    buildName: `${projectPackage.name}-s2i`,
    // Load an instance of the Openshift Rest Client, https://www.npmjs.com/package/openshift-rest-client
    openshiftRestClient: await restClient({request: {strictSSL: options.strictSSL}, config: config})
  }, options);
}

module.exports = setup;
