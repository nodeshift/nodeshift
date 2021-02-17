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

// Enricher for adding metering metadata
const METERING_LABELS = {
  'com.redhat.component-name': 'Node.js',
  'com.redhat.component-type': 'application',
  'com.redhat.component-version': '14.x.x', // Need to look at the image
  'com.redhat.product-name': 'Red_Hat_Runtimes',
  'com.redhat.product-version': '2021/Q1' // Node 14 - 2021/Q1 Node 16 2021/Q4(?)
};

const _ = require('lodash');

function parseNodeMajor (nodeVersion) {
  return nodeVersion.split('.')[0];
}

function getProductVersion (nodeVersion) {
  let productVersion;
  switch (parseNodeMajor(nodeVersion)) {
    case '14':
      productVersion = '2021/Q1';
      break;
    default:
      productVersion = 'unknown';
      break;
  }

  return productVersion;
}

function parseNodeImage (imageName) {
  const split = imageName.split('/');

  const justNode = split.find((val) => {
    return val.includes('nodejs');
  });

  const nodeVersion = justNode.split('-')[1];
  return nodeVersion;
}

async function addMeteringInfo (config, resourceList) {
  return resourceList.map((resource) => {
    if (resource.kind === 'DeploymentConfig' || resource.kind === 'Deployment') {
      // Check that the metering flag was added
      // Also check that a "Red Hat" image is being used?
      if (!config.metering) {
        return resource;
      }

      const nodeVersion = config.metering.nodeVersion ? config.metering.nodeVersion : parseNodeImage(config.dockerImage);

      resource.spec.template.metadata.labels = _.merge({}, METERING_LABELS, resource.spec.template.metadata.labels);
      resource.spec.template.metadata.labels['com.redhat.component-version'] = nodeVersion;
      resource.spec.template.metadata.labels['com.redhat.product-version'] = getProductVersion(nodeVersion);

      return resource;
    }

    return resource;
  });
}

module.exports = {
  enrich: addMeteringInfo,
  name: 'metering'
};
