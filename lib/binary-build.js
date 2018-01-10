/*
 *
 *  Copyright 2016-2017 Red Hat, Inc, and individual contributors.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

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
  let buildLogWatcher;
  setTimeout(() => {
    buildLogWatcher = watchBuildLog(config, response.metadata.name);
  }, 10);

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
