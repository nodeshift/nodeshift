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

// https://docs.openshift.com/online/rest_api/openshift_v1.html#v1-deploymentconfig
const logger = require('./common-log')();
const { awaitRequest } = require('./helpers');

async function deploy (config, deploymentConfigResource) {
  // First check to see if we already have a deployment config created
  const deployment = await awaitRequest(config.openshiftRestClient.apis['apps.openshift.io'].v1.ns(config.namespace.name).deploymentconfigs(deploymentConfigResource.metadata.name).get());
  // If no deploymentconfig, create one
  if (deployment.code === 404) {
    logger.info(`creating deployment configuration ${deploymentConfigResource.metadata.name}`);
    return config.openshiftRestClient.apis['apps.openshift.io'].v1.ns(config.namespace.name).deploymentconfigs.post({ body: deploymentConfigResource });
  }

  logger.info(`using existing deployment configuration ${deployment.body.metadata.name}`);
  return deployment;
}

async function undeploy (config, deploymentConfigResource) {
  // First get the deploymentconfig, then patch it so the replicas is 0
  // The maven plugin does this, not sure why though,  i'm just going to delete the DeploymentConfig, and if we need to, we can figure the patch out
  // Some default remove Body Options for the rest client, maybe at some point, these will be exposed to the user
  const removeOptionsDeploymentConfig = {
    body: {
      orphanDependents: true,
      gracePeriodSeconds: undefined
    }
  };
  const response = {
    replicationControllers: []
  };

  // then delete the deploymentconfig
  logger.info(`Deleteing Deployment Config ${deploymentConfigResource.metadata.name}`);
  response.deploymentConfig = await awaitRequest(config.openshiftRestClient.apis['apps.openshift.io'].v1.ns(config.namespace.name).deploymentconfigs(deploymentConfigResource.metadata.name).delete({ body: removeOptionsDeploymentConfig }));
  // Get the list of replication controllers
  const rcList = await config.openshiftRestClient.api.v1.ns(config.namespace.name).replicationcontrollers.get({ qs: { labelSelector: `openshift.io/deployment-config.name=${config.projectName}` } });
  const removeOptionsReplicationControllers = {
    body: {
      orphanDependents: false,
      gracePeriodSeconds: undefined
    }
  };
  // Delete the builds that it finds
  for (const items of rcList.body.items) {
    logger.info(`Deleteing replication controller ${items.metadata.name}`);
    response.replicationControllers.push(
      await awaitRequest(config.openshiftRestClient.api.v1.ns(config.namespace.name).replicationcontrollers(items.metadata.name).delete({ body: removeOptionsReplicationControllers }))
    );
  }
  return response;
}

module.exports = {
  deploy,
  undeploy
};
