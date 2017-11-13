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
