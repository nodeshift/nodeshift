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

const logger = require('./common-log')();
const { OpenshiftClient: restClient, config: k8sConfig } = require('openshift-rest-client');
const fs = require('fs');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);

async function setup (options = {}) {
  options.nodeshiftDirectory = '.nodeshift';
  options.projectLocation = options.projectLocation || process.cwd();

  logger.info('loading configuration');
  const projectPackage = JSON.parse(await readFile(`${options.projectLocation}/package.json`, { encoding: 'utf8' }));
  // const config = await openshiftConfigLoader(Object.assign({}, { tryServiceAccount: options.tryServiceAccount, configLocation: options.configLocation }));
  // TODO: pass in different configs like in the openshift-rest-client
  const kubeConfig = k8sConfig.fromKubeconfig(options.config);
  const config = {
    namespace: {
      name: kubeConfig.namespace
    }
  };

  if (options.namespace) {
    if (!options.namespace.name) {
      throw new Error('namespace.name must be specified when using the --namespace flag');
    }

    // Add this userDefined property that will be used during undeploy
    options.namespace.userDefined = true;
    // Need to remove any spaces and convert to lowe case
    options.namespace.name = options.namespace.name.replace(/\s+/g, '').toLowerCase();
    // A user is overriding the namespace
    config.namespace.name = options.namespace.name;
  }

  logger.info(`using namespace ${config.namespace.name} at ${config.url}`);

  if (!projectPackage.name.match(/^[a-z][0-9a-z-]+[0-9a-z]$/)) {
    throw new Error('"name" in package.json can only consist lower-case letters, numbers, and dashes. It must start with a letter and can\'t end with a -.');
  }

  // Return a new object with the config, the rest client and other data.
  return Object.assign({}, config, {
    projectPackage,
    // We don't want to hard code the port later, so add it here for later use in the application descriptors
    // Make sure it is a number
    port: options.deploy && options.deploy.port ? parseInt(options.deploy.port, 10) : 8080,
    projectName: projectPackage.name,
    projectVersion: projectPackage.version || '0.0.0',
    // Since we are only doing s2i builds(atm), append the s2i bit to the end
    buildName: `${projectPackage.name}-s2i`,
    // Load an instance of the Openshift Rest Client, https://www.npmjs.com/package/openshift-rest-client
    openshiftRestClient: await restClient({ config: kubeConfig })
  }, options);
}

module.exports = setup;
