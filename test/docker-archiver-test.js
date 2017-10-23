'use strict';

const test = require('tape');
const proxyquire = require('proxyquire');

// TODO: test the changing of BUILD LOCATION

test('test default build location', (t) => {
  const dockerArchiver = require('../lib/docker-archiver');
  t.equals(dockerArchiver.DEFAULT_BUILD_LOCATION, 'tmp/nodeshift/build', 'tmp/nodeshift/build should be the default directory');
  t.end();
});

test('test cleanup function', (t) => {
  const dockerArchiver = proxyquire('../lib/docker-archiver', {
    rimraf: (dir, cb) => {
      return cb();
    },
    mkdirp: (dir, cb) => {
      return cb();
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

  dockerArchiver.archiveAndTar(config).then(() => {
    t.pass('should cleanup stuff');
    t.end();
  });
});

test('test cleanup function - failure', (t) => {
  const dockerArchiver = proxyquire('../lib/docker-archiver', {
    rimraf: (dir, cb) => {
      return cb(new Error('error'));
    }
  });

  dockerArchiver.archiveAndTar({}).catch(() => {
    t.pass('should fail with error');
    t.end();
  });
});

test('test error with create dir function', (t) => {
  const dockerArchiver = proxyquire('../lib/docker-archiver', {
    rimraf: (dir, cb) => {
      return cb();
    },
    mkdirp: (dir, cb) => {
      return cb(new Error('error creating directory'));
    }
  });

  const config = {
    projectPackage: {}
  };

  dockerArchiver.archiveAndTar(config).catch((err) => {
    t.equals(err.message, 'Error: error creating directory');
    t.end();
  });
});

test('test logger warning if no files prop', (t) => {
  const dockerArchiver = proxyquire('../lib/docker-archiver', {
    rimraf: (dir, cb) => {
      return cb();
    },
    mkdirp: (dir, cb) => {
      return cb();
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

  dockerArchiver.archiveAndTar(config).then(() => {
    t.pass('should resolve');
    t.end();
  });
});

test('test logger warning if some files don\'t exist', (t) => {
  const dockerArchiver = proxyquire('../lib/docker-archiver', {
    rimraf: (dir, cb) => {
      return cb();
    },
    mkdirp: (dir, cb) => {
      return cb();
    },
    tar: {
      create: () => {
        return Promise.resolve();
      }
    },
    './helpers': {
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

  dockerArchiver.archiveAndTar(config).then(() => {
    t.pass('should resolve');
    t.end();
  });
});

test('test logger no warning', (t) => {
  const dockerArchiver = proxyquire('../lib/docker-archiver', {
    rimraf: (dir, cb) => {
      return cb();
    },
    mkdirp: (dir, cb) => {
      return cb();
    },
    tar: {
      create: () => {
        return Promise.resolve();
      }
    },
    './helpers': {
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

  dockerArchiver.archiveAndTar(config).then(() => {
    t.pass('should resolve');
    t.end();
  });
});
