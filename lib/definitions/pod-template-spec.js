'use strict';

// https://docs.openshift.com/online/rest_api/openshift_v1.html#v1-podtemplatespec
const podSpec = require('./pod-spec');

module.exports = (resource, config) => {
  if (!resource.spec.template) {
    resource.spec.template = {};
  }

  // Make sure there is a metadata object started
  if (!resource.spec.template.metadata) {
    resource.spec.template.metadata = {};
  }

  // Apply PodSpec
  podSpec(resource, config);

  return resource;
};
