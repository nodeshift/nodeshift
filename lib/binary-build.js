'use strict';

const watchBuildLog = require('./build-watcher');

function wait (timeout) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, timeout)
  })
}

module.exports = async (config, archiveLocation) => {
  // Upload the .tar file
  const response = await config.openshiftRestClient
    .buildconfigs
    .instantiateBinary(config.buildName, { dockerArchive: archiveLocation });

  console.log('Binary upload complete');

  // Trigger watch of build
  await watchBuildLog(config, response.metadata.name);

  console.log('Waiting for build to finish');
  const MAX_RETRIES = 10;
  for (let i = 0; i <= MAX_RETRIES; i++) {
    const timeout = Math.pow(2, i+8)
    console.log('Waiting', timeout, 'ms')
    await wait(timeout)

    const buildStatus = await config.openshiftRestClient.builds.find(response.metadata.name);
    if (buildStatus.status.phase === 'Complete') {
      console.log('Build complete');
      return buildStatus;
    }

    if (buildStatus.status.phase === 'Failed') {
      console.log('Build failed with message:', buildStatus.status.message);
      throw new Error(buildStatus.status.message);
    }
  }
}
