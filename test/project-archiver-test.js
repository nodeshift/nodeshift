'use strict';

const test = require('tape');
const proxyquire = require('proxyquire');

test('test default build location', (t) => {
  const projectArchiver = require('../lib/project-archiver');
  t.equals(projectArchiver.DEFAULT_BUILD_LOCATION, 'tmp/nodeshift/build', 'tmp/nodeshift/build should be the default directory');
  t.end();
});

test('test cleanup function', (t) => {
  const projectArchiver = proxyquire('../lib/project-archiver', {
    './helpers': {
      createDir: () => {
        return Promise.resolve();
      },
      cleanUp: () => {
        return Promise.resolve();
      },
      listFiles: () => {
        return Promise.resolve([]);
      }
    },
    tar: {
      create: () => {
        return Promise.resolve();
      }
    }
  });

  const config = {
    projectPackage: {}
  };

  projectArchiver.archiveAndTar(config).then(() => {
    t.pass('should cleanup stuff');
    t.end();
  });
});

test('test cleanup function - failure', (t) => {
  const projectArchiver = proxyquire('../lib/project-archiver', {
    './helpers': {
      cleanUp: () => {
        return Promise.reject(new Error('error'));
      }
    }
  });

  projectArchiver.archiveAndTar({}).catch(() => {
    t.pass('should fail with error');
    t.end();
  });
});

test('test error with create dir function', (t) => {
  const projectArchiver = proxyquire('../lib/project-archiver', {
    './helpers': {
      createDir: () => {
        return Promise.reject(new Error('error creating directory'));
      },
      cleanUp: () => {
        return Promise.resolve();
      },
      listFiles: () => {
        return Promise.resolve([]);
      }
    }
  });

  const config = {
    projectPackage: {}
  };

  projectArchiver.archiveAndTar(config).catch((err) => {
    t.equals(err.message, 'error creating directory');
    t.end();
  });
});

test('test no file prop, exclude stuff', (t) => {
  const projectArchiver = proxyquire('../lib/project-archiver', {
    './helpers': {
      createDir: () => {
        return Promise.resolve();
      },
      cleanUp: () => {
        return Promise.resolve();
      },
      listFiles: () => {
        return Promise.resolve(['node_modules', '.git', 'tmp', 'file1', 'other']);
      }
    },
    tar: {
      create: (obj, files) => {
        t.equal(files.length, 2, 'should only have 2 values');
        t.ok(!files.includes('node_modules'), 'should not include node_modules');
        t.ok(!files.includes('.git'), 'should not include .git');
        t.ok(!files.includes('tmp'), 'should not include tmp');
        return Promise.resolve();
      }
    }
  });

  const config = {
    projectPackage: {}
  };

  projectArchiver.archiveAndTar(config).then(() => {
    t.pass('should resolve');
    t.end();
  });
});

test('test logger warning if no files prop', (t) => {
  const projectArchiver = proxyquire('../lib/project-archiver', {
    './helpers': {
      createDir: () => {
        return Promise.resolve();
      },
      cleanUp: () => {
        return Promise.resolve();
      },
      listFiles: () => {
        return Promise.resolve([]);
      }
    },
    tar: {
      create: () => {
        return Promise.resolve();
      }
    },
    './common-log': () => {
      return {
        warning: (warning) => {
          t.equal(warning, 'a file property was not found in your package.json, archiving the current directory.');
          return warning;
        },
        info: info => info
      };
    }
  });

  const config = {
    projectPackage: {}
  };

  projectArchiver.archiveAndTar(config).then(() => {
    t.pass('should resolve');
    t.end();
  });
});

test('test logger warning if some files don\'t exist', (t) => {
  const projectArchiver = proxyquire('../lib/project-archiver', {
    tar: {
      create: () => {
        return Promise.resolve();
      }
    },
    './helpers': {
      createDir: () => {
        return Promise.resolve();
      },
      cleanUp: () => {
        return Promise.resolve();
      },
      normalizeFileList: () => {
        return {
          nonexistent: ['file1', 'file2'],
          existing: ['file3']
        };
      }
    },
    './common-log': () => {
      return {
        warning: (warning) => {
          t.equal(warning, 'The following files do not exist: file1,file2');
          return warning;
        },
        info: info => info
      };
    }
  });

  const config = {
    projectPackage: {
      files: ['file1', 'file2']
    }
  };

  projectArchiver.archiveAndTar(config).then(() => {
    t.pass('should resolve');
    t.end();
  });
});

test('test logger no warning', (t) => {
  const projectArchiver = proxyquire('../lib/project-archiver', {
    tar: {
      create: () => {
        return Promise.resolve();
      }
    },
    './helpers': {
      createDir: () => {
        return Promise.resolve();
      },
      cleanUp: () => {
        return Promise.resolve();
      },
      normalizeFileList: () => {
        return {
          nonexistent: [],
          existing: ['file3']
        };
      }
    }
  });

  const config = {
    projectPackage: {
      files: ['file1', 'file2']
    }
  };

  projectArchiver.archiveAndTar(config).then(() => {
    t.pass('should resolve');
    t.end();
  });
});

test('change in project location', (t) => {
  const config = {
    projectLocation: '/this/is/a/dir',
    projectPackage: {
      files: ['file1', 'file2']
    }
  };

  const projectArchiver = proxyquire('../lib/project-archiver', {
    './helpers': {
      createDir: () => {
        return Promise.resolve();
      },
      cleanUp: () => {
        return Promise.resolve();
      },
      normalizeFileList: (files, projectLocation) => {
        t.equal(projectLocation, config.projectLocation, 'projectLocation should be here');
        console.log(projectLocation);
        return {
          nonexistent: [],
          existing: ['file3']
        };
      }
    },
    tar: {
      create: (options) => {
        t.equal(options.cwd, config.projectLocation, 'project location should be here');
        t.equal(options.file, '/this/is/a/dir/tmp/nodeshift/build/archive.tar', 'project location should be on the path');
        return Promise.resolve();
      }
    }
  });

  projectArchiver.archiveAndTar(config).then(() => {
    t.pass('should cleanup stuff');
    t.end();
  });
});

test('test build with kube flag - Error building image', (t) => {
  const projectArchiver = proxyquire('../lib/project-archiver', {
    './helpers': {
      createDir: () => {
        t.fail();
        return Promise.resolve();
      },
      cleanUp: () => {
        t.fail();
        return Promise.resolve();
      },
      listFiles: () => {
        return Promise.resolve([]);
      }
    },
    tar: {
      create: () => {
        t.fail();
        return Promise.resolve();
      }
    }
  });

  const config = {
    projectPackage: {},
    kube: true,
    dockerClient: {
      buildImage: (arg1, arg2, cb) => {
        return cb(new Error('error'));
      }
    }
  };

  projectArchiver.createContainer(config).then(() => {
    t.fail('This should fail if here');
    t.end();
  }).catch(() => {
    t.pass('Succesfully caught error');
    t.end();
  });
});

test('test build with kube flag ', (t) => {
  const projectArchiver = proxyquire('../lib/project-archiver', {
    './helpers': {
      createDir: () => {
        t.fail();
        return Promise.resolve();
      },
      cleanUp: () => {
        t.fail();
        return Promise.resolve();
      },
      listFiles: () => {
        return Promise.resolve([]);
      }
    },
    tar: {
      create: () => {
        t.fail();
        return Promise.resolve();
      }
    }
  });
  const { PassThrough } = require('stream');
  const mockReadable = new PassThrough();

  const config = {
    projectPackage: {},
    projectName: 'project Name',
    kube: true,
    dockerClient: {
      buildImage: (options, otherOpitons, cb) => {
        t.equal(Array.isArray(options.src), true, 'src should be an array');
        t.equal(otherOpitons.t, config.projectName, 'should be equal');
        t.equal(otherOpitons.q, false, 'verbose output is not suppressed');
        return cb(null, mockReadable);
      }
    }
  };

  setTimeout(() => {
    mockReadable.emit('data', 'beep');
    mockReadable.emit('data', '{"aux":{"ID":"sha256:85ba84706d6a68157db30baed19a376f9656aa52bd0209f788de0ccbb762e4ab"}}');
    mockReadable.emit('end');
  }, 100);

  projectArchiver.createContainer(config).then((imageId) => {
    t.equal(imageId, '85ba84706d6a68157db30baed19a376f9656aa52bd0209f788de0ccbb762e4ab');
    t.end();
  }).catch(t.fail);
});
