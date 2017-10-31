'use strict';

// https://docs.openshift.com/online/rest_api/kubernetes_v1.html#v1-service
const log = require('./common-log')();

module.exports = async function getSecrets (config, secretResource) {
  // Secret works a little different than the route/service/etc.
  // The name is *not* the project name, but the metadata.name from the resource.
  const secret = await config.openshiftRestClient.secrets.find(secretResource.metadata.name);
  if (secret.code === 404) {
    // There isn't a secret yet, so we need to create one
    log.info(`creating new secret ${secretResource.metadata.name}`);
    return config.openshiftRestClient.secrets.create(secretResource);
  }

  log.info(`using existing secret ${secret.metadata.name}`);
  return secret;
};
