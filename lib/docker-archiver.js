'use strict';

const fs = require('fs');
const mkdirp = require('mkdirp');
const tar = require('tar');

// Clean up first,  Probably do this in a different module to be more global
const rimraf = require('rimraf');

const projectPackage = require(`${process.cwd()}/package.json`);

const DEFAULT_NODESHFT_DIR = 'tmp/nodeshift';
const DEFAULT_BUILD_LOCATION = `${DEFAULT_NODESHFT_DIR}/build`;
const DEFAULT_DOCKER_BUILD_LOCATION = `${DEFAULT_NODESHFT_DIR}/docker`;

// create a temp/build directory
// Create a base Dockerfile
// tar up the users project with that generated Dockerfile

// TODO: This FROM needs to be configurable
// Since we evetually use the s2i image, do we even need this dockerfile created for us?
const DEFAULT_DOCKERFILE = `FROM bucharestgold/centos7-nodejs:6.9.5
EXPOSE 8080 8778 9779`;

module.exports = exports = {
  createDockerFile: createDockerFile,
  createArchive: createArchive,
  archiveAndTar: archiveAndTar
};

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

function createDockerFile () {
  return createDir(`${process.cwd()}/${DEFAULT_DOCKER_BUILD_LOCATION}`).then(() => {
    fs.writeFile(`${process.cwd()}/${DEFAULT_DOCKER_BUILD_LOCATION}/Dockerfile`, DEFAULT_DOCKERFILE, (err, other) => {
      if (err) {
        return Promise.reject(err);
      }
      return Promise.resolve('File Created'); // do i need the Promise.resolve here or just return?
    });
  });
}

function createArchive () {
  // tar the workding directories code.
  const includedFiles = [`${DEFAULT_DOCKER_BUILD_LOCATION}/Dockerfile`];
  // Look to see if any files are specified in the package.json
  if (projectPackage.files && projectPackage.files.length > 0) {
    // If so, use that list
    includedFiles.push.apply(includedFiles, projectPackage.files);
  } else {
    // If Not, then just use the current dirctory "./"
    includedFiles.push('./');
  }
  // TODO: ignore tmp dirs and .git(?) directory, Make configurable to exlcude more directories, Maybe just look at the package.json files prop?
  return createDir(`${process.cwd()}/${DEFAULT_BUILD_LOCATION}`).then(() => {
    return tar.create({
      file: `${DEFAULT_BUILD_LOCATION}/archive.tar`// ,
    }, includedFiles)
    .then(() => {
      console.log('created');
    });
  });
}

function cleanUp () {
  return new Promise((resolve, reject) => {
    rimraf(`${process.cwd()}/${DEFAULT_NODESHFT_DIR}`, (err) => {
      if (err) {
        return reject(new Error(err));
      }

      console.log('cleaned up');
      return resolve();
    });
  });
}

function archiveAndTar () {
  return cleanUp().then(() => {
    return createDockerFile();
  }).then(() => {
    return createArchive();
  });
}
