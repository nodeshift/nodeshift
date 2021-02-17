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

const { promisify } = require('util');
const fs = require('fs');
const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);
const helpers = require('../helpers');
const rmrf = require('../utils/rmrf');
const { getTokenFromBasicAuth } = require('openshift-rest-client/lib/basic-auth-request');
const logger = require('../common-log')();

// the flow would be something like this:
// nodeshift login --token=....... --server=.... [--namepsace=] or nodeshift login --username --password --server [--namespace]
// nodeshift deploy

// TODO: login like htis oc login --token=sha256~rQmdYxnYg9yRpaP8_L_YTVyo2CsvEMSCWkekq-MLmO0 --server=https://api.ci-ln-g44q3ck-d5d6b.origin-ci-int-aws.dev.rhcloud.com:6443
// TODO: Login with no params - does this just do the default thing the Openshift rest client does

// TODO: add namespace info when logging in?

// TODO: login from API?
// TODO: specify an config file instead or an .rc file
// TODO: some type of validation that a token/user/pass/server has been passed in
const LOGIN_CONFIG_LOCATION = 'tmp/nodeshift/config';

async function checkForNodeshiftLogin (options) {
  let loginConfig;

  try {
    // Check if there is a login.json file available
    loginConfig = JSON.parse(await readFileAsync(`${options.projectLocation}/${LOGIN_CONFIG_LOCATION}/login.json`));
    logger.info('login.json file found');
  } catch (err) {
    if (err.code !== 'ENOENT') throw new Error(err);
    // If we made it here, there is no file yet
    logger.info('No login.json file found');
  }

  return loginConfig;
}

async function doNodeshiftLogin (options) {
  // Check to see if we want to force the login
  let loginConfig;
  if (!options.forceLogin) {
    loginConfig = await checkForNodeshiftLogin(options);

    if (loginConfig) {
      // TODO: Check the token
      return loginConfig;
    }
  }

  logger.info('logging in with nodeshift cli');
  // Check to see if there is a token,  if so, use that, if not,  use the username/password if there
  let authToken;
  if (options.token) {
    // use this token
    authToken = options.token;
  } else {
    authToken = await getTokenFromBasicAuth({ user: options.username, password: options.password, url: options.server, insecureSkipTlsVerify: options.insecure });
  }

  loginConfig = { token: authToken, server: options.server, insecureSkipTlsVerify: options.insecure };

  // Write the token and server to a file
  // Create the directory
  await helpers.createDir(`${options.projectLocation}/${LOGIN_CONFIG_LOCATION}`);

  // Now write the json to a file
  await writeFileAsync(`${options.projectLocation}/${LOGIN_CONFIG_LOCATION}/login.json`, JSON.stringify(loginConfig, null, 2), { encoding: 'utf8' });

  return loginConfig;
}

async function doNodeshiftLogout (options) {
  try {
    // Check if there is a login.json file available
    await readFileAsync(`${options.projectLocation}/${LOGIN_CONFIG_LOCATION}/login.json`);
    logger.info('Removing login.json to logout');
    await rmrf(`${options.projectLocation}/${LOGIN_CONFIG_LOCATION}`);
  } catch (err) {
    if (err.code !== 'ENOENT') throw new Error(err);
    // If we made it here, there is no file yet
    logger.info('No login.json file found');
  }
}

module.exports = {
  doNodeshiftLogin,
  doNodeshiftLogout,
  checkForNodeshiftLogin
};
