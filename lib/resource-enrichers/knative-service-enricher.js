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

const _ = require('lodash');
const objectMetadata = require('../definitions/object-metadata');

const baseServiceConfig = {
  apiVersion: 'serving.knative.dev/v1',
  kind: 'Service',
  spec: {} // Should be populated in the resource coming in
};

// Returns a default knative serving service.
function defaultService (config) {
  const serviceConfig = _.merge({}, baseServiceConfig);

  // Apply MetaData
  serviceConfig.metadata = objectMetadata({
    name: config.projectName,
    namespace: config.namespace.name
  });

  // TODO(lholmquist): Should this also take into account docker images that are not in the openshift registry
  serviceConfig.spec.template = {
    spec: {
      containers: [
        {
          image: `image-registry.openshift-image-registry.svc:5000/${config.namespace.name}/${config.projectName}`
        }
      ]
    }
  };

  return serviceConfig;
}

async function createKnativeServingService (config, resourceList) {
  // First check to see if we have a Service
  if (_.filter(resourceList, { kind: 'Service' }).length < 1) {
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
  enrich: createKnativeServingService,
  name: 'knative-serving-service'
};

// apiVersion: serving.knative.dev/v1alpha1
// kind: Service
// metadata:
//   name: helloworld-nodejs
//   namespace: fun-times
// spec:
//   template:
//     spec:
//       containers:
//         - image: image-registry.openshift-image-registry.svc:5000/fun-times/nodejs-rest-http
