'use strict';

const _ = require('lodash');

// https://docs.openshift.com/online/rest_api/openshift_v1.html#v1-container

module.exports = (resource, config) => {
  if (!resource.spec.template.spec.containers) {
    resource.spec.template.spec.containers = [];
  }

  const container = {
    image: config.projectName,
    name: config.projectName,
    securityContext: {
      privileged: false
    }
  };

  const ports = [
    {
      containerPort: 8080,
      name: 'http',
      protocol: 'TCP'
    }
  ];

  // Not thrilled with this
  const currentContainer = resource.spec.template.spec.containers[0];

  const updatedContainer = _.merge(currentContainer, container, {ports: ports});

  // Probably don't need this
  resource.spec.template.spec.containers[0] = updatedContainer;

  return resource;
};
