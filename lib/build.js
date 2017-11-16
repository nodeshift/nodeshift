'use strict';

const logger = require('./common-log')();
// Responsible for "Part 1" of the deployment process
// This includes:
// Create archive of source and Generated Dockerfile
// Creating/updating buildConfigs
// Creating/Updating image streams
// Starting a build
// Watching/Waiting for a build to complete
// Save Image stream to file? maybe, the maven plugin does something interesting here

// Will return a promise when everything is done.

const dockerArchiver = require('../lib/docker-archiver');

// Pass in our config object
// Pass in the openshiftRestClient client
function build (config, openshiftRestClient) {
  // Create The Docker build archive
  // create a temp/build directory
  // Create a base Dockerfile
  // tar up the users project with that generated Dockerfile
  return dockerArchiver.archiveAndTar().then(() => {
    logger.info('Archive Created');
  }).then(() => {
    // check for build config, create or update if necessary
  });
}

module.exports = build;
