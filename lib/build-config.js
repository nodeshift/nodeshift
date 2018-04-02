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

// https://docs.openshift.com/online/rest_api/openshift_v1.html#v1-buildconfig

const objectMetadata = require('./definitions/object-metadata');
const buildConfigSpec = require('./definitions/build-config-spec');
const buildConfigStatus = require('./definitions/build-config-status');
const logger = require('./common-log')();

const baseBuildConfig = {
  apiVersion: 'v1', // Not Required
  kind: 'BuildConfig' // Not Required
};

function createBuildConfig (config, options) {
  const buildConfig = Object.assign({}, baseBuildConfig);

  // Add new metadata
  buildConfig.metadata = objectMetadata({
    name: config.buildName,
    namespace: config.context.namespace,
    labels: {
      project: config.projectName,
      version: config.projectVersion
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

  logger.info(`Deleteing build configuration ${buildName}`);
  // First get the list of builds with the labelselector
  // https://URL/oapi/v1/namespaces/NAMESPACE/builds?labelSelector=openshift.io/build-config.name=BUILD_NAME
  const buildList = await config.openshiftRestClient.builds.findAll({qs: {labelSelector: `openshift.io/build-config.name=${buildName}`}});

  // Some default remove Body Options for the rest client, maybe at some point, these will be exposed to the user
  const removeOptions = {
    body: {
      orphanDependents: false,
      gracePeriodSeconds: undefined
    }
  };

  // Delete the builds that it finds
  for (const items of buildList.items) {
    logger.info(`Deleteing build ${items.metadata.name}`);
    await config.openshiftRestClient.builds.remove(items.metadata.name, removeOptions);
  }
  // delete build config
  return config.openshiftRestClient.buildconfigs.remove(buildName, removeOptions);
}

async function createOrUpdateBuildConfig (config) {
  // Check for a BuildConfig, create or update if necessary
  const buildName = config.buildName;
  const imageStreamName = config.projectName;
  const outputImageStreamTag = `${imageStreamName}:latest`; // TODO: base on a tag
  const buildConfig = await config.openshiftRestClient.buildconfigs.find(buildName);

  config.build = config.build || {};

  if (buildConfig.code === 404) {
    // Need to create the build config
    logger.info(`creating build configuration ${buildName}`);
    const newBuildConfig = createBuildConfig(config, {
      outputImageStreamTag: outputImageStreamTag,
      nodeVersion: config.nodeVersion,
      forcePull: config.build.forcePull,
      dockerImage: config.dockerImage,
      buildEnv: config.build.env
    });
    return config.openshiftRestClient.buildconfigs.create(newBuildConfig);
  }

  // There is a buildConfig, check our "recreate" option if we need to delete and re-create
  if (config.build && (config.build.recreate === true || config.build.recreate === 'buildConfig')) {
    logger.info(`Recreate option is enabled`);

    await removeBuildsAndBuildConfig(config);

    logger.info(`Re-creating build configuration ${buildName}`);
    const newBuildConfig = createBuildConfig(config, {
      outputImageStreamTag: outputImageStreamTag,
      nodeVersion: config.nodeVersion,
      forcePull: config.build.forcePull,
      dockerImage: config.dockerImage,
      buildEnv: config.build.env
    });
    return config.openshiftRestClient.buildconfigs.create(newBuildConfig);
  }

  logger.info(`using existing build configuration ${buildName}`);
  // TODO: be able to update the buildConfig
  return buildConfig;
}

module.exports = {
  createOrUpdateBuildConfig,
  removeBuildsAndBuildConfig
};
