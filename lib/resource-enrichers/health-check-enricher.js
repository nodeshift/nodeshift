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
const logger = require('../common-log')();

const DEFAULT_PROBE = {
  readinessProbe: {
    httpGet: {
      path: '/api/health/readiness',
      scheme: 'HTTP'
    }
  },
  livenessProbe: {
    httpGet: {
      path: '/api/health/liveness',
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
      if (!config.projectPackage.dependencies) {
        return resource;
      }

      if (!config.projectPackage.dependencies['kube-probe']) {
        // If not, then just return the resource
        return resource;
      }

      // DEPRECATE THIS ENRICHER
      // The kube-probe module is being deprecated, so this should also be deprecated then removed
      logger.warning('The Health Check enricher is Deprecated and will be removed in the next major version');

      // If so, then add the stuff
      const updatedDefault = _.merge(
        {},
        DEFAULT_PROBE,
        {
          readinessProbe: {
            httpGet: {
              port: config.port
            }
          },
          livenessProbe: {
            httpGet: {
              port: config.port
            }
          }
        }
      );
      const currentContainer = resource.spec.template.spec.containers[0];
      const updatedContainer = _.merge({}, updatedDefault, currentContainer);
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
