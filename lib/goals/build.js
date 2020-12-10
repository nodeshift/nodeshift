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

// This file is responsible for creation of the archive of the application code
// creating the BuildConfig, Imagestream and then pushing that all up

const projectArchiver = require('../project-archiver');
const buildConfigurator = require('../build-config');
const imageStreamConfigurator = require('../image-stream');
const binaryBuild = require('../binary-build');

module.exports = async function build (config) {
  if (config.kube) {
    // The build command for just kubernetes will create a container image using the source code
    // Not sure if we should be creating the image as latest, or some other version?
    // This Docker image will then be tagged with the hash from the ImageID,  or Do we need to do that?

    // The return value of this goal should be the hash id of the image
    const imageId = await projectArchiver.createContainer(config);

    // We don't care about the return value,  just that it succeeds
    // TODO(lholmquist): Do we need to tag the image?
    // await projectArchiver.tagImage(config, imageId);

    return imageId;
  }
  // archive the application source
  await projectArchiver.archiveAndTar(config);

  // create or update the build config
  await buildConfigurator.createOrUpdateBuildConfig(config);

  // create or update the imagestream
  await imageStreamConfigurator.createOrUpdateImageStream(config);

  // push to the cluster
  return binaryBuild(config, `${config.projectLocation}/${projectArchiver.DEFAULT_BUILD_LOCATION}/archive.tar`);
};
