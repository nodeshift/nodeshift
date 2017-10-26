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
  const config = {
    projectName: 'project-name',
    context: {
      namespace: ''
    },
    openshiftRestClient: {
      imagestreams: {
        find: (buildName) => {
          return Promise.resolve({code: 404});
        },
        create: (imageStream) => {
          return Promise.resolve(imageStream);
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
    version: '1.0.0',
    context: {
      namespace: ''
    },
    openshiftRestClient: {
      imagestreams: {
        find: (imagestreams) => {
          return Promise.resolve({code: 200});
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
    version: '1.0.0',
    context: {
      namespace: ''
    },
    openshiftRestClient: {
      imagestreams: {
        find: (imagestreams) => {
          return Promise.resolve({code: 200});
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
      imagestreams: {
        find: (imageStreamName) => {
          return Promise.resolve({code: 200});
        },
        remove: (imageStreamName, options) => {
          return Promise.resolve();
        },
        create: (imageStreamName) => {
          return Promise.resolve(imageStreamName);
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
