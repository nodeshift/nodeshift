'use strict';

// https://docs.openshift.com/online/rest_api/kubernetes_v1.html#v1-service
const log = require('./common-log')();

module.exports = async function getServices (config, serviceResource) {
  const service = await config.openshiftRestClient.services.find(serviceResource.metadata.name);
  if (service.code === 404) {
    // There isn't a service yet, so we need to create one
    log.info(`creating new service ${serviceResource.metadata.name}`);
    return config.openshiftRestClient.services.create(serviceResource);
  }

  log.info(`using existing service ${service.metadata.name}`);
  return service;
};
