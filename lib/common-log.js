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
const chalk = require('chalk');

const timestamp = _ => chalk.green((new Date()).toISOString());
const noop = _ => {};
let log;

module.exports = exports = function logger () {
  return log || (log = _logger());
};

function _logger () {
  if (process.env['NODESHIFT_QUIET'] === true || process.env['NODESHIFT_QUIET'] === 'true') {
    return {
      info: noop,
      trace: noop,
      warning,
      error
    };
  }
  return { info, trace, warning, error };
}

function info () {
  console.log(timestamp(), 'INFO', chalk.yellow.apply(chalk, arguments));
}

function warning () {
  console.log(timestamp(), 'WARNING', chalk.magenta.apply(chalk, arguments));
}

function error () {
  console.error(timestamp(), 'ERROR', chalk.bold.red.apply(chalk, arguments));
}

function trace () {
  console.log(timestamp(), 'TRACE', chalk.blue.apply(chalk, arguments));
}
