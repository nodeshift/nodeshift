'use strict';

const cli = require('./bin/cli');

// Expose some API
function deployApplication (options = {}) {
  // This will do the whole thing
  options.cmd = 'deploy';
  return cli(options);
}

async function resource (options = {}) {
  options.cmd = 'resource';
  return cli(options);
}

async function applyResource (options = {}) {
  options.cmd = 'apply-resource';
  return cli(options);
}

function undeploy (options = {}) {
  options.cmd = 'undeploy';
  return cli(options);
}

module.exports = {
  deployApplication,
  resource,
  applyResource,
  undeploy
};
