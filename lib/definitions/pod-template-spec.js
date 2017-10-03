'use strict';

// https://docs.openshift.com/online/rest_api/openshift_v1.html#v1-podtemplatespec
const podSpec = require('./pod-spec');

module.exports = (resource, config) => {
  if (!resource.spec.template) {
    resource.spec.template = {};
  }

  // Apply MetaData
  resource.spec.template.metadata = {
    labels: {
      app: config.projectName,
      project: config.projectName,
      provider: 'nodeshift',
      version: config.projectVersion
    }
  };

  // Apply PodSpec
  podSpec(resource, config);

  return resource;
};
