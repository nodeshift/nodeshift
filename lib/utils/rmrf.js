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

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const lstat = promisify(fs.lstat);
const readdir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);
const rmdir = promisify(fs.rmdir);

const MAX_BUSY_TRIES = 20;

const rmrf = async (location, busyTries = 0) => {
  try {
    const stats = await lstat(location);

    if (stats.isFile()) {
      return unlink(location);
    }

    const files = await readdir(location);

    await Promise.all(files.map(file => rmrf(path.join(location, file))));

    rmdir(location);
  } catch (err) {
    if (err.code === 'ENOENT') {
      // nothing to do here, return gracefully
      return;
    }

    if (
      (err.code === 'EBUSY' || err.code === 'EPERM') &&
      busyTries < MAX_BUSY_TRIES
    ) {
      // if file busy or perm errors retry a couple of times
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          rmrf(location, ++busyTries)
            .then(resolve)
            .catch(reject);
        }, busyTries * 100);
      });
    }

    throw err;
  }
};

module.exports = rmrf;
