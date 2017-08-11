'use strict';

const services = require('./services');
const routes = require('./routes');
const deploymentConfig = require('./deployment-config');
const secrets = require('./secrets');

module.exports = (config, resourceList) => {
  const mappedResources = resourceList.map((r) => {
    switch (r.kind) {
      case 'Service':
        return services(config, r);
      case 'Route':
        return routes(config, r);
      case 'Deployment':
        return deploymentConfig(config, r);
      case 'Secret':
        return secrets(config, r);
      default:
        return Promise.resolve(r);
    }
  });

  return Promise.all(mappedResources);
};
