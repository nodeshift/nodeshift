'use strict';

// https://docs.openshift.com/online/rest_api/kubernetes_v1.html#v1-service
const _ = require('lodash');
const objectMetadata = require('../definitions/object-metadata');

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

module.exports = createSecretConfig;
