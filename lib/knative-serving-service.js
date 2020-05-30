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

const log = require('./common-log')();
const { awaitRequest } = require('./helpers');

module.exports = async function getKnativeServingServices (config, resource) {
  const knativeService = await awaitRequest(config.openshiftRestClient.apis['serving.knative.dev'].v1.ns(config.namespace.name).service(resource.metadata.name).get());

  // const service = await awaitRequest(config.openshiftRestClient.api.v1.ns(config.namespace.name).service(resource.metadata.name).get());
  if (knativeService.code === 404) {
    // There isn't a service yet, so we need to create one
    log.info(`creating new service ${resource.metadata.name}`);
    console.dir(resource);
    return config.openshiftRestClient.apis['serving.knative.dev'].v1.ns(config.namespace.name).service.post({ body: resource });
  }

  log.info(`using existing service ${knativeService.body.metadata.name}`);
  return knativeService;
};
