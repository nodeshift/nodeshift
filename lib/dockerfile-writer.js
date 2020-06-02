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

// This module will be used to create a Dockerfile in project root directory when using Docker build strategy.

const { promisify } = require('util');
const fs = require('fs');
const writeFileAsync = promisify(fs.writeFile);
const logger = require('./common-log')();

async function writeDockerfile (config, from='node:14', app='index.js') {
  const content = `FROM ${from}
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD [ "node", "${app}" ]
  `;

  try {
    // Warn about default dockerfile creation in tmp directory.
    logger.warning(`Creating a default Dockerfile on ${config.projectLocation}/tmp/`);
    await writeFileAsync(`${config.projectLocation}/tmp/Dockerfile`, content, { encoding: 'utf8' });
  } catch (err) {
    logger.error(`error writing file: ${err}`);
    return Promise.reject(err);
  }
}

module.exports = {
  writeDockerfile
};