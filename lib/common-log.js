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

const pino = require('pino')();

let log;

module.exports = exports = function logger () {
  return log || (log = _logger());
};

function _logger () {
  if (process.env.NODESHIFT_QUIET === true || process.env.NODESHIFT_QUIET === 'true') {
    return {
      info: pino.silent.bind(pino),
      trace: pino.silent.bind(pino),
      warning,
      error
    };
  }
  pino.info.bind(pino);
  pino.warn.bind(pino);
  pino.trace.bind(pino);
  pino.error.bind(pino);
  return { info, trace, warning, error };
}

function info () {
  pino.info(arguments);
}

function warning () {
  pino.warn(arguments);
}

function error () {
  pino.error(arguments);
}

function trace () {
  pino.trace(arguments);
}
