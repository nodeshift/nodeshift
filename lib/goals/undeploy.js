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

// this module will be responsible for undeploying the things that are deployed.
// We determine this by looking at the openshift.yaml/openshift.json file that was created during the resource goal
// If that file doesn't exist, then we just warn and exit

// For deployments, we need to delete the replication controllers first, then the deploymentconfig

// If we find an image stream in the list, i think we also need to delete the s2i buildconfig.

const {promisify} = require('util');
const jsonfile = require('jsonfile');
const jsonfileAsync = promisify(jsonfile.readFile);
const logger = require('../common-log')();

const deploymentConfig = require('../deployment-config').undeploy;

const DEFAULT_NODESHIFT_DIR = 'tmp/nodeshift';
const DEFAULT_NODESHIFT_RESOURCE_DIR = `${DEFAULT_NODESHIFT_DIR}/resource`;

module.exports = async function (config) {
  // Find the openshift.json file from project_location/tmp/nodeshift/resource/
  const resourceList = await jsonfileAsync(`${config.projectLocation}/${DEFAULT_NODESHIFT_RESOURCE_DIR}/openshift.json`);
  logger.info('openshift.json file found, now going to delete the items');

  const removeOptions = {
    body: {
      orphanDependents: false,
      gracePeriodSeconds: undefined
    }
  };
  // Iterate through the list of items and delete the items
  for (const item of resourceList.items || []) {
    switch (item.kind) {
      case 'Route':
        logger.info(`removing ${item.kind} ${item.metadata.name}`);
        await config.openshiftRestClient.routes.remove(item.metadata.name, removeOptions);
        break;
      case 'Service':
        logger.info(`removing ${item.kind} ${item.metadata.name}`);
        await config.openshiftRestClient.services.remove(item.metadata.name, removeOptions);
        break;
      case 'DeploymentConfig':
        await deploymentConfig(config, item);
        break;
      case 'Secret':
        logger.info(`removing ${item.kind} ${item.metadata.name}`);
        await config.openshiftRestClient.secrets.remove(item.metadata.name, removeOptions);
        break;
      default:
        logger.warning(`${item.kind} is not recognized`);
    }
  }
  return resourceList;
};
