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
