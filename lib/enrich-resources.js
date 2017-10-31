'use strict';

const servicesEnricher = require('./resource-enrichers/service-enricher');
const routesEnricher = require('./resource-enrichers/route-enricher');
const deploymentConfigEnricher = require('./resource-enrichers/deployment-config-enricher');
const secretsEnricher = require('./resource-enrichers/secret-enricher');

const log = require('./common-log')();

module.exports = (config, resourceList) => {
  const mappedResources = resourceList.map((r) => {
    log.info(`enriching ${r.kind} resource`);
    switch (r.kind) {
      case 'Service':
        return servicesEnricher(config, r);
      case 'Route':
        return routesEnricher(config, r);
      case 'Deployment':
        return deploymentConfigEnricher(config, r);
      case 'Secret':
        return secretsEnricher(config, r);
      default:
        return r;
    }
  });

  return mappedResources;
};
