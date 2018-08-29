const test = require('tape');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

test('binary build test', (t) => {
  const binaryBuild = require('../lib/binary-build');
  t.equal(typeof binaryBuild, 'function', 'this module exports a function');
  t.end();
});

test('binary build test - succesful build', (t) => {
  const binaryBuild = proxyquire('../lib/binary-build', {
    './build-watcher': () => {
      return Promise.resolve();
    }
  });

  const config = {
    openshiftRestClient: {
      builds: {
        find: (name) => {
          return Promise.resolve({
            metadata: {
              name: 'buildName'
            },
            status: {
              phase: 'Complete'
            }
          });
        }
      },
      buildconfigs: {
        instantiateBinary: (buildName, options) => {
          return Promise.resolve({ metadata: { name: 'buildname' } });
        }
      }
    }
  };

  binaryBuild(config, 'archiveLocation').then((buildStatus) => {
    console.log(buildStatus);
    t.pass('succesful complete build');
    t.end();
  });
});

test('binary build test - failed build', (t) => {
  const binaryBuild = proxyquire('../lib/binary-build', {
    './build-watcher': () => {
      return Promise.resolve();
    }
  });

  const config = {
    openshiftRestClient: {
      builds: {
        find: (name) => {
          return Promise.resolve({
            metadata: {
              name: 'buildName'
            },
            status: {
              phase: 'Failed',
              message: 'You Failed'
            }
          });
        }
      },
      buildconfigs: {
        instantiateBinary: (buildName, options) => {
          return Promise.resolve({ metadata: { name: 'buildname' } });
        }
      }
    }
  };

  binaryBuild(config, 'archiveLocation').catch(() => {
    t.pass('should fail');
    t.end();
  });
});

test('binary build test - succesful build - but not write away', (t) => {
  const binaryBuild = proxyquire('../lib/binary-build', {
    './build-watcher': () => {
      return Promise.resolve();
    }
  });

  const findStub = sinon.stub();
  findStub.onCall(0).resolves({
    metadata: {
      name: 'buildName'
    },
    status: {
      phase: 'Pending'
    }
  });

  findStub.onCall(1).resolves({
    metadata: {
      name: 'buildName'
    },
    status: {
      phase: 'Complete'
    }
  });

  const config = {
    openshiftRestClient: {
      builds: {
        find: findStub
      },
      buildconfigs: {
        instantiateBinary: (buildName, options) => {
          return Promise.resolve({ metadata: { name: 'buildname' } });
        }
      }
    }
  };

  binaryBuild(config, 'archiveLocation').then((buildStatus) => {
    console.log(buildStatus);
    t.pass('succesful complete build');
    t.end();
  });
});
