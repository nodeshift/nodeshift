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

const services = require('./services');
const routes = require('./routes');
const deploymentConfig = require('./deployment-config').deploy;
const secrets = require('./secrets');

module.exports = (config, resourceList) => {
  const mappedResources = resourceList.map((r) => {
    switch (r.kind) {
      case 'Service':
        return services(config, r);
      case 'Route':
        return routes(config, r);
      case 'DeploymentConfig':
        return deploymentConfig(config, r);
      case 'Secret':
        return secrets(config, r);
      default:
        return Promise.resolve(r);
    }
  });
  return Promise.all(mappedResources);
};
