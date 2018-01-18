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

const getRepoInfo = require('git-repo-info');
const _ = require('lodash');

async function addGitInfoToResource (config, resourceList) {
  const gitInfo = getRepoInfo();
  // First check if the branch is null, which means, we are not using git
  if (gitInfo.branch === null) {
    return resourceList;
  }

  return resourceList.map((resource) => {
    if (resource.kind === 'Service' || resource.kind === 'DeploymentConfig' || resource.kind === 'Deployment') {
      const annotations = {
        'nodeshift/git-branch': gitInfo.branch,
        'nodeshift/git-commit': gitInfo.sha
      };

      resource.metadata.annotations = _.merge({}, resource.metadata.annotations, annotations);

      if (resource.kind === 'DeploymentConfig' || resource.kind === 'Deployment') {
        resource.spec.template.metadata.annotations = _.merge({}, resource.spec.template.metadata.annotations, annotations);
      }

      return resource;
    }

    return resource;
  });
}

module.exports = module.exports = {
  enrich: addGitInfoToResource,
  name: 'git-info'
};
