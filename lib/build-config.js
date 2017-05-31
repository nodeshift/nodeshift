'use strict';

// https://docs.openshift.com/online/rest_api/openshift_v1.html#v1-buildconfig

const objectMetadata = require('./definitions/object-metadata');
const buildConfigSpec = require('./definitions/build-config-spec');
const buildConfigStatus = require('./definitions/build-config-status');

const baseBuildConfig = {
  apiVersion: 'v1', // Not Required
  kind: 'BuildConfig' // Not Required
};

function createBuildConfig (config, options) {
  options = options || {};
  const buildConfig = baseBuildConfig;

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

function createOrUpdateBuildConfig (config) {
  // Check for a BuildConfig, create or update if necesarry
  const buildName = config.buildName;
  const imageStreamName = config.projectName;
  const outputImageStreamTag = `${imageStreamName}:latest`; // TODO: base on a tag

  return config.openshiftRestClient.buildconfigs.find(buildName).then((buildConfig) => {
    if (buildConfig.code === 404) {
      // Need to create the build config
      console.log(`Creating Build Config ${buildName} for Source build`);
      const newBuildConfig = createBuildConfig(config, {outputImageStreamTag: outputImageStreamTag});
      return config.openshiftRestClient.buildconfigs.create(newBuildConfig);
    }

    console.log(`Using Build Config ${buildName}  for Source strategy`);
    // TODO: be able to update the buildconfig
    return buildConfig;
  });
}

module.exports = {
  createOrUpdateBuildConfig: createOrUpdateBuildConfig
};
