'use strict';

const test = require('tape');
const proxyquire = require('proxyquire');

test('basic imagestream module specs', (t) => {
  const imageStream = require('../lib/image-stream');
  t.ok(imageStream.createOrUpdateImageStream, 'should have a createOrUpdateImageStream');
  t.equals(typeof imageStream.createOrUpdateImageStream, 'function', 'should be a function');
  t.end();
});

test('create imageStream not found', (t) => {
  let call = 0;
  const config = {
    projectName: 'project-name',
    outputImageStreamName: 'project-name',
    namespace: {
      name: ''
    },
    openshiftRestClient: {
      apis: {
        image: {
          v1: {
            ns: (namespace) => {
              if (call === 0) {
                call++;
                return {
                  imagestreams: (projectName) => {
                    return {
                      get: () => {
                        return Promise.resolve({ code: 404 });
                      }
                    };
                  }
                };
              } else {
                return {
                  imagestreams: {
                    post: (imageStream) => {
                      Promise.resolve({ code: 201, body: imageStream });
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

  const imageStream = proxyquire('../lib/image-stream', {
    './common-log': () => {
      return {
        info: (info) => {
          t.equal(info, 'creating image stream project-name', 'should have the correct info message');
          return info;
        }
      };
    }
  });

  imageStream.createOrUpdateImageStream(config).then((imageStream) => {
    t.end();
  });
});

test('buildConfig found - no recreate', (t) => {
  const config = {
    buildName: 'nodejs-s2i-build',
    projectName: 'project-name',
    outputImageStreamName: 'project-name',
    version: '1.0.0',
    namespace: {
      name: ''
    },
    openshiftRestClient: {
      apis: {
        image: {
          v1: {
            ns: (namespace) => {
              return {
                imagestreams: (projectName) => {
                  return {
                    get: () => {
                      return Promise.resolve({ code: 200, body: { metadata: { name: 'imagestream' } } });
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

  const imageStream = proxyquire('../lib/image-stream', {
    './common-log': () => {
      return {
        info: (info) => {
          t.equal(info, 'using existing image stream project-name', 'should have the correct info message');
          return info;
        }
      };
    }
  });

  imageStream.createOrUpdateImageStream(config).then((imageStream) => {
    t.end();
  });
});

test('imagestream recreate but is a buildConfig', (t) => {
  const config = {
    build: {
      recreate: 'buildconfig'
    },
    buildName: 'nodejs-s2i-build',
    projectName: 'project-name',
    outputImageStreamName: 'project-name',
    version: '1.0.0',
    namespace: {
      name: ''
    },
    openshiftRestClient: {
      apis: {
        image: {
          v1: {
            ns: (namespace) => {
              return {
                imagestreams: (projectName) => {
                  return {
                    get: () => {
                      return Promise.resolve({ code: 200, body: { metadata: { name: 'imagestream' } } });
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

  const imageStream = proxyquire('../lib/image-stream', {
    './common-log': () => {
      return {
        info: (info) => {
          t.equal(info, 'using existing image stream project-name', 'should have the correct info message');
          return info;
        }
      };
    }
  });

  imageStream.createOrUpdateImageStream(config).then((imageStream) => {
    t.end();
  });
});

test('imagestream recreate true', (t) => {
  let call = 0;

  const config = {
    build: {
      recreate: true
    },
    buildName: 'nodejs-s2i-build',
    projectName: 'project-name',
    version: '1.0.0',
    namespace: {
      name: ''
    },
    openshiftRestClient: {
      apis: {
        image: {
          v1: {
            ns: (namespace) => {
              if (call < 2) {
                call++;
                return {
                  imagestreams: (projectName) => {
                    return {
                      get: () => {
                        return Promise.resolve({ code: 200, body: { metadata: { name: 'imagestream' } } });
                      },
                      delete: () => {
                        return Promise.resolve({ code: 204 });
                      }
                    };
                  }
                };
              } else {
                return {
                  imagestreams: {
                    post: (imageStream) => {
                      Promise.resolve({ code: 201, body: imageStream });
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

  const imageStream = proxyquire('../lib/image-stream', {
  });

  imageStream.createOrUpdateImageStream(config).then((imageStream) => {
    t.pass();
    t.end();
  });
});

test('imagestream recreate true with "true"', (t) => {
  t.plan(2);

  let call = 0;

  const config = {
    build: {
      recreate: 'true'
    },
    buildName: 'nodejs-s2i-build',
    projectName: 'project-name',
    version: '1.0.0',
    namespace: {
      name: ''
    },
    openshiftRestClient: {
      apis: {
        image: {
          v1: {
            ns: (namespace) => {
              if (call < 2) {
                call++;
                return {
                  imagestreams: (projectName) => {
                    return {
                      get: () => {
                        return Promise.resolve({ code: 200, body: { metadata: { name: 'imagestream' } } });
                      },
                      delete: () => {
                        t.pass();
                        return Promise.resolve({ code: 204 });
                      }
                    };
                  }
                };
              } else {
                return {
                  imagestreams: {
                    post: (imageStream) => {
                      Promise.resolve({ code: 201, body: imageStream });
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

  const imageStream = proxyquire('../lib/image-stream', {
  });

  imageStream.createOrUpdateImageStream(config).then((imageStream) => {
    t.pass();
    t.end();
  });
});
