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
const { wait } = require('./helpers');
const fs = require('fs');

module.exports = async (config, archiveLocation) => {
  // Upload the .tar file
  logger.info(`uploading binary archive ${archiveLocation}`);
  // const response = await dorequest(config, archiveLocation);
  const binaryResponse = await config.openshiftRestClient.apis.build.v1.ns(config.context.namespace).buildconfigs(config.buildName).instantiatebinary.post({ body: fs.createReadStream(archiveLocation), json: false });
  const response = JSON.parse(binaryResponse.body);
  // const response = await config.openshiftRestClient
  //   .buildconfigs
  //   .instantiateBinary(config.buildName, { dockerArchive: archiveLocation });
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

    const buildStatus = await config.openshiftRestClient.apis.build.v1.ns(config.context.namespace).builds(response.metadata.name).get();
    if (buildStatus.body.status.phase === 'Complete') {
      logger.info(`build ${buildStatus.body.metadata.name} complete`);
      await buildLogWatcher;
      return buildStatus;
    }

    if (buildStatus.body.status.phase === 'Failed') {
      logger.error('build failed with message:', buildStatus.body.status.message);
      throw new Error(buildStatus.body.status.message);
    }
  }
};
