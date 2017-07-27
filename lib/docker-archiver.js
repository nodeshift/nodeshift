'use strict';

const mkdirp = require('mkdirp');
const tar = require('tar');
const logger = require('./common-log')();
const helpers = require('./helpers');

// Clean up first,  Probably do this in a different module to be more global
const rimraf = require('rimraf');

const DEFAULT_NODESHFT_DIR = 'tmp/nodeshift';
const DEFAULT_BUILD_LOCATION = `${DEFAULT_NODESHFT_DIR}/build`;

// create a temp/build directory
// tar up the users project with that generated Dockerfile

function createDir (directoryToCreate) {
  return new Promise((resolve, reject) => {
    mkdirp(directoryToCreate, (err) => {
      if (err) {
        return reject(new Error(err));
      }

      return resolve();
    });
  });
}

async function createArchive (config) {
  // tar the workding directories code.
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
    // If Not, then just use the current dirctory "./"
    includedFiles.push('./');
  }
  // TODO: ignore tmp dirs and .git(?) directory, Make configurable to exlcude more directories, Maybe just look at the package.json files prop?
  logger.info(`creating archive of ${includedFiles.join(', ')}`);
  await createDir(`${config.projectLocation}/${DEFAULT_BUILD_LOCATION}`);
  return tar.create({
    file: `${DEFAULT_BUILD_LOCATION}/archive.tar`
  }, includedFiles);
}

function cleanUp (config) {
  return new Promise((resolve, reject) => {
    rimraf(`${config.projectLocation}/${DEFAULT_NODESHFT_DIR}`, (err) => {
      if (err) {
        return reject(new Error(err));
      }
      return resolve();
    });
  });
}

async function archiveAndTar (config) {
  await cleanUp(config);
  return createArchive(config);
}

module.exports = exports = {
  archiveAndTar: archiveAndTar,
  DEFAULT_BUILD_LOCATION: DEFAULT_BUILD_LOCATION
};
