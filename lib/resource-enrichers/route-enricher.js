'use strict';

// https://docs.openshift.com/online/rest_api/openshift_v1.html#v1-route
const _ = require('lodash');

const routeSpec = require('../definitions/route-spec');

const baseRouteConfig = {
  spec: {}
};

function createRoute (config, resourceList) {
  return resourceList.map((resource) => {
    if (resource.kind !== 'Route') {
      return resource;
    }
    const routeConfig = _.merge({}, baseRouteConfig, resource);

    // apply resource spec
    routeSpec(routeConfig, config);

    return routeConfig;
  });
}

module.exports = createRoute;
