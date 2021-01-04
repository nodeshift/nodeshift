'use strict';

const logger = require('./common-log')();

function outputKubeUrl (config, appliedResources) {
  const deployedService = appliedResources.find((v) => { return v.body.kind === 'Service'; });

  if (deployedService) {
    const kubeUrl = new URL(config.openshiftRestClient.backend.requestOptions.baseUrl);

    // Output the host:port where the running application is?
    const parsedURL = `http://${kubeUrl.hostname}:${deployedService.body.spec.ports[0].nodePort}`;
    logger.info(`Application running at: ${parsedURL}`);
    return parsedURL;
  }
  logger.warn('No Deployed Service Found');
}

module.exports = outputKubeUrl;
