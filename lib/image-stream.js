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

    await removeImageStream(config);

    logger.info(`Re-creating image stream ${config.projectName}`);
    return config.openshiftRestClient.imagestreams.create(createImageStream(config));
  }

  logger.info(`using existing image stream ${config.projectName}`);
  return imageStream;
}

function removeImageStream (config) {
  logger.info(`Deleting Image Stream ${config.projectName}`);

  // Some default remove Body Options for the rest client, maybe at some point, these will be exposed to the user
  const removeOptions = {
    body: {
      orphanDependents: false,
      gracePeriodSeconds: undefined
    }
  };

  // delete image stream
  return config.openshiftRestClient.imagestreams.remove(config.projectName, removeOptions);
}

module.exports = {
  createOrUpdateImageStream,
  removeImageStream
};
