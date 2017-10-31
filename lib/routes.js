'use strict';

// https://docs.openshift.com/online/rest_api/openshift_v1.html#v1-route
const log = require('./common-log')();

module.exports = async function getRoutes (config, routeResource) {
  // First check to see if we already have a route created
  let route = await config.openshiftRestClient.routes.find(routeResource.metadata.name);
  if (route.code === 404) {
    // There isn't a route yet, so we need to create one
    log.info(`creating new route ${routeResource.metadata.name}`);
    route = await config.openshiftRestClient.routes.create(routeResource);
  } else {
    log.info(`using existing route ${route.metadata.name}`);
  }

  log.info(`route host mapping ${route.spec.host}`);
  return route;
};
