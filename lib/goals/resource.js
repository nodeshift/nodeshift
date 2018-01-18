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

/**
  This file is responsible for creating and outputting an openshift.yml and openshift.json template file for the resources
  Load the resource fragments from the .nodeshift directory, "enrich" them and anything missing like a service and deploymentConfig.
  Then write all that out.

  returns the JSON version
*/

const resourceLoader = require('../resource-loader');
const enrichResources = require('../enrich-resources');
const writeResources = require('../resource-writer');

module.exports = async function resources (config) {
  // Load Resources.  This looks at the .nodeshift directory and loads those files
  const loadedResources = await resourceLoader(config);
  // "Enrich" them. This should add stuff that needs to be added
  const enrichedResources = await enrichResources(config, loadedResources);

  // Write to file
  await writeResources(config, enrichedResources);

  return enrichedResources;
};
