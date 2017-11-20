'use strict';

const _ = require('lodash');

// Add labels to the metadata of a resource
function addLabelsToResource (config, resourceList) {
  return resourceList.map((resource) => {
    const baseLabel = {
      project: config.projectName,
      version: config.projectVersion,
      provider: 'nodeshift'
    };

    resource.metadata.labels = _.merge({}, baseLabel, resource.metadata.labels);

    if (resource.kind === 'Deployment' || resource.kind === 'DeploymentConfig') {
      resource.metadata.labels.app = config.projectName;

      resource.spec.template.metadata.labels = _.merge({}, baseLabel, resource.spec.template.metadata.labels);
      resource.spec.template.metadata.labels.app = config.projectName;
    }

    return resource;
  });
}

module.exports = addLabelsToResource;
