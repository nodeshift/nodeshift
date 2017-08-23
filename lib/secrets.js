'use strict';

// https://docs.openshift.com/online/rest_api/kubernetes_v1.html#v1-service
const _ = require('lodash');
const log = require('./common-log')();
const objectMetadata = require('./definitions/object-metadata');
// const serviceSpec = require('./definitions/service-spec');

const baseSecretConfig = {
  apiVersion: 'v1', // Not Required,
  kind: 'Secret' // Not Required
};

function createSecretConfig (config, resource) {
  // Merge the base Config with the current resource before we apply other things
  const secretConfig = _.merge({}, baseSecretConfig, resource);

  // Apply MetaData
  // Don't overwrite the name here since it isn't the project name
  // Perhaps we generate a new name if a name isn't provided?
  // If we did generate a name, i think we would need to store it somewhere to use it in other areas
  secretConfig.metadata = objectMetadata({
    name: resource.metadata.name,
    namespace: config.context.namespace,
    labels: {
      app: config.projectName,
      version: config.projectVersion
    }
  });

  return secretConfig;
}

module.exports = async function getSecrets (config, resource) {
  // Secret works a little different than the route/service/etc.
  // The name is *not* the project name, but the metadata.name from the resource.
  const secret = await config.openshiftRestClient.secrets.find(resource.metadata.name);
  if (secret.code === 404) {
    // There isn't a secret yet, so we need to create one
    log.info(`creating new secret ${resource.metadata.name}`);
    return config.openshiftRestClient.secrets.create(createSecretConfig(config, resource));
  }

  log.info(`using existing secret ${secret.metadata.name}`);
  return secret;
};
