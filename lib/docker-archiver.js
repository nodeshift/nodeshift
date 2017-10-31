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
    const normalizedFileList = helpers.normalizeFileList(config.projectPackage.files);
    if (normalizedFileList.nonexistent.length > 0) {
      logger.warning(`The following files do not exist: ${normalizedFileList.nonexistent}`);
    }
    includedFiles.push.apply(includedFiles, normalizedFileList.existing);
  } else {
    // If Not, then just use the current directory "./"
    logger.warning('a file property was not found in your package.json, archiving the current directory.');
    includedFiles.push('./');
  }
  // TODO: ignore tmp dirs and .git(?) directory, Make configurable to exclude more directories, Maybe just look at the package.json files prop?
  logger.info(`creating archive of ${includedFiles.join(', ')}`);
  await helpers.createDir(`${config.projectLocation}/${DEFAULT_BUILD_LOCATION}`);
  return tar.create({
    file: `${DEFAULT_BUILD_LOCATION}/archive.tar`
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
