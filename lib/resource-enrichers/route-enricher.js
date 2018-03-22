/*
 *
 *  Copyright 2016-2017 Red Hat, Inc, and individual contributors.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

'use strict';

// https://docs.openshift.com/online/rest_api/openshift_v1.html#v1-route
const _ = require('lodash');

const routeSpec = require('../definitions/route-spec');
const objectMetadata = require('../definitions/object-metadata');

const baseRouteConfig = {
  apiVersion: 'v1', // Not Required,
  kind: 'Route', // Not Required
  spec: {}
};

function defaultRoute (config) {
  const routeConfig = _.merge({}, baseRouteConfig);

  // Apply MetaData
  routeConfig.metadata = objectMetadata({
    name: config.projectName
  });

  // apply resource spec
  routeSpec(routeConfig, config);

  return routeConfig;
}

async function createRoute (config, resourceList) {
  // First check to see if we have a Route
  if (_.filter(resourceList, {'kind': 'Route'}).length < 1) {
    // check to see if the user wants to create a default route with the "expose" flag
    if (config.expose) {
      // create the default route and add in to the resource list
      resourceList.push(defaultRoute(config));
      return resourceList;
    }
  }

  return resourceList.map((resource) => {
    if (resource.kind !== 'Route') {
      return resource;
    }

    // Merge the default Route Config with the current resource
    return _.merge({}, defaultRoute(config), resource);
  });
}

module.exports = {
  enrich: createRoute,
  name: 'route'
};
