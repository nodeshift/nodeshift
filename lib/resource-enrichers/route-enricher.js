'use strict';

// https://docs.openshift.com/online/rest_api/openshift_v1.html#v1-route
const _ = require('lodash');

const objectMetadata = require('../definitions/object-metadata');
const routeSpec = require('../definitions/route-spec');

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

module.exports = createRoute;
