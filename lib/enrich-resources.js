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

const loadEnrichers = require('./load-enrichers');
const defaultEnrichers = require('./resource-enrichers/default-enrichers.json');

module.exports = async (config, resourceList) => {
  // Load a list of enrichers
  const loadedEnrichers = loadEnrichers();

  // Loop through those and then enrich the items from the resourceList
  let enrichedList = resourceList;
  // the defaultEnrichers list will have the correct order
  for (const enricher of defaultEnrichers) {
    const fn = loadedEnrichers[enricher];
    if (typeof fn === 'function') {
      enrichedList = await fn(config, enrichedList);
    }
  }

  return enrichedList;
};
