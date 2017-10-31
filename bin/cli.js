'use strict';

const nodeshiftConfig = require('../lib/nodeshift-config');
const dockerArchiver = require('../lib/docker-archiver');
const buildConfigurator = require('../lib/build-config');
const imageStreamConfigurator = require('../lib/image-stream');
const binaryBuild = require('../lib/binary-build');

const resourceLoader = require('../lib/resource-loader');
const enrichResources = require('../lib/enrich-resources');
const applyResources = require('../lib/apply-resources');
const writeResources = require('../lib/resource-writer');

module.exports = async function run (options) {
  try {
    const config = await nodeshiftConfig(options);
    // Load Resources.  This looks at the .nodeshift directory and loads those files
    const loadedResources = await resourceLoader(config);
    // "Enrich" them. This should add stuff that needs to be added
    const enrichedResources = enrichResources(config, loadedResources);
    // Write to file
    await writeResources(config, enrichedResources);

    await dockerArchiver.archiveAndTar(config);
    await buildConfigurator.createOrUpdateBuildConfig(config);
    await imageStreamConfigurator.createOrUpdateImageStream(config);
    await binaryBuild(config, `${config.projectLocation}/${dockerArchiver.DEFAULT_BUILD_LOCATION}/archive.tar`);
    // should we do this?
    config.dockerImageRepo = await imageStreamConfigurator.getDockerImageRepo(config);
    await applyResources(config, enrichedResources);
    return 'done';
  } catch (err) {
    require('../lib/common-log')().error(err, err.stack);
    process.exit(1);
  }
};
