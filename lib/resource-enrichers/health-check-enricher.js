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

// Enricher for adding a Health Check, based on the kube-probe module, to the Deployment Config

const _ = require('lodash');

const DEFAULT_PROBE = {
  readinessProbe: {
    httpGet: {
      path: '/api/health/readiness',
      port: 8080,
      scheme: 'HTTP'
    }
  },
  livenessProbe: {
    httpGet: {
      path: '/api/health/liveness',
      port: 8080,
      scheme: 'HTTP'
    },
    initialDelaySeconds: 60,
    periodSeconds: 30
  }
};

async function addHealthCheckInfo (config, resourceList) {
  return resourceList.map((resource) => {
    if (resource.kind === 'DeploymentConfig' || resource.kind === 'Deployment') {
      // readiness probes and liveness probes should be in the spec.template.spec.containers[] section
      // Check that 'kube-probe' has been added to the projects package.json
      if (!config.projectPackage.dependencies['kube-probe']) {
        // If not, then just return the resource
        return resource;
      }
      // If so, then add the stuff
      const currentContainer = resource.spec.template.spec.containers[0];
      const updatedContainer = _.merge({}, DEFAULT_PROBE, currentContainer);
      resource.spec.template.spec.containers[0] = updatedContainer;

      return resource;
    }

    return resource;
  });
}

module.exports = {
  enrich: addHealthCheckInfo,
  name: 'health-check'
};
