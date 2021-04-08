const test = require('tape');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noPreserveCache();

test('common-log should be a function', (t) => {
  const commonLog = require('../lib/common-log');
  t.equal(typeof commonLog, 'function', 'should pass');
  t.end();
});

test('common-log exports', (t) => {
  process.env.NODESHIFT_QUIET = true;
  const log = proxyquire('../lib/common-log', {})();

  t.equal(typeof log, 'object', 'should pass');
  t.notEqual(typeof log.info, 'undefined', 'info method should be exported');
  t.notEqual(typeof log.warning, 'undefined', 'warning method should be exported');
  t.notEqual(typeof log.error, 'undefined', 'error method should be exported');
  t.notEqual(typeof log.trace, 'undefined', 'trace method should be exported');
  t.end();
});

test('common-log exports when NODESHIFT_QUIET is false', (t) => {
  const cache = process.env.NODESHIFT_QUIET;
  process.env.NODESHIFT_QUIET = false;

  const log = proxyquire('../lib/common-log', {})();
  const noop = _ => {};

  t.notEqual(log.info.toString(), noop.toString(), 'info method should not be noop');
  t.notEqual(log.trace.toString(), noop.toString(), 'trace method should not be noop');
  t.end();

  // reset process.env
  process.env.NODESHIFT_QUIET = cache;
});

test('common-log exports type', (t) => {
  const log = require('../lib/common-log')();

  t.equal(typeof log.info, 'function', 'info method should be function');
  t.equal(typeof log.warning, 'function', 'warning method should be function');
  t.equal(typeof log.error, 'function', 'error method should be function');
  t.equal(typeof log.trace, 'function', 'trace method should be function');
  t.end();
});

test('common-log info method', (t) => {
  const cache = process.env.NODESHIFT_QUIET;
  process.env.NODESHIFT_QUIET = false;

  const logger = proxyquire('../lib/common-log', {})();
  const spy = sinon.spy(logger, 'info');

  logger.info();

  t.equal(spy.callCount, 1, 'should call console.log');
  t.end();

  // reset
  spy.restore();
  process.env.NODESHIFT_QUIET = cache;
});

test('common-log trace method', (t) => {
  const cache = process.env.NODESHIFT_QUIET;
  process.env.NODESHIFT_QUIET = false;

  const logger = proxyquire('../lib/common-log', {})();
  const spy = sinon.spy(logger, 'trace');

  logger.trace();

  t.equal(spy.callCount, 1, 'should call console.log');
  t.end();

  // reset
  spy.restore();
  process.env.NODESHIFT_QUIET = cache;
});
