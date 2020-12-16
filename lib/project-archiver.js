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

const _ = require('lodash');
const tar = require('tar');
const logger = require('./common-log')();
const helpers = require('./helpers');

const DEFAULT_NODESHIFT_DIR = 'tmp/nodeshift';
const DEFAULT_BUILD_LOCATION = `${DEFAULT_NODESHIFT_DIR}/build`;

async function loadFiles (config) {
  const includedFiles = [];
  // Look to see if any files are specified in the package.json
  if (config.projectPackage.files && config.projectPackage.files.length > 0) {
    // Removes all nonexistent files and use that list
    // make sure we send in the projectLocation in case the user isn't in the CWD
    const normalizedFileList = helpers.normalizeFileList(config.projectPackage.files, config.projectLocation);
    if (normalizedFileList.nonexistent.length > 0) {
      logger.warning(`The following files do not exist: ${normalizedFileList.nonexistent}`);
    }
    includedFiles.push.apply(includedFiles, normalizedFileList.existing);
  } else {
    // If Not, then just use the current directory "./"
    logger.warning('a file property was not found in your package.json, archiving the current directory.');
    // Get the list of files and directories
    const fileList = await helpers.listFiles(config.projectLocation);
    // Default file exclusion rules
    const exclusionRules = [
      'node_modules',
      '.git',
      'tmp'
    ];
    // Parse gitignore file if any
    const gitignoreRules = await helpers.parseIgnoreFile(
      `${config.projectLocation}/.gitignore`
    );
    // Parse dockerignore file if any
    const dockerignoreRules = await helpers.parseIgnoreFile(
      `${config.projectLocation}/.dockerignore`
    );
    // Remove duplicate exclusion rules
    exclusionRules.push.apply(
      exclusionRules,
      _.union(gitignoreRules, dockerignoreRules)
    );
    // Push those into the includedFiles
    const filteredOut = fileList.filter((file) => {
      let include = true;
      for (const rule of exclusionRules) {
        if (rule[0] === '!') continue; // Don't check rule negations yet
        if (helpers.matchRule(file, rule)) {
          include = false;
          break;
        }
      }
      if (!include) {
        // Search for rule negation
        const negationRule = exclusionRules.indexOf(`!${file}`);
        if (negationRule !== -1) return true;
      }
      return include;
    });
    includedFiles.push.apply(includedFiles, filteredOut);
  }

  logger.info(`creating archive of ${includedFiles.join(', ')}`);

  return includedFiles;
}

async function createArchive (config) {
  // tar the working directories code.
  const includedFiles = await loadFiles(config);
  await helpers.createDir(`${config.projectLocation}/${DEFAULT_BUILD_LOCATION}`);
  return tar.create({
    cwd: config.projectLocation, // Don't forget to be in the projectLocation
    file: `${config.projectLocation}/${DEFAULT_BUILD_LOCATION}/archive.tar`
  }, includedFiles);
}

async function archiveAndTar (config) {
  await helpers.cleanUp(`${config.projectLocation}/${DEFAULT_BUILD_LOCATION}`);
  return createArchive(config);
}

async function createContainer (config) {
  // Create a container image with the docker client
  const includedFiles = await loadFiles(config);

  return new Promise((resolve, reject) => {
    let imageId;

    logger.info('Building Docker Image');
    config.dockerClient.buildImage({
      context: process.cwd(),
      src: includedFiles
    }, {
      t: `${config.projectName}`, // probably make this the package name and something for the version other than latest?
      q: false // true supresses verbose output
    }, function (error, stream) {
      if (error) return reject(error);

      stream.on('data', function (chunk) {
        const chunkAsString = chunk.toString('utf8').trim();
        logger.trace(chunkAsString);
        // Find the output that has the image id sha
        if (chunkAsString.includes('sha')) {
          // Parse that into JSON
          const parsedChunk = JSON.parse(chunkAsString);
          // Depending on if we have verbose output on or off, the location of the sha is differnt
          // traverse the entries to find where the sha is,  then split on : and take the last value

          imageId = findShaID(parsedChunk);
        }
      });

      stream.on('end', function () {
        return resolve(imageId);
      });
    });
  });
}

function findShaID (value) {
  for (const [, entry] of Object.entries(value)) {
    if (entry.includes && entry.includes('sha')) {
      // split on :
      const splity = entry.split(':');
      return splity[splity.length - 1].trim();
    } else {
      return findShaID(entry);
    }
  }
}

module.exports = exports = {
  archiveAndTar: archiveAndTar,
  createContainer: createContainer,
  DEFAULT_BUILD_LOCATION: DEFAULT_BUILD_LOCATION
};
