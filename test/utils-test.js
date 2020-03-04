const test = require('tape');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

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

test('test rmrf function when file not found', (t) => {
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

  rmrf('sample.log').then(() => {
    t.pass('ENOENT error should not be thrown');
    t.end();
  }).catch(() => {
    t.fail('ENOENT error should not be thrown');
  });
});

test('test rmrf function when file is locked but then available', (t) => {
  const unlinkStub = sinon.stub();

  unlinkStub.onCall(0).callsArgWith(1, { code: 'EPERM' });
  unlinkStub.onCall(1).callsArgWith(1, { code: 'EPERM' });
  unlinkStub.onCall(2).callsArgWith(1, { code: 'EPERM' });
  unlinkStub.onCall(3).callsArgWith(1, null);

  const rmrf = proxyquire('../lib/utils/rmrf', {
    fs: {
      lstat: (_, cb) => cb(null, {
        isFile: () => true
      }),
      unlink: unlinkStub,
      readdir: (_, cb) => cb(null, [])
    }
  });

  rmrf('file.locked')
    .then(() => {
      t.pass('EPERM error should not be thrown');
      t.end();
    }).catch(() => {
      t.fail('EPERM error should not be thrown');
      t.end();
    });
});

test('test rmrf function with an unhandled error', (t) => {
  const rmrf = proxyquire('../lib/utils/rmrf', {
    fs: {
      lstat: (_, cb) => cb(null, {
        isFile: () => true
      }),
      unlink: (_, cb) => cb(new Error('Just an unhandled error')),
      readdir: (_, cb) => cb(null, [])
    }
  });

  rmrf('sample.log')
    .then(() => {
      t.fail('Unhandled error should be thrown');
      t.end();
    }).catch(() => {
      t.pass('Unhandled error should be thrown');
      t.end();
    });
});
