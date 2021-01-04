'use strict';

const test = require('tape');
const proxyquire = require('proxyquire');

test('export test', (t) => {
  const cli = require('../bin/cli');

  t.equal(typeof cli, 'function', 'cli should be a function');
  t.end();
});

test('default goal', (t) => {
  const cli = proxyquire('../bin/cli', {
    '../lib/config/nodeshift-config': () => {
      return Promise.resolve({});
    },
    '../lib/goals/resource': (config) => {
      t.pass('should be here for the default goal');
      return Promise.resolve();
    },
    '../lib/goals/build': (config) => {
      t.pass('should be here for the default goal');
      return Promise.resolve();
    },
    '../lib/goals/apply-resources': (config) => {
      t.pass('should be here for the default goal');
      return Promise.resolve();
    }
  });

  cli({ cmd: 'deploy' }).then(() => {
    t.end();
  });
});

test('default goal - using kube flag', (t) => {
  const cli = proxyquire('../bin/cli', {
    '../lib/config/nodeshift-config': () => {
      return Promise.resolve({});
    },
    '../lib/goals/resource': (config) => {
      t.pass('should be here for the default goal');
      return Promise.resolve();
    },
    '../lib/goals/build': (config) => {
      t.pass('should be here for the default goal');
      return Promise.resolve();
    },
    '../lib/goals/apply-resources': (config) => {
      t.pass('should be here for the default goal');
      return Promise.resolve();
    },
    '../lib/kube-url': (config) => {
      t.pass('should be here for the apply-resource goal');
    }
  });

  cli({ cmd: 'deploy', kube: true }).then(() => {
    t.end();
  });
});

test('default goal - with namespace', (t) => {
  const cli = proxyquire('../bin/cli', {
    '../lib/config/nodeshift-config': () => {
      return Promise.resolve({ namespace: { create: true } });
    },
    '../lib/goals/resource': (config) => {
      t.pass('should be here for the default goal');
      return Promise.resolve();
    },
    '../lib/goals/build': (config) => {
      t.pass('should be here for the default goal');
      return Promise.resolve();
    },
    '../lib/namespace': {
      create: (config) => {
        t.pass('should be here for the default goal');
        return Promise.resolve();
      }
    },
    '../lib/goals/apply-resources': (config) => {
      t.pass('should be here for the default goal');
      return Promise.resolve();
    }
  });

  cli({ cmd: 'deploy' }).then(() => {
    t.end();
  });
});

test('resource goal', (t) => {
  const cli = proxyquire('../bin/cli', {
    '../lib/config/nodeshift-config': () => {
      return Promise.resolve({});
    },
    '../lib/goals/resource': (config) => {
      t.pass('should be here for the resource goal');
      return Promise.resolve();
    },
    '../lib/goals/build': (config) => {
      t.fail('should not be here for the resource goal');
      return Promise.resolve();
    },
    '../lib/goals/apply-resources': (config) => {
      t.fail('should not be here for the resource goal');
      return Promise.resolve();
    }
  });

  cli({ cmd: 'resource' }).then(() => {
    t.end();
  });
});

test('apply-resource goal', (t) => {
  const cli = proxyquire('../bin/cli', {
    '../lib/config/nodeshift-config': () => {
      return Promise.resolve({});
    },
    '../lib/goals/resource': (config) => {
      t.pass('should be here for the apply-resource goal');
      return Promise.resolve();
    },
    '../lib/goals/build': (config) => {
      t.fail('should not be here for the apply-resource goal');
      return Promise.resolve();
    },
    '../lib/goals/apply-resources': (config) => {
      t.pass('should be here for the apply-resource goal');
      return Promise.resolve();
    }
  });

  cli({ cmd: 'apply-resource' }).then(() => {
    t.end();
  });
});

test('apply-resource goal - kube flag', (t) => {
  const cli = proxyquire('../bin/cli', {
    '../lib/config/nodeshift-config': () => {
      return Promise.resolve({});
    },
    '../lib/goals/resource': (config) => {
      t.pass('should be here for the apply-resource goal');
      return Promise.resolve();
    },
    '../lib/goals/build': (config) => {
      t.fail('should not be here for the apply-resource goal');
      return Promise.resolve();
    },
    '../lib/goals/apply-resources': (config) => {
      t.pass('should be here for the apply-resource goal');
      return Promise.resolve();
    },
    '../lib/kube-url': (config) => {
      t.pass('should be here for the apply-resource goal');
    }
  });

  cli({ cmd: 'apply-resource', kube: true }).then(() => {
    t.end();
  });
});

test('no goal', (t) => {
  const cli = proxyquire('../bin/cli', {
    '../lib/config/nodeshift-config': () => {
      return Promise.resolve({});
    },
    '../lib/goals/resource': (config) => {
      t.fail('should not be here for the no goal');
      return Promise.resolve();
    },
    '../lib/goals/build': (config) => {
      t.fail('should not be here for the no goal');
      return Promise.resolve();
    },
    '../lib/goals/apply-resources': (config) => {
      t.fail('should not be here for the no goal');
      return Promise.resolve();
    }
  });

  cli({}).catch((err) => {
    t.equal(err.message, 'Unexpected command: undefined', 'should have this error message');
    t.end();
  });
});

test('undeploy goal', (t) => {
  const cli = proxyquire('../bin/cli', {
    '../lib/config/nodeshift-config': () => {
      return Promise.resolve({});
    },
    '../lib/goals/resource': (config) => {
      t.fail('should not be here for the undeploy goal');
      return Promise.resolve();
    },
    '../lib/goals/build': (config) => {
      t.fail('should not be here for the undeploy goal');
      return Promise.resolve();
    },
    '../lib/goals/apply-resources': (config) => {
      t.fail('should not be here for the undeploy goal');
      return Promise.resolve();
    },
    '../lib/goals/undeploy': (config) => {
      t.pass('should be here for the undeploy goal');
      return Promise.resolve();
    }
  });

  cli({ cmd: 'undeploy' }).then(() => {
    t.end();
  });
});

test('undeploy goal - with namespace', (t) => {
  const cli = proxyquire('../bin/cli', {
    '../lib/config/nodeshift-config': () => {
      return Promise.resolve({ namespace: { remove: true } });
    },
    '../lib/goals/resource': (config) => {
      t.fail('should not be here for the undeploy goal');
      return Promise.resolve();
    },
    '../lib/goals/build': (config) => {
      t.fail('should not be here for the undeploy goal');
      return Promise.resolve();
    },
    '../lib/goals/apply-resources': (config) => {
      t.fail('should not be here for the undeploy goal');
      return Promise.resolve();
    },
    '../lib/namespace': {
      remove: (config) => {
        t.pass('should be here for the undeploy goal');
        return Promise.resolve();
      }
    },
    '../lib/goals/undeploy': (config) => {
      t.pass('should be here for the undeploy goal');
      return Promise.resolve();
    }
  });

  cli({ cmd: 'undeploy' }).then(() => {
    t.end();
  });
});

test('build goal', (t) => {
  const cli = proxyquire('../bin/cli', {
    '../lib/config/nodeshift-config': () => {
      return Promise.resolve({});
    },
    '../lib/goals/resource': (config) => {
      t.fail('should not be here for the build goal');
      return Promise.resolve();
    },
    '../lib/goals/build': (config) => {
      t.pass('should be here for the build goal');
      return Promise.resolve();
    },
    '../lib/goals/apply-resources': (config) => {
      t.fail('should not be here for the build goal');
      return Promise.resolve();
    },
    '../lib/goals/undeploy': (config) => {
      t.fail('should not be here for the build goal');
      return Promise.resolve();
    }
  });

  cli({ cmd: 'build' }).then(() => {
    t.end();
  });
});

test('build goal - with namespace', (t) => {
  const cli = proxyquire('../bin/cli', {
    '../lib/config/nodeshift-config': () => {
      return Promise.resolve({ namespace: { create: true } });
    },
    '../lib/goals/resource': (config) => {
      t.fail('should not be here for the build goal');
      return Promise.resolve();
    },
    '../lib/goals/build': (config) => {
      t.pass('should be here for the build goal');
      return Promise.resolve();
    },
    '../lib/namespace': {
      create: (config) => {
        t.pass('should be here for the build goal');
        return Promise.resolve();
      }
    },
    '../lib/goals/apply-resources': (config) => {
      t.fail('should not be here for the build goal');
      return Promise.resolve();
    },
    '../lib/goals/undeploy': (config) => {
      t.fail('should not be here for the build goal');
      return Promise.resolve();
    }
  });

  cli({ cmd: 'build' }).then(() => {
    t.end();
  });
});

test('error', (t) => {
  const cli = proxyquire('../bin/cli', {
    '../lib/config/nodeshift-config': () => {
      return Promise.reject(new Error('error'));
    }
  });

  cli({ cmd: 'build' }).catch((err) => {
    t.equal(err.message, 'error', 'should have an error message');
    t.end();
  });
});
