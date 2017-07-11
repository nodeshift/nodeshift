'use strict';

const nodeshiftConfig = require('../lib/nodeshift-config');
const dockerArchiver = require('../lib/docker-archiver');
const buildConfigurator = require('../lib/build-config');
const imageStreamConfigurator = require('../lib/image-stream');
const binaryBuild = require('../lib/binary-build');
const logger = require('../lib/common-log');

const resourceLoader = require('../lib/resource-loader');
const applyResources = require('../lib/apply-resources');

module.exports = async function run (options) {
  try {
    const config = await nodeshiftConfig(options);
    await dockerArchiver.archiveAndTar(config);
    await buildConfigurator.createOrUpdateBuildConfig(config);
    await imageStreamConfigurator.createOrUpdateImageStream(config);
    await binaryBuild(config, `${config.projectLocation}/${dockerArchiver.DEFAULT_BUILD_LOCATION}/archive.tar`);
    // should we do this?
    config.dockerImageRepo = await imageStreamConfigurator.getDockerImageRepo(config);
    await applyResources(config, await resourceLoader(config));
    return 'done';
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
