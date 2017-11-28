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
