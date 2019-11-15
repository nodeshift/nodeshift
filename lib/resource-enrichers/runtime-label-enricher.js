'use strict';

const _ = require('lodash');

async function addRuntimeLabelToResource (config, resourceList) {
  const runtimeLabels = {
    'app.kubernetes.io/name': 'nodejs',
    'app.kubernetes.io/component': config.projectName,
    'app.kubernetes.io/instance': config.projectName,
    'app.openshift.io/runtime': 'nodejs'
  };

  return resourceList.map((resource) => {
    resource.metadata.labels = _.merge({}, resource.metadata.labels, runtimeLabels);
    return resource;
  });
}

module.exports = module.exports = {
  enrich: addRuntimeLabelToResource,
  name: 'runtime-label'
};
