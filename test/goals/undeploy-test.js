'use strict';

const test = require('tape');
const proxyquire = require('proxyquire');

test('undeploy goal', (t) => {
  const undeploy = require('../../lib/goals/undeploy');

  t.equal(typeof undeploy, 'function', 'should export a function');
  t.end();
});

test('return list with no items', (t) => {
  const undeploy = proxyquire('../../lib/goals/undeploy', {
    fs: {
      readFile: (location, cb) => { return cb(null, '{}'); }
    }
  });

  undeploy({}).then(() => {
    t.pass('this should pass');
    t.end();
  });
});

test('return list error', (t) => {
  const undeploy = proxyquire('../../lib/goals/undeploy', {
    fs: {
      readFile: (location, cb) => { return cb(new Error('no file found'), null); }
    }
  });

  undeploy({}).then(() => {
    t.fail();
  }).catch(() => {
    t.pass('this should pass');
    t.end();
  });
});

test('return list items', (t) => {
  const metadata = {
    name: 'projectName'
  };

  const resourceList = {
    kind: 'List',
    items: [
      {
        kind: 'Route',
        metadata: metadata
      },
      {
        kind: 'Service',
        metadata: metadata
      },
      {
        kind: 'Secret',
        metadata: metadata
      },
      {
        kind: 'DeploymentConfig',
        metadata: metadata
      },
      {
        kind: 'Ingress',
        metadata: metadata
      },
      {
        kind: 'ConfigMap',
        metadata: metadata
      }
    ]
  };

  const config = {
    projectName: 'project name',
    openshiftRestClient: {
      routes: {
        remove: (name) => {
          t.equal(name, metadata.name, 'name should be equal');
          return Promise.resolve();
        }
      },
      services: {
        remove: (name) => {
          t.equal(name, metadata.name, 'name should be equal');
          return Promise.resolve();
        }
      },
      configmaps: {
        remove: (name) => {
          t.equal(name, metadata.name, 'name should be equal');
          return Promise.resolve();
        }
      },
      ingress: {
        remove: (name) => {
          t.equal(name, metadata.name, 'name should be equal');
          return Promise.resolve();
        }
      },
      secrets: {
        remove: (name) => {
          t.equal(name, metadata.name, 'name should be equal');
          return Promise.resolve();
        }
      }
    }
  };

  const undeploy = proxyquire('../../lib/goals/undeploy', {
    fs: {
      readFile: (location, cb) => { return cb(null, JSON.stringify(resourceList)); }
    },
    '../deployment-config': {
      undeploy: () => { return Promise.resolve(); }
    }
  });

  undeploy(config).then(() => {
    t.pass('this should pass');
    t.end();
  });
});

test('return list items that do not match the item kind', (t) => {
  const metadata = {
    name: 'projectName'
  };

  const resourceList = {
    kind: 'List',
    items: [
      {
        kind: 'Other',
        metadata: metadata
      }
    ]
  };

  const config = {
    projectName: 'project name'
  };

  const undeploy = proxyquire('../../lib/goals/undeploy', {
    fs: {
      readFile: (location, cb) => { return cb(null, JSON.stringify(resourceList)); }
    },
    '../deployment-config': {
      undeploy: () => { return Promise.resolve(); }
    },
    '../common-log': () => {
      return {
        info: info => info,
        error: error => error,
        warning: (warning) => {
          t.equal(warning, 'Other is not recognized');
          return warning;
        }
      };
    }
  });

  undeploy(config).then(() => {
    t.pass('this should pass');
    t.end();
  });
});

test('remove build and image stream', (t) => {
  t.plan(3);
  const config = {
    removeAll: true
  };

  const resourceList = {
    kind: 'List',
    items: []
  };

  const undeploy = proxyquire('../../lib/goals/undeploy', {
    fs: {
      readFile: (location, cb) => { return cb(null, JSON.stringify(resourceList)); }
    },
    '../deployment-config': {
      undeploy: () => { return Promise.resolve(); }
    },
    '../build-config': {
      removeBuildsAndBuildConfig: () => {
        t.pass('should land here');
      }
    },
    '../image-stream': {
      removeImageStream: () => {
        t.pass('should land here');
      }
    }
  });

  undeploy(config).then(() => {
    t.pass('this should pass');
    t.end();
  });
});
