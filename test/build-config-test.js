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
  let call = 0;

  const config = {
    buildName: 'nodejs-s2i-build',
    projectName: 'project-name',
    version: '1.0.0',
    build: {
      strategy: 'Source'
    },
    namespace: {
      name: ''
    },
    openshiftRestClient: {
      apis: {
        build: {
          v1: {
            ns: (namespace) => {
              if (call === 0) {
                call++;
                return {
                  buildconfigs: (buildName) => {
                    return {
                      get: () => {
                        return Promise.resolve({ code: 404 });
                      }
                    };
                  }
                };
              } else {
                return {
                  buildconfigs: {
                    post: (resource) => {
                      Promise.resolve({ code: 201, body: resource.body });
                    }
                  }
                };
              }
            }
          }
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
    build: {
      strategy: 'Source'
    },
    namespace: {
      name: ''
    },
    openshiftRestClient: {
      apis: {
        build: {
          v1: {
            ns: (namespace) => {
              return {
                buildconfigs: (buildName) => {
                  return {
                    get: () => {
                      return Promise.resolve({ code: 200, body: { metadata: { name: 'buildName' } } });
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
      recreate: 'imagestream',
      strategy: 'Source'
    },
    buildName: 'nodejs-s2i-build',
    projectName: 'project-name',
    version: '1.0.0',
    namespace: {
      name: ''
    },
    openshiftRestClient: {
      apis: {
        build: {
          v1: {
            ns: (namespace) => {
              return {
                buildconfigs: (buildName) => {
                  return {
                    get: () => {
                      return Promise.resolve({ code: 200, body: { metadata: { name: 'buildName' } } });
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

  let call = 0;

  const buildConfigFunction = () => {
    return {
      get: () => {
        call++;
        return Promise.resolve({ code: 200 });
      },
      delete: () => {
        call++;
        return Promise.resolve({ code: 204 });
      }
    };
  };

  const buildConfigObject = {
    post: (resource) => {
      Promise.resolve({ code: 201, body: resource.body });
    }
  };

  const buildsFunction = () => {
    return {
      delete: () => {
        call++;
        return Promise.resolve({ code: 204 });
      }
    };
  };

  const buildsObject = {
    get: () => {
      call++;
      return Promise.resolve({ code: 200, body: { items: returnedBuilds } });
    }
  };

  const namespaceStub = (namespace) => {
    return {
      buildconfigs: (call < 5) ? buildConfigFunction : buildConfigObject,
      builds: (call === 1) ? buildsObject : buildsFunction
    };
  };

  const config = {
    build: {
      recreate: true,
      strategy: 'Source'
    },
    buildName: 'nodejs-s2i-build',
    projectName: 'project-name',
    version: '1.0.0',
    namespace: {
      name: ''
    },
    openshiftRestClient: {
      apis: {
        build: {
          v1: {
            ns: namespaceStub
          }
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

  let call = 0;

  const buildConfigFunction = () => {
    return {
      get: () => {
        call++;
        return Promise.resolve({ code: 200 });
      },
      delete: () => {
        call++;
        return Promise.resolve({ code: 204 });
      }
    };
  };

  const buildConfigObject = {
    post: (resource) => {
      Promise.resolve({ code: 201, body: resource.body });
    }
  };

  const buildsFunction = () => {
    return {
      delete: () => {
        call++;
        return Promise.resolve({ code: 204 });
      }
    };
  };

  const buildsObject = {
    get: () => {
      call++;
      return Promise.resolve({ code: 200, body: { items: returnedBuilds } });
    }
  };

  const namespaceStub = (namespace) => {
    return {
      buildconfigs: (call < 5) ? buildConfigFunction : buildConfigObject,
      builds: (call === 1) ? buildsObject : buildsFunction
    };
  };

  const config = {
    build: {
      recreate: 'true',
      strategy: 'Source'
    },
    buildName: 'nodejs-s2i-build',
    projectName: 'project-name',
    version: '1.0.0',
    namespace: {
      name: ''
    },
    openshiftRestClient: {
      apis: {
        build: {
          v1: {
            ns: namespaceStub
          }
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
