'use strict';

const test = require('tape');
const proxyquire = require('proxyquire');

test('basic build-config module specs', (t) => {
  const buildConfig = require('../lib/build-config');
  t.ok(buildConfig.createOrUpdateBuildConfig, 'should have a createOrUpdateBuildConfig');
  t.equals(typeof buildConfig.createOrUpdateBuildConfig, 'function', 'should be a function');
  t.end();
});

test('create buildConfig not found', (t) => {
  const config = {
    buildName: 'nodejs-s2i-build',
    projectName: 'project-name',
    version: '1.0.0',
    context: {
      namespace: ''
    },
    openshiftRestClient: {
      buildconfigs: {
        find: (buildName) => {
          return Promise.resolve({ code: 404 });
        },
        create: (buildConfig) => {
          return Promise.resolve(buildConfig);
        }
      }
    }
  };

  const buildConfig = proxyquire('../lib/build-config', {
    './common-log': () => {
      return {
        info: (info) => {
          t.equal(info, 'creating build configuration nodejs-s2i-build', 'should have the correct info message');
          return info;
        }
      };
    }
  });

  buildConfig.createOrUpdateBuildConfig(config).then((buildConfig) => {
    t.end();
  });
});

test('buildConfig found - no recreate', (t) => {
  const config = {
    buildName: 'nodejs-s2i-build',
    projectName: 'project-name',
    version: '1.0.0',
    context: {
      namespace: ''
    },
    openshiftRestClient: {
      buildconfigs: {
        find: (buildName) => {
          return Promise.resolve({ code: 200 });
        }
      }
    }
  };

  const buildConfig = proxyquire('../lib/build-config', {
    './common-log': () => {
      return {
        info: (info) => {
          t.equal(info, 'using existing build configuration nodejs-s2i-build', 'should have the correct info message');
          return info;
        }
      };
    }
  });

  buildConfig.createOrUpdateBuildConfig(config).then((buildConfig) => {
    t.end();
  });
});

test('build recreate but is an imagestream', (t) => {
  const config = {
    build: {
      recreate: 'imagestream'
    },
    buildName: 'nodejs-s2i-build',
    projectName: 'project-name',
    version: '1.0.0',
    context: {
      namespace: ''
    },
    openshiftRestClient: {
      buildconfigs: {
        find: (buildName) => {
          return Promise.resolve({ code: 200 });
        }
      }
    }
  };

  const buildConfig = proxyquire('../lib/build-config', {
    './common-log': () => {
      return {
        info: (info) => {
          t.equal(info, 'using existing build configuration nodejs-s2i-build', 'should have the correct info message');
          return info;
        }
      };
    }
  });

  buildConfig.createOrUpdateBuildConfig(config).then((buildConfig) => {
    t.end();
  });
});

test('build recreate true with removing builds', (t) => {
  const returnedBuilds = [
    {
      kind: 'Build',
      metadata: {
        name: 'build1'
      }
    },
    {
      kind: 'Build',
      metadata: {
        name: 'build2'
      }
    }
  ];

  const config = {
    build: {
      recreate: true
    },
    buildName: 'nodejs-s2i-build',
    projectName: 'project-name',
    version: '1.0.0',
    context: {
      namespace: ''
    },
    openshiftRestClient: {
      builds: {
        findAll: () => {
          return Promise.resolve({ items: returnedBuilds });
        },
        remove: (buildName) => {
          return Promise.resolve();
        }
      },
      buildconfigs: {
        find: (buildName) => {
          return Promise.resolve({ code: 200 });
        },
        remove: (buildName, options) => {
          return Promise.resolve();
        },
        create: (buildConfig) => {
          return Promise.resolve(buildConfig);
        }
      }
    }
  };

  const buildConfig = proxyquire('../lib/build-config', {
  });

  buildConfig.createOrUpdateBuildConfig(config).then((buildConfig) => {
    t.pass();
    t.end();
  });
});

test('build recreate true with removing builds with "true"', (t) => {
  t.plan(4);
  const returnedBuilds = [
    {
      kind: 'Build',
      metadata: {
        name: 'build1'
      }
    },
    {
      kind: 'Build',
      metadata: {
        name: 'build2'
      }
    }
  ];

  const config = {
    build: {
      recreate: 'true'
    },
    buildName: 'nodejs-s2i-build',
    projectName: 'project-name',
    version: '1.0.0',
    context: {
      namespace: ''
    },
    openshiftRestClient: {
      builds: {
        findAll: () => {
          t.pass();
          return Promise.resolve({ items: returnedBuilds });
        },
        remove: (buildName) => {
          t.pass();
          return Promise.resolve();
        }
      },
      buildconfigs: {
        find: (buildName) => {
          return Promise.resolve({ code: 200 });
        },
        remove: (buildName, options) => {
          return Promise.resolve();
        },
        create: (buildConfig) => {
          return Promise.resolve(buildConfig);
        }
      }
    }
  };

  const buildConfig = proxyquire('../lib/build-config', {
  });

  buildConfig.createOrUpdateBuildConfig(config).then((buildConfig) => {
    t.pass();
    t.end();
  });
});
