'use strict';

const nodeshiftConfig = require('../lib/nodeshift-config');
const dockerArchiver = require('../lib/docker-archiver');
const buildConfigurator = require('../lib/build-config');
const imageStreamConfigurator = require('../lib/image-stream');
const binaryBuild = require('../lib/binary-build');

const resourceLoader = require('../lib/resource-loader');
const applyResources = require('../lib/apply-resources');

module.exports = async function run (options) {
  try {
    const config = await nodeshiftConfig(options);
    await dockerArchiver.archiveAndTar(config);
    const buildConfig = await buildConfigurator.createOrUpdateBuildConfig(config);
    console.log(`build configuration ${buildConfig.metadata.name} created/updated`);
    const imageStream = await imageStreamConfigurator.createOrUpdateImageStream(config);
    console.log(`application image stream ${imageStream.metadata.name} created/updated`);
    await binaryBuild(config, `${config.projectLocation}/${dockerArchiver.DEFAULT_BUILD_LOCATION}/archive.tar`);
    const dockerImageRepo = await imageStreamConfigurator.getDockerImageRepo(config);
    // should we do this?
    config.dockerImageRepo = dockerImageRepo;
    console.log(`docker image repository ${dockerImageRepo}`);
    const resources = await resourceLoader(config);
    await applyResources(config, resources);
    return('done');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
