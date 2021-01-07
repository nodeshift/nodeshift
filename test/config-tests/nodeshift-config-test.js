'use strict';

const test = require('tape');
const proxyquire = require('proxyquire');

test('nodeshift-config basic setup', (t) => {
  const nodeshiftConfig = proxyquire('../../lib/config/nodeshift-config', {
    'openshift-rest-client': {
      OpenshiftClient: () => {
        return Promise.resolve({
          kubeconfig: {
            getCurrentContext: () => {
              return 'nodey/ip/other';
            },
            getCurrentCluster: () => {
              return { server: 'http://mock-cluster' };
            },
            getContexts: () => {
              return [{ name: 'nodey/ip/other', namespace: 'test-namespace' }];
            }
          }
        });
      }
    }
  });

  const p = nodeshiftConfig().then((config) => {
    t.ok(config.port, 'port prop should be here');
    t.equal(config.port, 8080, 'default port should be 8080');
    t.ok(config.projectLocation, 'projectLocation prop should be here');
    t.equal(config.projectLocation, process.cwd(), 'projectLocation prop should be cwd by default');
    t.ok(config.nodeshiftDirectory, 'nodeshiftDir prop should be here');
    t.equal(config.nodeshiftDirectory, '.nodeshift', 'nodeshiftDir prop should be .nodeshift by default');
    t.equal(config.outputImageStreamName, 'nodeshift', 'outputImageStreamName should be the package name by default');
    t.equal(config.outputImageStreamTag, 'latest', 'outputImageStreamTag should be the latest by default');
    t.end();
  }).catch(t.fail);

  t.equal(p instanceof Promise, true, 'should return a Promise');
});

test('nodeshift-config basic setup with deploy option', (t) => {
  const nodeshiftConfig = proxyquire('../../lib/config/nodeshift-config', {
    'openshift-rest-client': {
      OpenshiftClient: () => {
        return Promise.resolve({
          kubeconfig: {
            getCurrentContext: () => {
              return 'nodey/ip/other';
            },
            getCurrentCluster: () => {
              return { server: 'http://mock-cluster' };
            },
            getContexts: () => {
              return [{ name: 'nodey/ip/other', namespace: 'test-namespace' }];
            }
          }
        });
      }
    }
  });

  const options = {
    deploy: {
      port: 3000
    }
  };

  const p = nodeshiftConfig(options).then((config) => {
    t.ok(config.port, 'port prop should be here');
    t.equal(config.port, 3000, 'default port should be 8080');
    t.end();
  }).catch(t.fail);

  t.equal(p instanceof Promise, true, 'should return a Promise');
});

test('nodeshift-config other project location and nodeshiftDir', (t) => {
  const nodeshiftConfig = proxyquire('../../lib/config/nodeshift-config', {
    'openshift-rest-client': {
      OpenshiftClient: () => {
        return Promise.resolve({
          kubeconfig: {
            getCurrentContext: () => {
              return 'nodey/ip/other';
            },
            getCurrentCluster: () => {
              return { server: 'http://mock-cluster' };
            },
            getContexts: () => {
              return [{ name: 'nodey/ip/other', namespace: 'test-namespace' }];
            }
          }
        });
      }
    }
  });

  const options = {
    projectLocation: './examples/sample-project'
  };

  nodeshiftConfig(options).then((config) => {
    t.equal(config.projectLocation, './examples/sample-project', 'projectLocation prop should be changed');
    t.end();
  });
});

test('nodeshift-config no project Version', (t) => {
  const nodeshiftConfig = proxyquire('../../lib/config/nodeshift-config', {
    'openshift-rest-client': {
      OpenshiftClient: () => {
        return Promise.resolve({
          kubeconfig: {
            getCurrentContext: () => {
              return 'nodey/ip/other';
            },
            getCurrentCluster: () => {
              return { server: 'http://mock-cluster' };
            },
            getContexts: () => {
              return [{ name: 'nodey/ip/other', namespace: 'test-namespace' }];
            }
          }
        });
      }
    }
  });

  const options = {
    projectLocation: './examples/sample-project-no-version'
  };

  nodeshiftConfig(options).then((config) => {
    t.equal(config.projectVersion, '0.0.0', 'projectVersion should be 0.0.0');
    t.end();
  });
});

test('nodeshift-config no package.json', (t) => {
  const nodeshiftConfig = proxyquire('../../lib/config/nodeshift-config', {
    'openshift-rest-client': {
      OpenshiftClient: () => {
        return Promise.resolve({
          kubeconfig: {
            getCurrentContext: () => {
              return 'nodey/ip/other';
            },
            getCurrentCluster: () => {
              return { server: 'http://mock-cluster' };
            },
            getContexts: () => {
              return [{ name: 'nodey/ip/other', namespace: 'test-namespace' }];
            }
          }
        });
      }
    }
  });

  const options = {
    projectLocation: './not-here'
  };

  nodeshiftConfig(options).catch((err) => {
    t.equal(err.message.includes('./not-here/package.json'), true, 'Error Should be "\'Cannot find module \'./not-here/package.json\'\'"');
    t.end();
  });
});

test('nodeshift-config invalid "name" in package.json', (t) => {
  const nodeshiftConfig = proxyquire('../../lib/config/nodeshift-config', {
    'openshift-rest-client': {
      OpenshiftClient: () => {
        return Promise.resolve({
          kubeconfig: {
            getCurrentContext: () => {
              return 'nodey/ip/other';
            },
            getCurrentCluster: () => {
              return { server: 'http://mock-cluster' };
            },
            getContexts: () => {
              return [{ name: 'nodey/ip/other', namespace: 'test-namespace' }];
            }
          }
        });
      }
    }
  });

  const tmpDir = require('os').tmpdir();
  const join = require('path').join;
  const fs = require('fs');

  const options = {
    projectLocation: join(tmpDir, 'nodeshift-invalid-package-name-test')
  };

  if (!fs.existsSync(options.projectLocation)) {
    fs.mkdirSync(options.projectLocation);
  }

  // Create a temp package that has an invalid name, but extends the example JSON
  fs.writeFileSync(
    join(options.projectLocation, 'package.json'),
    JSON.stringify(
      Object.assign(
        {},
        require('../../examples/sample-project/package.json'),
        {
          name: '@invalid-package-name'
        }
      )
    )
  );

  nodeshiftConfig(options).catch((err) => {
    t.equal(err.message.includes('"name" in package.json can only consist lower-case letters, numbers, and dashes. It must start with a letter and can\'t end with a -.'), true);
    t.end();
  });
});

test('nodeshift-config options configLocation', (t) => {
  const options = {
    configLocation: '../examples/sample-project'
  };

  const nodeshiftConfig = proxyquire('../../lib/config/nodeshift-config', {
    'openshift-rest-client': {
      OpenshiftClient: (settings) => {
        t.equal(settings.config, options.configLocation, 'should be passed in');
        return Promise.resolve({
          kubeconfig: {
            getCurrentContext: () => {
              return 'nodey/ip/other';
            },
            getCurrentCluster: () => {
              return { server: 'http://mock-cluster' };
            },
            getContexts: () => {
              return [{ name: 'nodey/ip/other', namespace: 'test-namespace' }];
            }
          }
        });
      }
    }
  });

  nodeshiftConfig(options).then((config) => {
    t.pass();
    t.end();
  });
});

test('nodeshift-config options for the config loader - change the namespace', (t) => {
  const nodeshiftConfig = proxyquire('../../lib/config/nodeshift-config', {
    'openshift-rest-client': {
      OpenshiftClient: () => {
        return Promise.resolve({
          kubeconfig: {
            getCurrentContext: () => {
              return 'nodey/ip/other';
            },
            getCurrentCluster: () => {
              return { server: 'http://mock-cluster' };
            },
            getContexts: () => {
              return [{ name: 'nodey/ip/other', namespace: 'test-namespace' }];
            }
          }
        });
      }
    }
  });

  const options = {
    namespace: {
      name: 'foo'
    }
  };

  nodeshiftConfig(options).then((config) => {
    t.equal(config.namespace, options.namespace, 'namespace should be changed');
    t.equal(config.namespace.name, options.namespace.name, 'context and options namespace should be the same');
    t.end();
  });
});

test('nodeshift-config options for the config loader - change the namespace, format correctly', (t) => {
  const nodeshiftConfig = proxyquire('../../lib/config/nodeshift-config', {
    'openshift-rest-client': {
      OpenshiftClient: () => {
        return Promise.resolve({
          kubeconfig: {
            getCurrentContext: () => {
              return 'nodey/ip/other';
            },
            getCurrentCluster: () => {
              return { server: 'http://mock-cluster' };
            },
            getContexts: () => {
              return [{ name: 'nodey/ip/other', namespace: 'test-namespace' }];
            }
          }
        });
      }
    }
  });

  const options = {
    namespace: {
      name: 'New Project'
    }
  };

  nodeshiftConfig(options).then((config) => {
    t.equal(config.namespace.name, 'newproject', 'context and options namespace should be the same');
    t.end();
  });
});

test('nodeshift-config options for the config loader - use namspace object format, no name', (t) => {
  const nodeshiftConfig = proxyquire('../../lib/config/nodeshift-config', {
    'openshift-rest-client': {
      OpenshiftClient: () => {
        return Promise.resolve({
          kubeconfig: {
            getCurrentContext: () => {
              return 'nodey/ip/other';
            },
            getCurrentCluster: () => {
              return { server: 'http://mock-cluster' };
            },
            getContexts: () => {
              return [{ name: 'nodey/ip/other', namespace: 'test-namespace' }];
            }
          }
        });
      }
    }
  });

  const options = {
    namespace: {
      displayName: 'This should Error'
    }
  };

  nodeshiftConfig(options).catch((err) => {
    t.equal('namespace.name must be specified when using the --namespace flag', err.message, 'should have the name error message');
    t.end();
  });
});

test('nodeshift-config options for the config loader - using namespace object format', (t) => {
  const nodeshiftConfig = proxyquire('../../lib/config/nodeshift-config', {
    'openshift-rest-client': {
      OpenshiftClient: () => {
        return Promise.resolve({
          kubeconfig: {
            getCurrentContext: () => {
              return 'nodey/ip/other';
            },
            getCurrentCluster: () => {
              return { server: 'http://mock-cluster' };
            },
            getContexts: () => {
              return [{ name: 'nodey/ip/other', namespace: 'test-namespace' }];
            }
          }
        });
      }
    }
  });

  const options = {
    namespace: {
      displayName: 'New Project',
      name: 'Fun Project'
    }
  };

  nodeshiftConfig(options).then((config) => {
    t.equal(config.namespace.name, 'funproject', 'context and options namespace should be the same');
    t.equal(config.namespace.userDefined, true, 'should have the user defined variable');
    t.equal(config.namespace.displayName, options.namespace.displayName, 'should have the displayName');
    t.end();
  });
});

test('nodeshift-config options - change outputImageStreamTag and outputImageStreamName', (t) => {
  const nodeshiftConfig = proxyquire('../../lib/config/nodeshift-config', {
    'openshift-rest-client': {
      OpenshiftClient: () => {
        return Promise.resolve({
          kubeconfig: {
            getCurrentContext: () => {
              return 'nodey/ip/other';
            },
            getCurrentCluster: () => {
              return { server: 'http://mock-cluster' };
            },
            getContexts: () => {
              return [{ name: 'nodey/ip/other', namespace: 'test-namespace' }];
            }
          }
        });
      }
    }
  });

  const options = {
    outputImageStreamName: 'funTimes',
    outputImageStreamTag: 'notLatest'
  };

  nodeshiftConfig(options).then((config) => {
    t.equal(config.outputImageStreamTag, options.outputImageStreamTag, 'should not be latest');
    t.equal(config.outputImageStreamName, options.outputImageStreamName, 'should not be the project name');
    t.end();
  });
});

test('nodeshift-config options - not recognized build strategy', (t) => {
  const nodeshiftConfig = proxyquire('../../lib/config/nodeshift-config', {
    'openshift-rest-client': {
      OpenshiftClient: () => {
        return Promise.resolve({
          kubeconfig: {
            getCurrentContext: () => {
              return 'nodey/ip/other';
            },
            getCurrentCluster: () => {
              return { server: 'http://mock-cluster' };
            },
            getContexts: () => {
              return [{ name: 'nodey/ip/other', namespace: 'test-namespace' }];
            }
          }
        });
      }
    }
  });

  const options = {
    build: {
      strategy: 'CustomStrat'
    }
  };

  nodeshiftConfig(options).then((config) => {
    t.equal(config.build.strategy, 'Source', 'should be Source');
    t.end();
  });
});

test('nodeshift-config basic setup kube option', (t) => {
  const nodeshiftConfig = proxyquire('../../lib/config/nodeshift-config', {
    './kubernetes-config': () => {
      t.pass();
      return Promise.resolve();
    },
    './docker-config': () => {
      t.pass();
      return Promise.resolve();
    },
    'openshift-rest-client': {
      OpenshiftClient: () => {
        return Promise.resolve({
          kubeconfig: {
            getCurrentContext: () => {
              return 'nodey/ip/other';
            },
            getCurrentCluster: () => {
              return { server: 'http://mock-cluster' };
            },
            getContexts: () => {
              return [{ name: 'nodey/ip/other' }];
            }
          }
        });
      }
    }
  });

  const options = {
    kube: true
  };

  const p = nodeshiftConfig(options).then((config) => {
    t.equal(config.namespace.name, 'default', 'Kube flag uses default by default');
    t.end();
  }).catch(t.fail);

  t.equal(p instanceof Promise, true, 'should return a Promise');
});
