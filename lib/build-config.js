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

const objectMetadata = require('./definitions/object-metadata');
const buildConfigSpec = require('./definitions/build-config-spec');
const buildConfigStatus = require('./definitions/build-config-status');
const logger = require('./common-log')();
const { awaitRequest } = require('./helpers');

const baseBuildConfig = {
  kind: 'BuildConfig',
  apiVersion: 'build.openshift.io/v1'
};

function createBuildConfig (config, options) {
  const buildConfig = Object.assign({}, baseBuildConfig);

  // Add new metadata
  buildConfig.metadata = objectMetadata({
    name: config.buildName,
    namespace: config.namespace.name,
    labels: {
      project: config.projectName,
      version: config.projectVersion,
      'app.kubernetes.io/name': 'nodejs',
      'app.kubernetes.io/component': config.projectName,
      'app.kubernetes.io/instance': config.projectName,
      'app.openshift.io/runtime': 'nodejs'
    }
  });

  // add new build spec stuff
  buildConfig.spec = buildConfigSpec(options);

  // add new build status stuff
  buildConfig.status = buildConfigStatus(0);

  return buildConfig;
}

async function removeBuildsAndBuildConfig (config) {
  const buildName = config.buildName;

  logger.info(`Deleting build configuration ${buildName}`);
  // First get the list of builds with the labelselector
  // https://URL/oapi/v1/namespaces/NAMESPACE/builds?labelSelector=openshift.io/build-config.name=BUILD_NAME
  const buildList = await config.openshiftRestClient.apis.build.v1.ns(config.namespace.name).builds.get({ qs: { labelSelector: `openshift.io/build-config.name=${buildName}` } });
  // Some default remove Body Options for the rest client, maybe at some point, these will be exposed to the user
  const removeOptions = {
    body: {
      orphanDependents: false,
      gracePeriodSeconds: undefined
    }
  };

  // Delete the builds that it finds
  for (const items of buildList.body.items) {
    logger.info(`Deleting build ${items.metadata.name}`);
    await awaitRequest(config.openshiftRestClient.apis.build.v1.ns(config.namespace.name).builds(items.metadata.name).delete({ body: removeOptions }));
  }
  // delete build config
  return awaitRequest(config.openshiftRestClient.apis.build.v1.ns(config.namespace.name).buildconfigs(buildName).delete({ body: removeOptions }));
}

async function createOrUpdateBuildConfig (config) {
  // Check for a BuildConfig, create or update if necessary
  const buildName = config.buildName;
  const outputImageStreamTag = `${config.outputImageStreamName}:${config.outputImageStreamTag}`;
  // The new code under the openshift rest client, returns an error when getting a 404, so we need to catch it and check the status code
  // I wonder if it is better to find all buildConfigs, then do a Array.find on the returned item list
  const buildConfig = await awaitRequest(config.openshiftRestClient.apis.build.v1.ns(config.namespace.name).buildconfigs(buildName).get());

  config.build = config.build || {};

  if (buildConfig.code === 404) {
    // Need to create the build config
    logger.info(`creating build configuration ${buildName}`);
    const newBuildConfig = createBuildConfig(config, {
      outputImageStreamTag: outputImageStreamTag,
      imageTag: config.imageTag,
      forcePull: config.build.forcePull,
      incremental: config.build.incremental,
      dockerImage: config.dockerImage,
      buildEnv: config.build.env,
      webApp: config.webApp,
      buildStrategy: config.build.strategy
    });
    return config.openshiftRestClient.apis.build.v1.ns(config.namespace.name).buildconfigs.post({ body: newBuildConfig });
  }

  // There is a buildConfig, check our "recreate" option if we need to delete and re-create
  if (config.build && (config.build.recreate === true || config.build.recreate === 'true' || config.build.recreate === 'buildConfig')) {
    logger.info('Recreate option is enabled');

    await removeBuildsAndBuildConfig(config);

    logger.info(`Re-creating build configuration ${buildName}`);
    const newBuildConfig = createBuildConfig(config, {
      outputImageStreamTag: outputImageStreamTag,
      imageTag: config.imageTag,
      forcePull: config.build.forcePull,
      dockerImage: config.dockerImage,
      buildEnv: config.build.env,
      webApp: config.webApp,
      buildStrategy: config.build.strategy
    });
    return config.openshiftRestClient.apis.build.v1.ns(config.namespace.name).buildconfigs.post({ body: newBuildConfig });
  }

  logger.info(`using existing build configuration ${buildName}`);

  return buildConfig;
}

module.exports = {
  createOrUpdateBuildConfig,
  removeBuildsAndBuildConfig
};
