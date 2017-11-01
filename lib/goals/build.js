'use strict';

// This file is responsible for creation of the archive of the application code
// creating the BuildConfig, Imagestream and then pushing that all up

const dockerArchiver = require('../docker-archiver');
const buildConfigurator = require('../build-config');
const imageStreamConfigurator = require('../image-stream');
const binaryBuild = require('../binary-build');

module.exports = async function build (config) {
  // arvhice the application source
  await dockerArchiver.archiveAndTar(config);

  // create or update the build config
  await buildConfigurator.createOrUpdateBuildConfig(config);

  // create or update the imagestream
  await imageStreamConfigurator.createOrUpdateImageStream(config);

  // push to the cluster
  await binaryBuild(config, `${config.projectLocation}/${dockerArchiver.DEFAULT_BUILD_LOCATION}/archive.tar`);

  // TODO: provide something better?
  return 'build complete';
};
