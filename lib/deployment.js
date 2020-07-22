'use strict';

const logger = require('./common-log')();

async function applyDeployment (config, resourceToDeploy) {
  // Check to see if there is a Deployment first
  // If not then create
  // If So then replace

  try {
    const create = await config.openshiftRestClient.apis.apps.v1.namespaces(config.namespace.name).deployments.post({ body: resourceToDeploy });
    logger.trace('Deployment Applied');
    return create;
  } catch (err) {
    if (err.code !== 409) throw err;
    const replace = await config.openshiftRestClient.apis.apps.v1.namespaces(config.namespace.name).deployments(config.projectName).put({ body: resourceToDeploy });
    logger.trace('Deployment Updated');
    return replace;
  }
}

module.exports = {
  applyDeployment
};
