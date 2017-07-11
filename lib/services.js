'use strict';

// https://docs.openshift.com/online/rest_api/kubernetes_v1.html#v1-service
const _ = require('lodash');

const objectMetadata = require('./definitions/object-metadata');
// const serviceSpec = require('./definitions/service-spec');

const baseServiceConfig = {
  apiVersion: 'v1', // Not Required,
  kind: 'Service', // Not Required
  spec: {} // Should be populated in the resource coming in
};

function createServiceConfig (config, resource) {
  // Merge the base Config with the current resource before we apply other things
  const serviceConfig = _.merge({}, baseServiceConfig, resource);

  // Apply MetaData
  serviceConfig.metadata = objectMetadata({
    name: config.projectName,
    namespace: config.context.namespace,
    labels: {
      expose: 'true', // TODO: find out where this comes from
      project: config.projectName,
      version: config.projectVersion
    }
  });

  // Apply spec Selector
  serviceConfig.spec.selector = {
    project: config.projectName,
    provider: 'nodeshift'
  };

  return serviceConfig;
}

module.exports = async function getServices (config, resource) {
  const service = await config.openshiftRestClient.services.find(config.projectName);
  if (service.code === 404) {
    // There isn't a service yet, so we need to create one
    console.log('Creating New Serivce');
    return config.openshiftRestClient.services.create(createServiceConfig(config, resource));
  }

  console.log('Service found, just using it');
  return service;
};
