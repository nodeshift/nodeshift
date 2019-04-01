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

// https://docs.openshift.com/online/rest_api/openshift_v1.html#v1-deploymentconfigspec

const podTemplateSpec = require('./pod-template-spec');

const REPLICAS = 1;
const REVISION_HISTORY_LIMIT = 2;

module.exports = (resource, config) => {
  if (!resource.spec) {
    resource.spec = {};
  }
  // Apply Replica Count
  resource.spec.replicas = REPLICAS;

  // apply revision history limit, defaulting to 2, which will keep 3
  resource.spec.revisionHistoryLimit = REVISION_HISTORY_LIMIT;

  // Apply selectors
  resource.spec.selector = {
    app: config.projectName,
    project: config.projectName,
    provider: 'nodeshift'
  };

  // Apply Triggers
  resource.spec.triggers = [
    { type: 'ConfigChange' },
    {
      type: 'ImageChange',
      imageChangeParams: {
        automatic: true,
        containerNames: [config.projectName],
        from: {
          kind: 'ImageStreamTag',
          namespace: config.namespace,
          name: `${config.projectName}:latest`
        }
      }
    }
  ];

  // Apply Pod Template Spec
  podTemplateSpec(resource, config);

  return resource;
};
