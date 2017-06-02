'use strict';

// https://docs.openshift.com/online/rest_api/openshift_v1.html#v1-imagestream
const objectMetadata = require('./definitions/object-metadata');

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

function createOrUpdateImageStream (config) {
  return config.openshiftRestClient.imagestreams.find(config.projectName).then((imageStream) => {
    if (imageStream.code === 404) {
      // Need to create the image stream
      console.log(`Creating ImageStream ${config.projectName}`);
      const newImageStream = createImageStream(config);
      return config.openshiftRestClient.imagestreams.create(newImageStream);
    }

    console.log(`Using ImageStream ${config.projectName}`);

    return imageStream;
  });
}

function getDockerImageRepo (config) {
  return config.openshiftRestClient.imagestreams.find(config.projectName).then((imageStream) => {
    return imageStream.status.dockerImageRepository;
  });
}

module.exports = {
  createOrUpdateImageStream: createOrUpdateImageStream,
  getDockerImageRepo: getDockerImageRepo
};
