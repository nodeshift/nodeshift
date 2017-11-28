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

const labels = require('./labels');
// https://docs.openshift.com/online/rest_api/openshift_v1.html#v1-objectmeta

// I don't think anything is actually required here, but lets do a name, namespace and labels
function createMetaData (options = {}) {
  const metadata = {
    name: options.name, // The proejcts name
    namespace: options.namespace // The current namespace from the config, not required and should be picked up anyway, but...
  };

  // Add labels to the metadata
  // Labels here should be project name and version
  if (options.labels) {
    metadata.labels = labels(options.labels);
  }

  return metadata;
}
module.exports = createMetaData;
