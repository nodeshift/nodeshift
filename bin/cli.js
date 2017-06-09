'use strict';

const nodeshiftConfig = require('../lib/nodeshift-config');
const dockerArchiver = require('../lib/docker-archiver');
const buildConfigurator = require('../lib/build-config');
const imageStreamConfigurator = require('../lib/image-stream');
const binaryBuild = require('../lib/binary-build');

const resourceLoader = require('../lib/resource-loader');
const applyResources = require('../lib/apply-resources');

const currentDir = process.cwd();

module.exports = function run (options) {
  // Run setup, this loads the config file
  return nodeshiftConfig(options).then(config => {
    // Once we have the config file, we do everything else

    // Create The Docker build archive
    return dockerArchiver.archiveAndTar().then(() => {
      console.log('Archive Created');
    }).then(() => {
      // check for build config, create or update if necesarry
      return buildConfigurator.createOrUpdateBuildConfig(config);
    }).then((buildConfig) => {
      console.log('Build Config Created/Updated');
      // Check for an imagsestream, create or update if necesarry
      return imageStreamConfigurator.createOrUpdateImageStream(config);
    }).then((imageStream) => {
      console.log('Image Stream Created/Updated');
      // Start the build process
      return binaryBuild(config, `${currentDir}/${dockerArchiver.DEFAULT_BUILD_LOCATION}/archive.tar`);
    }).then((buildStatus) => {
      console.log(`Build ${buildStatus.metadata.name} Complete`);
      // Query the image stream, we need to DockerImageRepo
      return imageStreamConfigurator.getDockerImageRepo(config);
    }).then((dockerImageRepo) => {
      // Not sure about this
      config.dockerImageRepo = dockerImageRepo;
      // Load the resources. routes/services/deploymentConfigs
      return resourceLoader(config).then((resources) => {
        return applyResources(config, resources);
      }).then((resourcesApplied) => {
        console.log('Resources Applied');
      });
    });
  }).catch((err) => {
    console.log('Error:', err);
  });
};
