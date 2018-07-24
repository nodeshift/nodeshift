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

module.exports = async function getConfigMap (config, configMapResource) {
  // First check to see if we already have a route created
  let configMap = await config.openshiftRestClient.configmaps.find(configMapResource.metadata.name);
  if (configMap.code === 404) {
    // There isn't a configMap yet, so we need to create one
    log.info(`creating new configMap ${configMapResource.metadata.name}`);
    configMap = await config.openshiftRestClient.configmaps.create(configMapResource);
  } else {
    log.info(`using existing configMap ${configMap.metadata.name}`);
  }
  return configMap;
};
