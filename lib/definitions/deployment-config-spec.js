'use strict';

// https://docs.openshift.com/online/rest_api/openshift_v1.html#v1-deploymentconfigspec

const podTemplateSpec = require('./pod-template-spec');

const REPLICAS = 1;
const REVISION_HISTORY_LIMIT = 2;

module.exports = (resource, config) => {
  if (!resource.spec) {
    resource.spec = {};
  }
  // Apply Replica Count
  resource.spec.replicas = REPLICAS;

  // apply revision history limit, defaulting to 2, which will keep 3
  resource.spec.revisionHistoryLimit = REVISION_HISTORY_LIMIT;

  // Apply selectors
  resource.spec.selector = {
    app: config.projectName,
    project: config.projectName,
    provider: 'nodeshift'
  };

  // Apply Triggers
  resource.spec.triggers = [
    { type: 'ConfigChange' },
    {
      type: 'ImageChange',
      imageChangeParams: {
        automatic: true,
        containerNames: [config.projectName],
        from: {
          kind: 'ImageStreamTag',
          namespace: config.namespace,
          name: `${config.projectName}:latest`
        }
      }
    }
  ];

  // Apply Pod Template Spec
  podTemplateSpec(resource, config);

  return resource;
};
