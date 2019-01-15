/*
 *
 *  Copyright Red Hat, Inc, and individual contributors.
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

// This is the goal for connecting to a running pod and doing an "oc rsync" when files chnage locally
const logger = require('../common-log')();
const { spawn } = require('child_process');
const { wait } = require('../helpers');

async function waitForPodReady (openshiftRestClient, projectName, count = 0) {
  while (count++ < 100) {
    // Make a call to find the running pod { qs: { labelSelector: `openshift.io/deployment-config.name=${projectName}` } }
    const podList = await openshiftRestClient.pods.findAll({ qs: { labelSelector: `app=${projectName}` } });

    // Choose the correct pod if one is already running and the new one is starting to come up
    // Probably a more scientific way of doing this, but the last element should be the most recent pod
    const podListLength = podList.items.length;

    if (podListLength === 0) {
      throw new Error(`No Pods for project ${projectName} found`);
    }

    const pod = podList.items[podListLength - 1];

    // check that the pod is in a running state as is ready to start watching
    const { metadata: { name: podName }, status } = pod;

    // Only print the message the first time
    if (count === 1) {
      logger.info(`Waiting for Pod: ${podName} to become ready`);
    }

    const readyStatus = status.conditions.find(c => {
      return c.type === 'Ready';
    });

    if (readyStatus.status === 'True') {
      logger.info(`Pod: ${podName} is ready`);
      return podName;
    }

    await wait(count * 40);
  }
  throw new Error(`Pod for project ${projectName} is not available`);
}

module.exports = async function watchSync (config) {
  // Get the project name files to include(if any).
  const { projectName, projectPackage } = config;

  // Check the files property in package.json to see what files to "include" in the rsync
  const includedFiles = (projectPackage.files && projectPackage.files.length) ? projectPackage.files.map((f) => {
    return `--include=${f}`;
  }) : [];

  const podName = await waitForPodReady(config.openshiftRestClient, projectName);

  const syncExcludes = [
    '--exclude=node_modules',
    '--exclude=tmp',
    '--exclude=.git',
    '--exclude=test'
  ];

  // TODO: what does the --no-perms flag do?
  const commandOptions = [
    'rsync',
    '--progress',
    '--watch',
    '--no-perms=true',
    ...syncExcludes,
    ...includedFiles,
    './',
    `${podName}:/opt/app-root/src`
  ];

  // Start the sync and watch
  // Returns a Promise, but the value in the promise is the spawed ChildProcess
  return spawn('oc', commandOptions);
};
