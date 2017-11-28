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

const buildSource = require('./build-source');
const buildStrategy = require('./build-strategy');
const buildOutput = require('./build-output');

// https://docs.openshift.com/online/rest_api/openshift_v1.html#v1-buildconfigspec
const baseBuildConfigSpec = {
  triggers: [] // Required, but leaving it an empty array
};

function createBuildConfigSpec (options = {}) {
  const buildConfigSpec = baseBuildConfigSpec;
  buildConfigSpec.source = buildSource('Binary');
  buildConfigSpec.strategy = buildStrategy(options);
  buildConfigSpec.output = buildOutput(options.outputImageStreamTag);
  return buildConfigSpec;
}

module.exports = createBuildConfigSpec;
