/*
 *
 *  Copyright 2016-2017 Red Hat, Inc, and individual contributors.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

'use strict';

const request = require('request');
const logger = require('./common-log')();
// https://192.168.99.100:8443/api/v1/namespaces/node-demo-1/pods/wfswarm-rest-http-s2i-5-build/log?pretty=false&follow=true';

function wait (timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}

function podLogEndpoint (config, build) {
  return new Promise((resolve, reject) => {
    const req = {
      url: `${config.openshiftRestClient.kubeUrl}/namespaces/${config.context.namespace}/pods/${build}-build/log`,
      auth: {
        bearer: config.user.token
      },
      strictSSL: config.strictSSL
    };

    request(req, (err, resp, body) => {
      if (err) return reject(err);

      return resolve(resp);
    });
  });
}

async function pingEndpoint (config, build) {
  const MAX_RETRIES = 200;
  for (let i = 0; i <= MAX_RETRIES; i++) {
    const timeout = (i + 1) * 200;
    await wait(timeout);

    const response = await podLogEndpoint(config, build);

    if (response.statusCode === 200) {
      return response;
    }
  }
}

// Probably do this somewhere else eventually
module.exports = async function watchBuildLog (config, build) {
  // Ping until we get a 200 response,
  await pingEndpoint(config, build);
  // Then do the follow endpoint

  return new Promise((resolve, reject) => {
    const req = {
      url: `${config.openshiftRestClient.kubeUrl}/namespaces/${config.context.namespace}/pods/${build}-build/log?pretty=false&follow=true`,
      auth: {
        bearer: config.user.token
      },
      strictSSL: config.strictSSL
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
