'use strict';

const nodeshiftConfig = require('../lib/nodeshift-config');
const dockerArchiver = require('../lib/docker-archiver');
const buildConfigurator = require('../lib/build-config');

module.exports = function run (options) {
  // Run setup, this loads the config file
  return nodeshiftConfig().then(config => {
    // Once we have the config file, we do everything else

    // Create The Docker build archive
    // create a temp/build directory
    // Create a base Dockerfile
    // tar up the users project with that generated Dockerfile
    return dockerArchiver.archiveAndTar().then(() => {
      console.log('Archive Created');
    }).then(() => {
      // check for build config, create or update if necesarry
      return buildConfigurator.createOrUpdateBuildConfig(config);
    }).then((buildConfig) => {
      console.log('Build Config Created/Updated');
      // Check for an imagsestream, create or update if necesarry
    });
  }).catch((err) => {
    console.log('Error:', err.message);
  });
};
