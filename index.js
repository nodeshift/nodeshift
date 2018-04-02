'use strict';

const cli = require('./bin/cli');

/**  @module index */

/**
  This is the public facing API of nodeshift.  The commands here mirror the commands from the CLI.
  All methods take an options object
*/

/**
  The deploy function will do the combination of resource, build and apply-resource

  @param {object} [options] -
  @param {string} [options.projectLocation] - the location(directory) of your projects package.json. Defaults to `process.cwd`
  @param {boolean} [options.strictSSL] - Set to false to allow self-signed Certs
  @param {boolean} [options.tryServiceAccount] - Set to false to by-pass service account lookup
  @param {boolean} [options.expose] - Set to true to create a default Route and expose the default service.  defaults to false
  @param {string} [options.nodeVersion] - set the nodeversion to use for the bucharest-gold/centos7-s2i-image.  Versions are docker hub tags: https://hub.docker.com/r/bucharestgold/centos7-s2i-nodejs/tags/
  @param {boolean} [options.quiet] - supress INFO and TRACE lines from output logs
  @param {object} [options.build] -
  @param {string/boolean} [options.build.recreate] - flag to recreate a buildConfig or Imagestream. values are "buildConfig", "imageStream", true, false.  Defaults to false
  @param {boolean} [options.build.forcePull] - flag to make your BuildConfig always pull a new image from dockerhub or not. Defaults to false
  @param {Array} [options.build.env] - an array of objects to pass build config environment variables.  [{name: NAME_PROP, value: VALUE}]
  @param {array} [options.definedProperties] - Array of objects with the format { key: value }.  Used for template substitution
  @returns {Promise} - Returns a JSON Object
*/
function deploy (options = {}) {
  options.cmd = 'deploy';
  return cli(options);
}

/**
  The resource function will find and enrich all the resource fragments from the .nodeshift directory and create missing service and deployment configs.
  An openshift.yaml and openshift.json will also be created in the ./tmp/nodeshift/resource directory

  @param {object} [options] -
  @param {string} [options.projectLocation] - the location(directory) of your projects package.json. Defaults to `process.cwd`
  @param {boolean} [options.strictSSL] - Set to false to allow self-signed Certs
  @param {boolean} [options.tryServiceAccount] - Set to false to by-pass service account lookup
  @param {boolean} [options.expose] - Set to true to create a default Route and expose the default service.  defaults to false
  @param {string} [options.nodeVersion] - set the nodeversion to use for the bucharest-gold/centos7-s2i-image.  Versions are docker hub tags: https://hub.docker.com/r/bucharestgold/centos7-s2i-nodejs/tags/
  @param {boolean} [options.quiet] - supress INFO and TRACE lines from output logs
  @param {object} [options.build] -
  @param {string/boolean} [options.build.recreate] - flag to recreate a buildConfig or Imagestream. values are "buildConfig", "imageStream", true, false.  Defaults to false
  @param {boolean} [options.build.forcePull] - flag to make your BuildConfig always pull a new image from dockerhub or not. Defaults to false
  @param {array} [options.definedProperties] - Array of objects with the format { key: value }.  Used for template substitution
  @returns {Promise} - Returns a JSON Object
*/
function resource (options = {}) {
  options.cmd = 'resource';
  return cli(options);
}

/**
  The apply-resource function does what resource does, but also pushes those resource fragments to your cluster

  @param {object} [options] -
  @param {string} [options.projectLocation] - the location(directory) of your projects package.json. Defaults to `process.cwd`
  @param {boolean} [options.strictSSL] - Set to false to allow self-signed Certs
  @param {boolean} [options.tryServiceAccount] - Set to false to by-pass service account lookup
  @param {boolean} [options.expose] - Set to true to create a default Route and expose the default service.  defaults to false
  @param {string} [options.nodeVersion] - set the nodeversion to use for the bucharest-gold/centos7-s2i-image.  Versions are docker hub tags: https://hub.docker.com/r/bucharestgold/centos7-s2i-nodejs/tags/
  @param {boolean} [options.quiet] - supress INFO and TRACE lines from output logs
  @param {object} [options.build] -
  @param {string/boolean} [options.build.recreate] - flag to recreate a buildConfig or Imagestream. values are "buildConfig", "imageStream", true, false.  Defaults to false
  @param {boolean} [options.build.forcePull] - flag to make your BuildConfig always pull a new image from dockerhub or not. Defaults to false
  @param {array} [options.definedProperties] - Array of objects with the format { key: value }.  Used for template substitution
  @returns {Promise} - Returns a JSON Object
*/
function applyResource (options = {}) {
  options.cmd = 'apply-resource';
  return cli(options);
}

/**
  The undeploy function will use the openshift.yaml/openshift.json from the resource function and remove those values from your cluster.

  @param {object} [options] -
  @param {string} [options.projectLocation] - the location(directory) of your projects package.json. Defaults to `process.cwd`
  @param {boolean} [options.strictSSL] - Set to false to allow self-signed Certs
  @param {boolean} [options.tryServiceAccount] - Set to false to by-pass service account lookup
  @param {string} [options.nodeVersion] - set the nodeversion to use for the bucharest-gold/centos7-s2i-image.  Versions are docker hub tags: https://hub.docker.com/r/bucharestgold/centos7-s2i-nodejs/tags/
  @param {boolean} [options.quiet] - supress INFO and TRACE lines from output logs
  @param {boolean} [options.removeAll] - option to remove builds, buildConfigs and Imagestreams.  Defaults to false
  @param {object} [options.build] -
  @param {string/boolean} [options.build.recreate] - flag to recreate a buildConfig or Imagestream. values are "buildConfig", "imageStream", true, false.  Defaults to false
  @param {boolean} [options.build.forcePull] - flag to make your BuildConfig always pull a new image from dockerhub or not. Defaults to false
  @param {array} [options.definedProperties] - Array of objects with the format { key: value }.  Used for template substitution
  @returns {Promise} - Returns a JSON Object
*/
function undeploy (options = {}) {
  options.cmd = 'undeploy';
  return cli(options);
}

/**
  The build function will archive your code, create a BuildConfig and Imagestream and then upload the archived code to your cluster

  @param {object} [options] -
  @param {string} [options.projectLocation] - the location(directory) of your projects package.json. Defaults to `process.cwd`
  @param {boolean} [options.strictSSL] - Set to false to allow self-signed Certs
  @param {boolean} [options.tryServiceAccount] - Set to false to by-pass service account lookup
  @param {string} [options.nodeVersion] - set the nodeversion to use for the bucharest-gold/centos7-s2i-image.  Versions are docker hub tags: https://hub.docker.com/r/bucharestgold/centos7-s2i-nodejs/tags/
  @param {boolean} [options.quiet] - supress INFO and TRACE lines from output logs
  @param {object} [options.build] -
  @param {string/boolean} [options.build.recreate] - flag to recreate a buildConfig or Imagestream. values are "buildConfig", "imageStream", true, false.  Defaults to false
  @param {boolean} [options.build.forcePull] - flag to make your BuildConfig always pull a new image from dockerhub or not. Defaults to false
  @param {Array} [options.build.env] - an array of objects to pass build config environment variables.  [{name: NAME_PROP, value: VALUE}]
  @param {array} [options.definedProperties] - Array of objects with the format { key: value }.  Used for template substitution
  @returns {Promise} - Returns a JSON Object
*/
function build (options = {}) {
  options.cmd = 'build';
  return cli(options);
}

module.exports = {
  deploy,
  resource,
  applyResource,
  undeploy,
  build
};
