'use strict';

const servicesEnricher = require('./resource-enrichers/service-enricher');
const routesEnricher = require('./resource-enrichers/route-enricher');
const deploymentConfigEnricher = require('./resource-enrichers/deployment-config-enricher');
const labelEnricher = require('./resource-enrichers/labels-enricher');

module.exports = (config, resourceList) => {
  // Load a list of enrichers - TODO: do this dynamically?, but needs to be done in a specific order
  const enricherList = [deploymentConfigEnricher, servicesEnricher, routesEnricher, labelEnricher];

  // Loop through those and then enrich the items from the resourceList
  let enrichedList = resourceList;
  for (const enricher of enricherList) {
    enrichedList = enricher(config, enrichedList);
  }

  return enrichedList;
};
