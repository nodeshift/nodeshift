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
const logger = require('./common-log')();
const { awaitRequest } = require('./helpers');

const baseImageStream = {
  apiVersion: 'image.openshift.io/v1', // not required
  kind: 'ImageStream', // not required
  spec: {} // required, but the maven plugin leaves it blank
};

function createImageStream (config, options) {
  options = options || {};

  const imageStream = Object.assign({}, baseImageStream);

  // Add new metadata
  imageStream.metadata = objectMetadata({
    name: config.outputImageStreamName,
    namespace: config.namespace.name,
    labels: {
      project: config.projectName,
      version: config.projectVersion
    }
  });

  return imageStream;
}

async function createOrUpdateImageStream (config) {
  const imageStream = await awaitRequest(config.openshiftRestClient.apis.image.v1.ns(config.namespace.name).imagestreams(config.outputImageStreamName).get());
  if (imageStream.code === 404) {
    // Need to create the image stream
    logger.info(`creating image stream ${config.outputImageStreamName}`);
    return config.openshiftRestClient.apis.image.v1.ns(config.namespace.name).imagestreams.post({ body: createImageStream(config) });
  }

  if (config.build && (config.build.recreate === true || config.build.recreate === 'true' || config.build.recreate === 'imageStream')) {
    logger.info('Recreate option is enabled');

    await removeImageStream(config);

    logger.info(`Re-creating image stream ${config.outputImageStreamName}`);
    return config.openshiftRestClient.apis.image.v1.ns(config.namespace.name).imagestreams.post({ body: createImageStream(config) });
  }

  logger.info(`using existing image stream ${config.outputImageStreamName}`);
  return imageStream;
}

function removeImageStream (config) {
  logger.info(`Deleting Image Stream ${config.outputImageStreamName}`);

  // Some default remove Body Options for the rest client, maybe at some point, these will be exposed to the user
  const removeOptions = {
    body: {
      orphanDependents: false,
      gracePeriodSeconds: undefined
    }
  };

  // delete image stream
  return awaitRequest(config.openshiftRestClient.apis.image.v1.ns(config.namespace.name).imagestreams(config.outputImageStreamName).delete({ body: removeOptions }));
}

module.exports = {
  createOrUpdateImageStream,
  removeImageStream
};
