'use strict';

const test = require('tape');
const proxyquire = require('proxyquire');

test.skip('test basic resource loader', (t) => {
  const resourceLoader = require('../lib/resource-loader');
  t.equal(typeof resourceLoader, 'function', 'resourceLoader is a function');
  t.end();
});

test.skip('test no .nodeshift directory using defaults', (t) => {
  const mockedfs = {
    readFile: (locations, options, cb) => { return cb(null, null); },
    readdir: (path, cb) => {
      // test default path
      t.equals(path, `${process.cwd()}/.nodeshift`, 'should be using default locations');
      const err = new Error('no directory found');
      err.code = 'ENOENT';
      return cb(err, null);
    }
  };
  const resourceLoader = proxyquire('../lib/resource-loader', {
    fs: mockedfs
  });

  const config = {
    projectLocation: process.cwd(),
    nodeshiftDirectory: '.nodeshift'
  };

  const result = resourceLoader(config).then((resourceList) => {
    t.equals(Array.isArray(resourceList), true, 'returns an array');
    t.equal(resourceList.length, 0, 'should be length zero when no directory found');
    t.end();
  });

  t.equals(result instanceof Promise, true, 'resource loader function is a promise');
});

test.skip('test using different nodeshift and projectLocation', (t) => {
  const config = {
    projectLocation: 'not_default',
    nodeshiftDirectory: 'mavenshift'
  };

  const mockedfs = {
    readFile: (locations, config, cb) => { return cb(null, null); },
    readdir: (path, cb) => {
      // test default path
      t.equals(path, `${config.projectLocation}/${config.nodeshiftDirectory}`, 'should be using non default locations');
      return cb(null, []);
    }
  };
  const resourceLoader = proxyquire('../lib/resource-loader', {
    fs: mockedfs
  });

  resourceLoader(config).then((resourceList) => {
    t.end();
  });
});

test.skip('test error with readdir', (t) => {
  const mockedfs = {
    readFile: (locations, options, cb) => { return cb(null, null); },
    readdir: (path, cb) => {
      const err = new Error('not a good error');
      err.code = 'NOT_ENOENT';
      return cb(err, null);
    }
  };
  const resourceLoader = proxyquire('../lib/resource-loader', {
    fs: mockedfs
  });

  const config = {
    projectLocation: process.cwd(),
    nodeshiftDirectory: '.nodeshift',
    definedProperties: []
  };

  resourceLoader(config).catch(() => {
    t.end();
  });
});

test.skip('test only return .ymls', (t) => {
  const mockedHelper = {
    yamlToJson: (file) => { return file; }
  };

  const mockedfs = {
    readFile: (locations, options, cb) => {
      const parts = locations.split('/');
      const file = parts[parts.length - 1];
      return cb(null, file);
    },
    readdir: (path, cb) => {
      // test default path
      return cb(null, ['yes.yml', 'no.js', 'yes1.yml']);
    }
  };
  const resourceLoader = proxyquire('../lib/resource-loader', {
    fs: mockedfs,
    helpers: mockedHelper
  });

  const config = {
    projectLocation: process.cwd(),
    nodeshiftDirectory: '.nodeshift',
    definedProperties: []
  };

  resourceLoader(config).then((resourceList) => {
    t.equals(Array.isArray(resourceList), true, 'returns an array');
    t.equal(resourceList.length, 2, 'should be length 2');
    t.end();
  });
});

test.skip('test error reading file from list', (t) => {
  const mockedfs = {
    readFile: (locations, options, cb) => {
      return cb(new Error('this is an error'), null);
    },
    readdir: (path, cb) => {
      // test default path
      return cb(null, ['yes.yml', 'no.js', 'yes1.yml']);
    }
  };
  const resourceLoader = proxyquire('../lib/resource-loader', {
    fs: mockedfs
  });

  const config = {
    projectLocation: process.cwd(),
    nodeshiftDirectory: '.nodeshift',
    definedProperties: []
  };

  resourceLoader(config).catch(() => {
    t.pass();
    t.end();
  });
});

test('test string substitution', (t) => {
  const mockedHelper = {
    yamlToJson: (file) => {
      return {
        templates: {
          SSO_AUTH_SERVER_URL: '{SSO_AUTH_SERVER_URL}'
        }
      };
    }
  };

  const mockedfs = {
    readFile: (locations, options, cb) => {
      const parts = locations.split('/');
      const file = parts[parts.length - 1];
      return cb(null, file);
    },
    readdir: (path, cb) => {
      // test default path
      return cb(null, ['yes1.yml']);
    }
  };
  const resourceLoader = proxyquire('../lib/resource-loader', {
    fs: mockedfs,
    './helpers': mockedHelper
  });

  const config = {
    projectLocation: process.cwd(),
    nodeshiftDirectory: '.nodeshift',
    definedProperties: [{key: '{SSO_AUTH_SERVER_URL}', value: 'https://yea'}]
  };

  resourceLoader(config).then((resourceList) => {
    t.equals(resourceList[0].templates.SSO_AUTH_SERVER_URL, 'https://yea', 'should have been substituted');
    t.end();
  });
});
