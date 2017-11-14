'use strict';

// https://docs.openshift.com/online/rest_api/openshift_v1.html#v1-imagestream
const objectMetadata = require('./definitions/object-metadata');
const logger = require('./common-log')();

const baseImageStream = {
  apiVersion: 'v1', // not required
  kind: 'ImageStream', // not required
  spec: {} // required, but the maven plugin leaves it blank
};

function createImageStream (config, options) {
  options = options || {};

  const imageStream = Object.assign({}, baseImageStream);

  // Add new metadata
  imageStream.metadata = objectMetadata({
    name: config.projectName,
    namespace: config.context.namespace,
    labels: {
      project: config.projectName,
      version: config.projectVersion
    }
  });

  return imageStream;
}

async function createOrUpdateImageStream (config) {
  const imageStream = await config.openshiftRestClient.imagestreams.find(config.projectName);
  if (imageStream.code === 404) {
    // Need to create the image stream
    logger.info(`creating image stream ${config.projectName}`);
    return config.openshiftRestClient.imagestreams.create(createImageStream(config));
  }

  if (config.build && (config.build.recreate === true || config.build.recreate === 'imageStream')) {
    logger.info('Recreate option is enabled');
    logger.info(`Deleting Image Stream ${config.projectName}`);

    // Some default remove Body Options for the rest client, maybe at some point, these will be exposed to the user
    const removeOptions = {
      body: {
        orphanDependents: false,
        gracePeriodSeconds: undefined
      }
    };

    // delete image stream
    await config.openshiftRestClient.imagestreams.remove(config.projectName, removeOptions);

    logger.info(`Re-creating image stream ${config.projectName}`);
    return config.openshiftRestClient.imagestreams.create(createImageStream(config));
  }

  logger.info(`using existing image stream ${config.projectName}`);
  return imageStream;
}

module.exports = {
  createOrUpdateImageStream: createOrUpdateImageStream
};
