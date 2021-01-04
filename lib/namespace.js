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

const logger = require('./common-log')();
const { awaitRequest } = require('./helpers');

async function create (config) {
  if (config.kube) {
    logger.warn('This feature is not available using the --kube flag');
    return;
  }
  // Check that the namespace exists first
  // There is actually a permission error trying to find just 1 project/namespace, so we need to get all and filter
  // If you were an admin user, this might not be a probably, but....
  const projects = await awaitRequest(config.openshiftRestClient.apis.project.v1.projects.get());
  const project = projects.body.items.find((item) => {
    return item.metadata.name === config.namespace.name;
  });

  const projectRequest = {
    displayName: config.namespace.displayName,
    metadata: {
      name: config.namespace.name
    }
  };

  if (!project) {
    // None found, so we are going to create it
    logger.info(`Creating new project namespace: ${config.namespace.name}`);
    // config.openshiftRestClient.apis.project.v1.projects
    return config.openshiftRestClient.apis.project.v1.projectrequests.post({ body: projectRequest });
  } else {
    if (project.status.phase === 'Terminating') {
      /* The project exists,  but it is currently terminating.
      Throwing an error here.  Even if we loop and wait until the project no longer exists, there is still a variable window
      of time that the find API will return no results, but the cluster still thinks the project is there.
      The recommended approach here, would be for the user to set a timeout, instead of having that in this code
      */
      throw new Error(`Project namespace: ${config.namespace.name} is still Terminating`);
    } else {
      logger.warning(`Project namespace: ${config.namespace.name} already exists, using it`);
      return project;
    }
  }
}

async function remove (config) {
  logger.info(`Removing project namespace: ${config.namespace.name}`);
  return awaitRequest(config.openshiftRestClient.apis.project.v1.projects(config.namespace.name).delete());
}

module.exports = {
  create,
  remove
};
