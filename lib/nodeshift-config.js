'use strict';

// TODO: project location should be configurable

const logger = require('./common-log');
const openshiftConfigLoader = require('openshift-config-loader');
const restClient = require('openshift-rest-client');

/**
  This module will load attempt to load the Openshift configuration using the openshift-config-loader module

  @param {object} [options] -
  @param {string} [options.projectLocation] - the location(directory) of your projects package.json. Defaults to `process.cwd`
  @param {string} [options.nodeshiftDirectory] - the location(directory) of your resource files, defaults to the ".nodeshift" directory in your projects location
  @param {string} [options.configLocation] - the location of the openshift/kube config to be passed to the config loader module. defaults to ~/.kube/config
  @param {object} [options.osc] - Overrides for the Openshift Rest Clients request module
  @returns {Promise} - Returns an Object with the following properties:
      config - the results from the config-loader module
      openshiftRestClient - the Openshift Rest Client
      projectPacakge - the pacakge.json from your project
      projectName - the name of the project, taken from the pacakge.json of your project
      projectVersion - the version the project, taken from the pacakge.json of your project
      projectLocation - the path to your package.json, also used to load your source code, assumes the source code is relative to package.json
      buildName - the name of the build
      Any options you have passed in are added to the config object
*/
async function setup (options = {}) {
  options.nodeshiftDirectory = options.nodeshiftDirectory || '.nodeshift';
  options.projectLocation = options.projectLocation || process.cwd();

  logger.info('loading configuration');
  const projectPackage = require(`${options.projectLocation}/package.json`);
  const config = await openshiftConfigLoader(options.configLocation);
  logger.info(`Using namespace ${config.context.namespace} at ${config.cluster}`);

  // Return a new object with the config, the rest client and other data.
  // TODO: add metadata, label defaults
  return Object.assign({}, config, {
    projectPackage,
    projectName: projectPackage.name,
    projectVersion: projectPackage.version || '0.0.0',
    buildName: `${projectPackage.name}-s2i`,
    openshiftRestClient: await restClient(config, { request: options.osc })
  }, options);
}

module.exports = setup;
