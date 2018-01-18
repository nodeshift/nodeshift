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

// Add labels to the metadata of a resource
async function addLabelsToResource (config, resourceList) {
  return resourceList.map((resource) => {
    const baseLabel = {
      project: config.projectName,
      version: config.projectVersion,
      provider: 'nodeshift'
    };

    resource.metadata.labels = _.merge({}, baseLabel, resource.metadata.labels);

    if (resource.kind === 'Deployment' || resource.kind === 'DeploymentConfig') {
      resource.metadata.labels.app = config.projectName;

      resource.spec.template.metadata.labels = _.merge({}, baseLabel, resource.spec.template.metadata.labels);
      resource.spec.template.metadata.labels.app = config.projectName;
    }

    return resource;
  });
}

module.exports = {
  enrich: addLabelsToResource,
  name: 'labels'
};
