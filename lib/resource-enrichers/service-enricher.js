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
const _ = require('lodash');
const objectMetadata = require('../definitions/object-metadata');

const baseServiceConfig = {
  apiVersion: 'v1', // Not Required,
  kind: 'Service', // Not Required
  spec: {} // Should be populated in the resource coming in
};

// Returns a default service config.
// need to figure out a better way to do those port mappings
function defaultService (config) {
  const serviceConfig = _.merge({}, baseServiceConfig);

  // Apply MetaData
  serviceConfig.metadata = objectMetadata({
    name: config.projectName,
    namespace: config.context.namespace
  });

  serviceConfig.spec.selector = {
    project: config.projectName,
    provider: 'nodeshift'
  };

  // TODO: verify the ports property/add the ports property if missing?
  serviceConfig.spec.ports = [
    {
      protocol: 'TCP',
      port: 8080,
      targetPort: 8080
    }
  ];

  serviceConfig.spec.type = 'ClusterIP';

  return serviceConfig;
}

async function createServiceConfig (config, resourceList) {
  // First check to see if we have a Service
  if (_.filter(resourceList, {'kind': 'Service'}).length < 1) {
    // create the default service and add in to the resource list
    resourceList.push(defaultService(config));
    return resourceList;
  }

  // If there is one, then just do this
  return resourceList.map((resource) => {
    if (resource.kind !== 'Service') {
      return resource;
    }
    // Merge the default Service Config with the current resource
    return _.merge({}, defaultService(config), resource);
  });
}

module.exports = {
  enrich: createServiceConfig,
  name: 'service'
};
