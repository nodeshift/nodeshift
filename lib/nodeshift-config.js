'use strict';

// TODO: project location should be configurable

const openshiftConfigLoader = require('openshift-config-loader');
const openshiftRestClient = require('openshift-rest-client');

function loadProject (locationToPackageJson) {
  let projectPackage;

  try {
    projectPackage = require(`${locationToPackageJson}/package.json`);
  } catch (err) {
    // If there was an error
    projectPackage = null; // Probably don't need to do that
  }

  return projectPackage;
}

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
function setup (options) {
  options = options || {};
  // Do something with those options
  options.nodeshiftDirectory = options.nodeshiftDirectory || '.nodeshift';
  options.projectLocation = options.projectLocation || process.cwd();

  // Get the package.json for the current project or specify a location
  const projectPackage = loadProject(options.projectLocation);

  // If no package.json found then reject
  if (!projectPackage) {
    return Promise.reject(new Error('No package.json could be found'));
  }

  const projectName = projectPackage.name;
  const projectVersion = projectPackage.version || '0.0.0';

  // Create what the build name will be, assumes s2i
  const buildName = `${projectName}-s2i`;

  // Load the config
  return openshiftConfigLoader(options.configLocation).then(config => {
    // Also need to load the openshft rest client library
    const settings = {
      request: options.osc
    };

    return openshiftRestClient(config, settings).then(osc => {
      // Return a new object with the config, the rest client and other data. TODO: add metadata, label defaults
      return Object.assign({}, config, {projectPackage: projectPackage, projectName: projectName, projectVersion: projectVersion, buildName: buildName, openshiftRestClient: osc}, options);
    });
  });
}

module.exports = setup;
