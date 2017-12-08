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

// TODO: project location should be configurable

const logger = require('./common-log')();
const openshiftConfigLoader = require('openshift-config-loader');
const restClient = require('openshift-rest-client');

/**
  This module will load attempt to load the Openshift configuration using the openshift-config-loader module

  @param {object} [options] -
  @param {string} [options.projectLocation] - the location(directory) of your projects package.json. Defaults to `process.cwd`
  @param {string} [options.configLocation] - the location of the openshift/kube config to be passed to the config loader module. defaults to ~/.kube/config
  @param {object} [options.osc] - Overrides for the Openshift Rest Clients request module
  @param {object} [options.osl] - Overrides for the Openshift Config Loader
  @returns {Promise} - Returns an Object with the following properties:
      config - the results from the config-loader module
      openshiftRestClient - the Openshift Rest Client
      projectPackage - the package.json from your project
      projectName - the name of the project, taken from the package.json of your project
      projectVersion - the version the project, taken from the package.json of your project
      projectLocation - the path to your package.json, also used to load your source code, assumes the source code is relative to package.json
      buildName - the name of the build
      Any options you have passed in are added to the config object
*/
async function setup (options = {}) {
  options.nodeshiftDirectory = '.nodeshift';
  options.projectLocation = options.projectLocation || process.cwd();

  logger.info('loading configuration');
  const projectPackage = require(`${options.projectLocation}/package.json`);
  const config = await openshiftConfigLoader(Object.assign({}, {tryServiceAccount: options.tryServiceAccount}));
  logger.info(`using namespace ${config.context.namespace} at ${config.cluster}`);

  // Return a new object with the config, the rest client and other data.
  // TODO: add metadata, label defaults
  return Object.assign({}, config, {
    projectPackage,
    projectName: projectPackage.name,
    projectVersion: projectPackage.version || '0.0.0',
    buildName: `${projectPackage.name}-s2i`,
    openshiftRestClient: await restClient(config, {request: {strictSSL: options.strictSSL}})
  }, options);
}

module.exports = setup;
