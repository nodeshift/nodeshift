'use strict';

// https://docs.openshift.com/online/rest_api/openshift_v1.html#v1-deploymentconfigspec

const podTemplateSpec = require('./pod-template-spec');

const REPLICAS = 1;

module.exports = (resource, config) => {
  if (!resource.spec) {
    resource.spec = {};
  }
  // Apply Replica Count
  resource.spec.replicas = REPLICAS;
  // Apply selectors
  resource.spec.selector = {
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
