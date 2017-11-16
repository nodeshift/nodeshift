'use strict';

const nodeshiftConfig = require('../lib/nodeshift-config');

const resourceGoal = require('../lib/goals/resource');
const buildGoal = require('../lib/goals/build');
const applyResources = require('../lib/apply-resources');
const undeployGoal = require('../lib/goals/undeploy');
let config;

module.exports = async function run (options) {
  try {
    config = await nodeshiftConfig(options);
    let enrichedResources = {};
    if (options.cmd === 'resource' || options.cmd === 'deploy' || options.cmd === 'apply-resource') {
      enrichedResources = await resourceGoal(config);
    }

    if (options.cmd === 'deploy' || options.cmd === 'build') {
      await buildGoal(config);
    }

    if (options.cmd === 'deploy' || options.cmd === 'apply-resource') {
      await applyResources(config, enrichedResources);
    }

    if (options.cmd === 'undeploy') {
      await undeployGoal(config);
    }

    return 'done';
  } catch (err) {
    return Promise.reject(err);
  }
};
