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

const nodeshiftConfig = require('../lib/nodeshift-config');
const resourceGoal = require('../lib/goals/resource');
const buildGoal = require('../lib/goals/build');
const applyResources = require('../lib/apply-resources');
const undeployGoal = require('../lib/goals/undeploy');

/**
  This module is where everything is orchestrated.  Both the command line process and the public API call this modules run function

  The options passed in are the options specified on the command line or from the API
*/

module.exports = async function run (options) {
  try {
    const config = await nodeshiftConfig(options);
    const response = {};

    switch (options.cmd) {
      case 'build':
        response.build = await buildGoal(config);
        break;
      case 'resource':
        response.resources = await resourceGoal(config);
        break;
      case 'apply-resource':
        response.resources = await resourceGoal(config);
        response.appliedResources = await applyResources(config, response.resources);
        break;
      case 'undeploy':
        response.undeploy = await undeployGoal(config);
        break;
      case 'deploy':
        response.build = await buildGoal(config);
        response.resources = await resourceGoal(config);
        response.appliedResources = await applyResources(config, response.resources);
        break;
      default:
        throw new TypeError(`Unexpected command: ${options.cmd}`);
    }
    return response;
  } catch (err) {
    return Promise.reject(err);
  }
};
