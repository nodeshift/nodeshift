'use strict';

const logger = require('./common-log')();

function outputKubeUrl (config, appliedResources) {
  const deployedService = appliedResources.find((v) => { return v.body.kind === 'Service'; });
  const kubeUrl = new URL(config.openshiftRestClient.backend.requestOptions.baseUrl);

  // Output the host:port where the running application is?
  logger.info(`Application running at: http://${kubeUrl.hostname}:${deployedService.body.spec.ports[0].nodePort}`);
}

module.exports = outputKubeUrl;
