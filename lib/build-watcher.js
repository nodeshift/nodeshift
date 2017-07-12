'use strict';

const request = require('request');
const logger = require('./common-log')();
// https://192.168.99.100:8443/api/v1/namespaces/node-demo-1/pods/wfswarm-rest-http-s2i-5-build/log?pretty=false&follow=true';

// Probably do this somewhere else eventually
module.exports = function watchBuildLog (config, build) {
  return new Promise((resolve, reject) => {
    const osc = config.osc || {};
    const req = {
      url: `${config.openshiftRestClient.kubeUrl}/namespaces/${config.context.namespace}/pods/${build}-build/log?pretty=false&follow=true`,
      auth: {
        bearer: config.user.token
      },
      strictSSL: osc.strictSSL
    };

    request.get(req).on('data', (chunk) => {
      logger.trace(chunk.toString('utf8').trim());
    }).on('end', () => {
      return resolve();
    }).on('error', (err) => {
      return reject(err);
    });
  });
};
