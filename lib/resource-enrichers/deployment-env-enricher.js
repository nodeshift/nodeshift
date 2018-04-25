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

async function addDeploymentEnvVars (config, resourceList) {
  return resourceList.map((resource) => {
    if (resource.kind === 'DeploymentConfig') {
      // Set an environment variable for the port
      // Can be set with the --deploy.port flag
      const portEnv = {
        name: 'PORT',
        value: `${config.port}`
      };
      // Check for the env array in the spec.template.spec.containers array of the deployment config
      // If there is one, we need to see if it already has a PORT value
      // If there is a PORT value, use that, if not, use the one we are going to create
      const env = resource.spec.template.spec.containers[0].env;
      if (!env) {
        // If there isn't one,  create it and add the PORT env variable
        resource.spec.template.spec.containers[0].env = [portEnv];
        return resource;
      }
      resource.spec.template.spec.containers[0].env = _.unionBy(resource.spec.template.spec.containers[0].env, [portEnv], 'name');
      return resource;
    }
    return resource;
  });
}

module.exports = {
  enrich: addDeploymentEnvVars,
  name: 'deployment-env'
};
