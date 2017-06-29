'use strict';

const buildSource = require('./build-source');
const buildStrategy = require('./build-strategy');
const buildOutput = require('./build-output');

// https://docs.openshift.com/online/rest_api/openshift_v1.html#v1-buildconfigspec
const baseBuildConfigSpec = {
  triggers: [] // Required, but leaving it an empty array
};

function createBuildConfigSpec (options) {
  options = options || {};
  const buildConfigSpec = baseBuildConfigSpec;
  buildConfigSpec.source = buildSource('Binary');
  buildConfigSpec.strategy = buildStrategy(options);
  buildConfigSpec.output = buildOutput(options.outputImageStreamTag);
  console.log('BuildConfigSpec', buildConfigSpec);
  return buildConfigSpec;
}

module.exports = createBuildConfigSpec;
