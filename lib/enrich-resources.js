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

const servicesEnricher = require('./resource-enrichers/service-enricher');
const routesEnricher = require('./resource-enrichers/route-enricher');
const deploymentConfigEnricher = require('./resource-enrichers/deployment-config-enricher');
const labelEnricher = require('./resource-enrichers/labels-enricher');
const gitInfoEnricher = require('./resource-enrichers/git-info-enricher');
const healthCheckEnricher = require('./resource-enrichers/health-check-enricher');

module.exports = (config, resourceList) => {
  // Load a list of enrichers - TODO: do this dynamically?, but needs to be done in a specific order
  const enricherList = [deploymentConfigEnricher, servicesEnricher, routesEnricher, labelEnricher, gitInfoEnricher, healthCheckEnricher];

  // Loop through those and then enrich the items from the resourceList
  let enrichedList = resourceList;
  for (const enricher of enricherList) {
    enrichedList = enricher(config, enrichedList);
  }

  return enrichedList;
};
