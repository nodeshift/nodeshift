'use strict';

const openshiftConfigLoader = require('openshift-config-loader');
const openshiftRestClient = require('openshift-rest-client');

const currentDir = process.cwd();

const projectPackage = require(`${currentDir}/package.json`);

// TODO: if no name, then generate one
const projectName = projectPackage.name;

const projectVersion = projectPackage.version || '0.0.0';

// Create what the image name will be,
const buildName = `${projectName}-s2i`;

// Returns a Promise
function setup (options) {
  // Load the config
  return openshiftConfigLoader().then(config => {
    // Also need to load the openshft rest client library
    return openshiftRestClient(config).then(osc => {
      // Return a new object with the config, the rest client and other data. TODO: add metadata, label defaults
      return Object.assign({}, config, {projectName: projectName, projectVersion: projectVersion, buildName: buildName, openshiftRestClient: osc});
    });
  });
}

module.exports = setup;
