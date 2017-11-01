'use strict';

// This file is responsible for creating and outputting an openshift.yml template file for the resources
// Essentially the combination of both the "resource-loader" and  "apply-resources" files

const resourceLoader = require('../resource-loader');
const enrichResources = require('../enrich-resources');
const writeResources = require('../resource-writer');

module.exports = async function resources (config) {
  // Load Resources.  This looks at the .nodeshift directory and loads those files
  const loadedResources = await resourceLoader(config);
  // "Enrich" them. This should add stuff that needs to be added
  const enrichedResources = enrichResources(config, loadedResources);
  // Write to file
  await writeResources(config, enrichedResources);

  return enrichedResources;
};
