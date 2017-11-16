'use strict';

const watchBuildLog = require('./build-watcher');
const logger = require('./common-log')();

function wait (timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}

module.exports = async (config, archiveLocation) => {
  // Upload the .tar file
  logger.info(`uploading binary archive ${archiveLocation}`);
  const response = await config.openshiftRestClient
    .buildconfigs
    .instantiateBinary(config.buildName, { dockerArchive: archiveLocation });
  logger.info('binary upload complete');

  // Trigger watch of build
  const buildLogWatcher = watchBuildLog(config, response.metadata.name);

  logger.info('waiting for build to finish');
  const MAX_RETRIES = 200;
  for (let i = 0; i <= MAX_RETRIES; i++) {
    const timeout = (i + 1) * 200;
    await wait(timeout);

    const buildStatus = await config.openshiftRestClient.builds.find(response.metadata.name);
    if (buildStatus.status.phase === 'Complete') {
      logger.info(`build ${buildStatus.metadata.name} complete`);
      await buildLogWatcher;
      return buildStatus;
    }

    if (buildStatus.status.phase === 'Failed') {
      logger.error('build failed with message:', buildStatus.status.message);
      throw new Error(buildStatus.status.message);
    }
  }
};
