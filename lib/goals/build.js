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

const dockerArchiver = require('../docker-archiver');
const buildConfigurator = require('../build-config');
const imageStreamConfigurator = require('../image-stream');
const binaryBuild = require('../binary-build');

module.exports = async function build (config) {
  // arvhice the application source
  await dockerArchiver.archiveAndTar(config);

  // create or update the build config
  await buildConfigurator.createOrUpdateBuildConfig(config);

  // create or update the imagestream
  await imageStreamConfigurator.createOrUpdateImageStream(config);

  // push to the cluster
  return binaryBuild(config, `${config.projectLocation}/${dockerArchiver.DEFAULT_BUILD_LOCATION}/archive.tar`);
};
