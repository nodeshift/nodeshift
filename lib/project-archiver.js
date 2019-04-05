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

const tar = require('tar');
const logger = require('./common-log')();
const helpers = require('./helpers');

const DEFAULT_NODESHIFT_DIR = 'tmp/nodeshift';
const DEFAULT_BUILD_LOCATION = `${DEFAULT_NODESHIFT_DIR}/build`;

async function createArchive (config) {
  // tar the working directories code.
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
    const fileList = await helpers.listFiles('./');
    // Push those into the includedFiles
    const filteredOut = fileList.filter((file) => {
      // exclude the node_modules and .git directories and tmp
      if (file === 'node_modules' || file === '.git' || file === 'tmp') {
        return false;
      }

      return true;
    });

    includedFiles.push.apply(includedFiles, filteredOut);
  }
  logger.info(`creating archive of ${includedFiles.join(', ')}`);
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

module.exports = exports = {
  archiveAndTar: archiveAndTar,
  DEFAULT_BUILD_LOCATION: DEFAULT_BUILD_LOCATION
};
