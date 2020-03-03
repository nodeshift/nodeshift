const test = require('tape');
const proxyquire = require('proxyquire');

test('test rmrf function with file', (t) => {
  const rmrf = proxyquire('../lib/utils/rmrf', {
    fs: {
      lstat: (_, cb) => cb(null, {
        isFile: () => true
      }),
      unlink: (_, cb) => cb(null),
      readdir: (_, cb) => cb(null, ['file1, file2'])
    }
  });

  rmrf('sample.log').then(() => {
    t.pass('should pass');
    t.end();
  });
});

test('test rmrf function with folder', (t) => {
  const rmrf = proxyquire('../lib/utils/rmrf', {
    fs: {
      lstat: (location, cb) => cb(null, {
        isFile: () => location === 'samples/sample.log'
      }),
      unlink: (_, cb) => cb(null),
      readdir: (_, cb) => cb(null, ['sample.log']),
      rmdir: (_, cb) => cb(null)
    }
  });

  rmrf('samples/').then(() => {
    t.pass('should pass');
    t.end();
  });
});

test('test rmrf function when file/folder not found', (t) => {
  const rmrf = proxyquire('../lib/utils/rmrf', {
    fs: {
      lstat: (_, cb) => {
        const err = new Error('File not found');
        err.code = 'ENOENT';
        cb(err, null);
      },
      unlink: (_, cb) => cb(null),
      readdir: (_, cb) => cb(null, [])
    }
  });

  rmrf('samples/').then(() => {
    t.pass('ENOENT error should not be thrown');
    t.end();
  }).catch(() => {
    t.fail('ENOENT error should not be thrown');
  });
});

test('test rmrf function when file is busy', (t) => {
  const rmrf = proxyquire('../lib/utils/rmrf', {
    fs: {
      lstat: (_, cb) => cb(null, {
        isFile: () => true
      }),
      unlink: (_, cb) => {
        console.log('Running unlink...');
        const err = new Error('File is busy');
        err.code = 'EBUSY';
        cb(err, null);
      },
      readdir: (_, cb) => cb(null, [])
    }
  });

  rmrf('sample.log').then(() => {
    t.fail('EBUSY error should be thrown');
    t.end();
  }).catch(() => {
    t.pass('EBUSY error should be thrown');
    t.end();
  });
});
