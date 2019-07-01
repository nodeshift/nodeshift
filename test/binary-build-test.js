const test = require('tape');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

test('binary build test', (t) => {
  const binaryBuild = require('../lib/binary-build');
  t.equal(typeof binaryBuild, 'function', 'this module exports a function');
  t.end();
});

test('binary build test - successful build', (t) => {
  const binaryBuild = proxyquire('../lib/binary-build', {
    fs: {
      createReadStream: () => {
        return '';
      }
    },
    './build-watcher': () => {
      return Promise.resolve();
    }
  });

  const config = {
    namespace: {
      name: ''
    },
    openshiftRestClient: {
      apis: {
        build: {
          v1: {
            ns: (name) => {
              return {
                builds: (name) => {
                  return {
                    get: () => {
                      return Promise.resolve({
                        code: 200,
                        body: {
                          metadata: {
                            name: 'buildName'
                          },
                          status: {
                            phase: 'Complete'
                          }
                        }
                      });
                    }
                  };
                },
                buildconfigs: (buildName) => {
                  return {
                    instantiatebinary: {
                      post: () => {
                        return Promise.resolve({ code: 201, body: JSON.stringify({ metadata: { name: 'buildName' } }) });
                      }
                    }
                  };
                }
              };
            }
          }
        }
      }
    }
  };

  binaryBuild(config, 'archiveLocation').then((buildStatus) => {
    t.pass('successful complete build');
    t.end();
  });
});

test('binary build test - failed build', (t) => {
  const binaryBuild = proxyquire('../lib/binary-build', {
    fs: {
      createReadStream: () => {
        return '';
      }
    },
    './build-watcher': () => {
      return Promise.resolve();
    }
  });

  const config = {
    namespace: {
      name: ''
    },
    openshiftRestClient: {
      apis: {
        build: {
          v1: {
            ns: (name) => {
              return {
                builds: (name) => {
                  return {
                    get: () => {
                      return Promise.resolve({
                        code: 200,
                        body: {
                          metadata: {
                            name: 'buildName'
                          },
                          status: {
                            phase: 'Failed',
                            message: 'You Failed'
                          }
                        }
                      });
                    }
                  };
                },
                buildconfigs: (buildName) => {
                  return {
                    instantiatebinary: {
                      post: () => {
                        return Promise.resolve({ code: 201, body: JSON.stringify({ metadata: { name: 'buildName' } }) });
                      }
                    }
                  };
                }
              };
            }
          }
        }
      }
    }
  };

  binaryBuild(config, 'archiveLocation').catch((error) => {
    t.equal(error.message, 'You Failed', 'should have this error message');
    t.pass('should fail');
    t.end();
  });
});

test('binary build test - successful build - but not write away', (t) => {
  const binaryBuild = proxyquire('../lib/binary-build', {
    './build-watcher': () => {
      return Promise.resolve();
    },
    fs: {
      createReadStream: () => {
        return '';
      }
    }
  });

  const getStub = sinon.stub();
  getStub.onCall(0).resolves({
    code: 200,
    body: {
      metadata: {
        name: 'buildName'
      },
      status: {
        phase: 'Pending'
      }
    }
  });

  getStub.onCall(1).resolves({
    code: 200,
    body: {
      metadata: {
        name: 'buildName'
      },
      status: {
        phase: 'Complete'
      }
    }
  });

  const config = {
    namespace: {
      name: ''
    },
    openshiftRestClient: {
      apis: {
        build: {
          v1: {
            ns: (name) => {
              return {
                builds: (name) => {
                  return {
                    get: getStub
                  };
                },
                buildconfigs: (buildName) => {
                  return {
                    instantiatebinary: {
                      post: () => {
                        return Promise.resolve({ code: 201, body: JSON.stringify({ metadata: { name: 'buildName' } }) });
                      }
                    }
                  };
                }
              };
            }
          }
        }
      }
    }
  };

  binaryBuild(config, 'archiveLocation').then((buildStatus) => {
    t.pass('successful complete build');
    t.end();
  });
});
