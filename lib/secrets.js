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
  secretConfig.metadata = objectMetadata({
    name: config.projectName,
    namespace: config.context.namespace,
    labels: {
      app: config.projectName,
      version: config.projectVersion
    }
  });

  return secretConfig;
}

module.exports = async function getSecrets (config, resource) {
  const secret = await config.openshiftRestClient.secrets.find(config.projectName);
  if (secret.code === 404) {
    // There isn't a secret yet, so we need to create one
    log.info(`creating new secret ${config.projectName}`);
    return config.openshiftRestClient.secrets.create(createSecretConfig(config, resource));
  }

  log.info(`using existing secret ${secret.metadata.name}`);
  return secret;
};
