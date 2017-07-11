'use strict';
const chalk = require('chalk');

module.exports = exports = {
  info, warning, error, trace
};

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

const timestamp = _ => chalk.green((new Date).toISOString());