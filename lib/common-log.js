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
