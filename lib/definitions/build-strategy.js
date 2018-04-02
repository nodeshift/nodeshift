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

const logger = require('../common-log')();

// Perhaps we should define this in another location
const DEFAULT_DOCKER_IMAGE = 'bucharestgold/centos7-s2i-nodejs';
const DEFAULT_DOCKER_TAG = 'latest';

// https://docs.openshift.com/online/rest_api/openshift_v1.html#v1-buildstrategy
module.exports = (options = {}) => {
  // Just doing the source strategy
  const dockerImage = options.dockerImage ? options.dockerImage : DEFAULT_DOCKER_IMAGE;
  const dockerTag = options.nodeVersion ? options.nodeVersion : DEFAULT_DOCKER_TAG;
  logger.info(`Using s2i image ${dockerImage} with tag ${dockerTag}`);
  const dockerImageName = `${dockerImage}:${dockerTag}`;
  const env = options.buildEnv || [];
  return {
    type: 'Source',
    sourceStrategy: {
      env: env,
      from: {
        kind: 'DockerImage',
        name: dockerImageName
      },
      forcePull: options.forcePull
    }
  };
};
