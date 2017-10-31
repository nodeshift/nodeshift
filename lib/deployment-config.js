'use strict';

// https://docs.openshift.com/online/rest_api/openshift_v1.html#v1-deploymentconfig
const log = require('./common-log')();

module.exports = async function getDeploymentConfig (config, deploymentConfigResource) {
  // First check to see if we already have a deployment config created
  const deployment = await config.openshiftRestClient.deploymentconfigs.find(deploymentConfigResource.metadata.name);
  // If no deploymentconfig, create one
  if (deployment.code === 404) {
    log.info(`creating deployment configuration ${deploymentConfigResource.metadata.name}`);
    return config.openshiftRestClient.deploymentconfigs.create(deploymentConfigResource);
  }

  log.info(`using existing deployment configuration ${deployment.metadata.name}`);
  return deployment;
};
