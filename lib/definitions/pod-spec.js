'use strict';

// https://docs.openshift.com/online/rest_api/openshift_v1.html#v1-podspec

const container = require('./container');

module.exports = (resource, config) => {
  if (!resource.spec.template.spec) {
    resource.spec.template.spec = {};
  }

  // Apply Container
  container(resource, config);

  return resource;
};
