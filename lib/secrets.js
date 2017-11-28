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

// https://docs.openshift.com/online/rest_api/kubernetes_v1.html#v1-service
const log = require('./common-log')();

module.exports = async function getSecrets (config, secretResource) {
  // Secret works a little different than the route/service/etc.
  // The name is *not* the project name, but the metadata.name from the resource.
  const secret = await config.openshiftRestClient.secrets.find(secretResource.metadata.name);
  if (secret.code === 404) {
    // There isn't a secret yet, so we need to create one
    log.info(`creating new secret ${secretResource.metadata.name}`);
    return config.openshiftRestClient.secrets.create(secretResource);
  }

  log.info(`using existing secret ${secret.metadata.name}`);
  return secret;
};
