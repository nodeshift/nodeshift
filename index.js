'use strict';

const cli = require('./bin/cli');

// Expose some API
function deployApplication (options = {}) {
  // This will do the whole thing
  require('./lib/common-log')().warning('deployApplication is deprecated, please use deploy');
  options.cmd = 'deploy';
  return cli(options);
}

function deploy (options = {}) {
  // This will do the whole thing
  options.cmd = 'deploy';
  return cli(options);
}

function resource (options = {}) {
  options.cmd = 'resource';
  return cli(options);
}

function applyResource (options = {}) {
  options.cmd = 'apply-resource';
  return cli(options);
}

function undeploy (options = {}) {
  options.cmd = 'undeploy';
  return cli(options);
}

function build (options = {}) {
  options.cmd = 'build';
  return cli(options);
}

module.exports = {
  deployApplication,
  deploy,
  resource,
  applyResource,
  undeploy,
  build
};
