'use strict';

// https://docs.openshift.com/online/rest_api/openshift_v1.html#v1-route
const _ = require('lodash');
const log = require('./common-log')();

const objectMetadata = require('./definitions/object-metadata');
const routeSpec = require('./definitions/route-spec');

const baseRouteConfig = {
  apiVersion: 'v1',
  kind: 'Route',
  spec: {}
};

function createRoute (config, resource) {
  const routeConfig = _.merge({}, baseRouteConfig, resource);

  // Apply MetaData
  routeConfig.metadata = objectMetadata({
    name: config.projectName,
    labels: {
      project: config.projectName,
      version: config.projectVersion
    }
  });

  // apply resource spec
  routeSpec(routeConfig, config);

  return routeConfig;
}

module.exports = async function getRoutes (config, resource) {
  // First check to see if we already have a route created
  let route = await config.openshiftRestClient.routes.find(config.projectName);
  if (route.code === 404) {
    // There isn't a route yet, so we need to create one
    log.info(`creating new route ${config.projectName}`);
    route = await config.openshiftRestClient.routes.create(createRoute(config, resource));
  } else {
    log.info(`using existing route ${route.metadata.name}`);
  }

  log.info(`route host mapping ${route.spec.host}`);
  return route;
};
