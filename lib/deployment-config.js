'use strict';

// https://docs.openshift.com/online/rest_api/openshift_v1.html#v1-deploymentconfig
const logger = require('./common-log')();

async function deploy (config, deploymentConfigResource) {
  // First check to see if we already have a deployment config created
  const deployment = await config.openshiftRestClient.deploymentconfigs.find(deploymentConfigResource.metadata.name);
  // If no deploymentconfig, create one
  if (deployment.code === 404) {
    logger.info(`creating deployment configuration ${deploymentConfigResource.metadata.name}`);
    return config.openshiftRestClient.deploymentconfigs.create(deploymentConfigResource);
  }

  logger.info(`using existing deployment configuration ${deployment.metadata.name}`);
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

  // then delete the deploymentconfig
  logger.info(`Deleteing Deployment Config ${deploymentConfigResource.metadata.name}`);
  await config.openshiftRestClient.deploymentconfigs.remove(deploymentConfigResource.metadata.name, removeOptionsDeploymentConfig);
  // Get the list of replication controllers
  const rcList = await config.openshiftRestClient.replicationcontrollers.findAll({qs: {labelSelector: `openshift.io/deployment-config.name=${config.projectName}`}});

  const removeOptionsReplicationControllers = {
    body: {
      orphanDependents: false,
      gracePeriodSeconds: undefined
    }
  };
  // Delete the builds that it finds
  for (const items of rcList.items) {
    logger.info(`Deleteing replication controller ${items.metadata.name}`);
    await config.openshiftRestClient.replicationcontrollers.remove(items.metadata.name, removeOptionsReplicationControllers);
  }
  // Delete them
  return 'done';
}

module.exports = {
  deploy,
  undeploy
};
