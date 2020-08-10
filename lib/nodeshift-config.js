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
const { OpenshiftClient: openshiftRestClient } = require('openshift-rest-client');
const fs = require('fs');
const { promisify, format } = require('util');
const dbg = require('util').debuglog('dbg-config');
const readFile = promisify(fs.readFile);
const _ = require('lodash');
const { debounce } = require('lodash');

async function setup (options = {}) {
  options.nodeshiftDirectory = '.nodeshift';
  dbg(`default nodeshift directory ${options.nodeshiftDirectory}`);
  options.projectLocation = options.projectLocation || process.cwd();
  dbg(`project location ${options.projectLocation}`);

  if (options.knative) {
    logger.warning('Using the EXPERMINTAL knative flag.');
    dbg('using knative option');
  }

  logger.info('loading configuration');
  const projectPackage = JSON.parse(await readFile(`${options.projectLocation}/package.json`, { encoding: 'utf8' }));
  dbg('package.json file read');
  // If there is a configLocation string, pass it in
  const restClient = await openshiftRestClient({ config: options.configLocation, loadSpecFromCluster: options.knative });
  dbg(`openshift rest client called with config location ${options.configLocation}`);

  // TODO(lholmquist): If knative is flagged, lets check that they have the API we need to use

  const kubeConfig = restClient.kubeconfig;
  dbg(`using openshift rest client kubeconfig ${format(kubeConfig)}`);

  const currentContext = kubeConfig.getCurrentContext();
  dbg(`kubeConfig current context ${currentContext}`);
  const contexts = kubeConfig.getContexts();
  dbg(`kubeConfig contexts ${format(contexts)}`);

  const currentCluster = contexts.find(context => context.name === currentContext);
  const config = {
    namespace: {
      name: currentCluster.namespace
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
  } else {
    delete options.namespace;
  }

  logger.info(`using namespace ${config.namespace.name} at ${kubeConfig.getCurrentCluster().server}`);

  if (!projectPackage.name.match(/^[a-z][0-9a-z-]+[0-9a-z]$/)) {
    throw new Error('"name" in package.json can only consist lower-case letters, numbers, and dashes. It must start with a letter and can\'t end with a -.');
  }

  options.outputImageStreamName = options.outputImageStreamName || projectPackage.name;
  options.outputImageStreamTag = options.outputImageStreamTag || 'latest';

  // TODO: do build strategy here
  // TODO: update buildName based on source or docker strat
  options.build = options.build || {};
  // default to the Source(s2i) build strategy
  // values should be either DOCKER or SOURCE
  options.build.strategy = options.build.strategy || 'Source';
  // Make sure the first letter is upperCase
  options.build.strategy = _.upperFirst(options.build.strategy.toLowerCase());

  // We only support these 2 strategies, so convert to Source if it is an unknown strat.
  if (options.build.strategy !== 'Docker' && options.build.strategy !== 'Source') {
    logger.warning(`An unknow build strategy, ${options.build.strategy}, was specified, using the Source strategy instead`);
    options.build.strategy = 'Source';
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
    buildName: `${projectPackage.name}-s2i`, // TODO(lholmquist):  this should probabl change?
    // Load an instance of the Openshift Rest Client, https://www.npmjs.com/package/openshift-rest-client
    openshiftRestClient: restClient
  }, options);
}

module.exports = setup;
