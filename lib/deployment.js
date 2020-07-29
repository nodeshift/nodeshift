'use strict';

const logger = require('./common-log')();
const { awaitRequest } = require('./helpers');

async function applyDeployment (config, deploymentResource) {
  // Check to see if there is a Deployment first
  // If not then create
  // If So then replace

  try {
    const create = await config.openshiftRestClient.apis.apps.v1.namespaces(config.namespace.name).deployments.post({ body: deploymentResource });
    logger.trace('Deployment Applied');
    return create;
  } catch (err) {
    if (err.code !== 409) throw err;
    const replace = await config.openshiftRestClient.apis.apps.v1.namespaces(config.namespace.name).deployments(config.projectName).put({ body: deploymentResource });
    logger.trace('Deployment Updated');
    return replace;
  }
}

async function removeDeployment (config, deploymentResource) {
  const removeOptionsDeployment = {
    body: {
      orphanDependents: true,
      gracePeriodSeconds: undefined
    }
  };

  const response = {
    replicaSets: []
  };

  logger.info(`Deleting Deployment ${deploymentResource.metadata.name}`);
  response.deployment = await awaitRequest(config.openshiftRestClient.apis.apps.v1.ns(config.namespace.name).deployments(deploymentResource.metadata.name).delete({ body: removeOptionsDeployment }));

  // Since this is a Deployment, get the replica sets and delete them
  const rsList = await config.openshiftRestClient.apis.apps.v1.ns(config.namespace.name).replicasets.get({ qs: { labelSelector: `app=${config.projectName}` } });

  const removeOptionsReplicaSets = {
    body: {
      orphanDependents: false,
      gracePeriodSeconds: undefined
    }
  };

  // Delete the replicasets

  for (const items of rsList.body.items) {
    logger.info(`Deleting replica set ${items.metadata.name}`);
    response.replicaSets.push(
      await awaitRequest(config.openshiftRestClient.apis.apps.v1.ns(config.namespace.name).replicasets(items.metadata.name).delete({ body: removeOptionsReplicaSets }))
    );
  }

  return response;
}

module.exports = {
  applyDeployment,
  removeDeployment
};
