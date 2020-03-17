const test = require('tape');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

test('build watcher stream - success', (t) => {
  const traceStub = sinon.stub();
  const { PassThrough } = require('stream');

  const watchBuildLog = proxyquire('../lib/build-watcher', {
    './common-log': () => ({
      trace: traceStub
    }),
    './helpers': {
      wait: () => Promise.resolve()
    }
  });

  const mockReadable = new PassThrough();

  const config = {
    namespace: {
      name: 'test-namespace'
    },
    openshiftRestClient: {
      api: {
        v1: {
          ns: (namespace) => ({
            pods: (build) => ({
              log: {
                get: () => Promise.resolve({ statusCode: 200 }),
                getByteStream: () => Promise.resolve(mockReadable)
              }
            })
          })
        }
      }
    }
  };

  setTimeout(() => {
    mockReadable.emit('data', 'beep!');
    mockReadable.emit('data', 'boop!');
    mockReadable.emit('end');
  }, 100);

  const buildLogWatcher = watchBuildLog(config, 'test-build');

  setTimeout(() => {
    buildLogWatcher.then(() => {
      t.equal(traceStub.callCount, 2, 'trace should be called twice');
      t.end();
    });
  }, 200);
});

test('build watcher stream - fail', (t) => {
  const { PassThrough } = require('stream');

  const watchBuildLog = proxyquire('../lib/build-watcher', {
    './common-log': () => ({
      trace: () => {}
    }),
    './helpers': {
      wait: () => Promise.resolve()
    }
  });

  const mockReadable = new PassThrough();

  const config = {
    namespace: {
      name: 'test-namespace'
    },
    openshiftRestClient: {
      api: {
        v1: {
          ns: (namespace) => ({
            pods: (build) => ({
              log: {
                get: () => Promise.resolve({ statusCode: 200 }),
                getByteStream: () => Promise.resolve(mockReadable)
              }
            })
          })
        }
      }
    }
  };

  setTimeout(() => {
    mockReadable.emit('error', new Error('some stream error occurred'));
  }, 100);

  watchBuildLog(config, 'test-build');

  process.on('unhandledRejection', (err) => {
    t.equal(err.message, 'some stream error occurred', 'error message should be displayed');
    t.end();
    // reset unhandledRejection listener
    process.on('unhandledRejection', (err) => console.error(err));
  });
});

test('build watcher pod-long-endpoint - fail', (t) => {
  const watchBuildLog = proxyquire('../lib/build-watcher', {
    './common-log': () => ({
      trace: () => {}
    }),
    './helpers': {
      wait: () => Promise.resolve()
    }
  });

  const config = {
    namespace: {
      name: 'test-namespace'
    },
    openshiftRestClient: {
      api: {
        v1: {
          ns: (namespace) => ({
            pods: (build) => ({
              log: {
                get: () => {
                  const error = new Error('can not get pod logs');
                  error.statusCode = 404;
                  return Promise.reject(error);
                },
                getByteStream: () => Promise.reject(new Error('can not get byte stream'))
              }
            })
          })
        }
      }
    }
  };

  const buildLogWatcher = watchBuildLog(config, 'test-build');

  buildLogWatcher.then(() => {
    t.fail('an error must be thrown');
    t.end();
  }).catch(() => {
    t.pass('an error must be thrown');
    t.end();
  });
});
