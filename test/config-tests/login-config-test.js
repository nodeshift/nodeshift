'use strict';

const test = require('tape');
const proxyquire = require('proxyquire');

test('login-config checkForNodeshiftLogin', (t) => {
  const nodeshiftLogin = proxyquire('../../lib/config/login-config', {
    fs: {
      readFile: (location, cb) => {
        t.equal(location, 'here/tmp/nodeshift/config/login.json', 'the location of the login.json file');
        return cb(null, JSON.stringify({ token: 'abcd', server: 'http' }));
      }
    },
    '../common-log': () => {
      return {
        info: (info) => {
          t.equal(info, 'login.json file found');
          return info;
        }
      };
    }
  });

  const p = nodeshiftLogin.checkForNodeshiftLogin({ projectLocation: 'here' }).then((loginJSON) => {
    t.equal(loginJSON.token, 'abcd', 'returns the token');
    t.equal(loginJSON.server, 'http', 'returns the server');
    t.end();
  }).catch(t.fail);

  t.equal(p instanceof Promise, true, 'should return a Promise');
});

test('login-config checkForNodeshiftLogin - no login.json', (t) => {
  const nodeshiftLogin = proxyquire('../../lib/config/login-config', {
    fs: {
      readFile: (location, cb) => {
        t.equal(location, 'here/tmp/nodeshift/config/login.json', 'the location of the login.json file');
        const err = new Error('no file found');
        err.code = 'ENOENT';
        return cb(err);
      }
    },
    '../common-log': () => {
      return {
        info: (info) => {
          t.equal(info, 'No login.json file found');
          return info;
        }
      };
    }
  });

  const p = nodeshiftLogin.checkForNodeshiftLogin({ projectLocation: 'here' }).then((loginJSON) => {
    t.pass();
    t.end();
  }).catch(t.fail);

  t.equal(p instanceof Promise, true, 'should return a Promise');
});

test('login-config checkForNodeshiftLogin - some other error', (t) => {
  const nodeshiftLogin = proxyquire('../../lib/config/login-config', {
    fs: {
      readFile: (location, cb) => {
        t.equal(location, 'here/tmp/nodeshift/config/login.json', 'the location of the login.json file');
        const err = new Error('bad error');
        err.code = 'SOMETHING';
        return cb(err);
      }
    },
    '../common-log': () => {
      return {
        info: (info) => {
          t.fail('should not be here');
          return info;
        }
      };
    }
  });

  const p = nodeshiftLogin.checkForNodeshiftLogin({ projectLocation: 'here' }).then((loginJSON) => {
    t.fail();
    t.end();
  }).catch(() => {
    t.pass();
    t.end();
  });

  t.equal(p instanceof Promise, true, 'should return a Promise');
});

test('login-config doNodeshiftLogout', (t) => {
  const nodeshiftLogin = proxyquire('../../lib/config/login-config', {
    fs: {
      readFile: (location, cb) => {
        t.equal(location, 'here/tmp/nodeshift/config/login.json', 'the location of the login.json file');
        return cb(null, JSON.stringify({ token: 'abcd', server: 'http' }));
      }
    },
    '../utils/rmrf': (location) => {
      t.equal(location, 'here/tmp/nodeshift/config', 'the location of the directory');
      return Promise.resolve();
    },
    '../common-log': () => {
      return {
        info: (info) => {
          t.equal(info, 'Removing login.json to logout');
          return info;
        }
      };
    }
  });

  const p = nodeshiftLogin.doNodeshiftLogout({ projectLocation: 'here' }).then((loginJSON) => {
    t.pass();
    t.end();
  }).catch(t.fail);

  t.equal(p instanceof Promise, true, 'should return a Promise');
});

test('login-config doNodeshiftLogout - no file to remove', (t) => {
  const nodeshiftLogin = proxyquire('../../lib/config/login-config', {
    fs: {
      readFile: (location, cb) => {
        t.equal(location, 'here/tmp/nodeshift/config/login.json', 'the location of the login.json file');
        const err = new Error('no file found');
        err.code = 'ENOENT';
        return cb(err);
      }
    },
    '../common-log': () => {
      return {
        info: (info) => {
          t.equal(info, 'No login.json file found');
          return info;
        }
      };
    }
  });

  const p = nodeshiftLogin.doNodeshiftLogout({ projectLocation: 'here' }).then((loginJSON) => {
    t.pass();
    t.end();
  }).catch(t.fail);

  t.equal(p instanceof Promise, true, 'should return a Promise');
});

test('login-config doNodeshiftLogout - some other error', (t) => {
  const nodeshiftLogin = proxyquire('../../lib/config/login-config', {
    fs: {
      readFile: (location, cb) => {
        t.equal(location, 'here/tmp/nodeshift/config/login.json', 'the location of the login.json file');
        const err = new Error('bad error');
        err.code = 'SOMETHING';
        return cb(err);
      }
    },
    '../common-log': () => {
      return {
        info: (info) => {
          t.fail('should not be here');
          return info;
        }
      };
    }
  });

  const p = nodeshiftLogin.doNodeshiftLogout({ projectLocation: 'here' }).then((loginJSON) => {
    t.fail();
    t.end();
  }).catch(() => {
    t.pass();
    t.end();
  });

  t.equal(p instanceof Promise, true, 'should return a Promise');
});

test('login-config doNodeshiftLogin, already logged in, no force', (t) => {
  const nodeshiftLogin = proxyquire('../../lib/config/login-config', {
    fs: {
      readFile: (location, cb) => {
        t.equal(location, 'here/tmp/nodeshift/config/login.json', 'the location of the login.json file');
        return cb(null, JSON.stringify({ token: 'abcd', server: 'http' }));
      }
    },
    '../common-log': () => {
      return {
        info: (info) => {
          t.equal(info, 'login.json file found');
          return info;
        }
      };
    }
  });

  const p = nodeshiftLogin.doNodeshiftLogin({ projectLocation: 'here' }).then((loginJSON) => {
    t.equal(loginJSON.token, 'abcd', 'returns the token');
    t.equal(loginJSON.server, 'http', 'returns the server');
    t.end();
  }).catch(t.fail);

  t.equal(p instanceof Promise, true, 'should return a Promise');
});

test('login-config doNodeshiftLogin, not logged in yet, passing a token', (t) => {
  let counter = 0;
  const nodeshiftLogin = proxyquire('../../lib/config/login-config', {
    fs: {
      writeFile: (location, data, options, cb) => {
        t.equal(location, 'here/tmp/nodeshift/config/login.json', 'the location of the login.json file');
        t.equal(options.encoding, 'utf8', 'proper encoding');
        return cb(null, '');
      }
    },
    '../helpers': {
      createDir: (location) => {
        t.equal(location, 'here/tmp/nodeshift/config', 'the location of the directory');
        return Promise.resolve();
      }
    },
    '../common-log': () => {
      return {
        info: (info) => {
          if (counter === 0) {
            t.equal(info, 'No login.json file found');
          } else {
            t.equal(info, 'logging in with nodeshift cli');
          }
          counter++;
          return info;
        }
      };
    }
  });

  const p = nodeshiftLogin.doNodeshiftLogin({ projectLocation: 'here', token: 'abcd', server: 'http' }).then((loginJSON) => {
    t.equal(loginJSON.token, 'abcd', 'returns the token');
    t.equal(loginJSON.server, 'http', 'returns the server');
    t.end();
  }).catch(t.fail);

  t.equal(p instanceof Promise, true, 'should return a Promise');
});

test('login-config doNodeshiftLogin, not logged in yet, passing a user/pass', (t) => {
  let counter = 0;
  const nodeshiftLogin = proxyquire('../../lib/config/login-config', {
    'openshift-rest-client/lib/basic-auth-request': {
      getTokenFromBasicAuth: (options) => {
        t.equal(options.user, 'developer', 'has the username developer');
        t.equal(options.password, 'developer', 'has the password developer');
        t.equal(options.url, 'http', 'has the server http');
        return Promise.resolve('abcd');
      }
    },
    fs: {
      writeFile: (location, data, options, cb) => {
        t.equal(location, 'here/tmp/nodeshift/config/login.json', 'the location of the login.json file');
        t.equal(options.encoding, 'utf8', 'proper encoding');
        return cb(null, '');
      }
    },
    '../helpers': {
      createDir: (location) => {
        t.equal(location, 'here/tmp/nodeshift/config', 'the location of the directory');
        return Promise.resolve();
      }
    },
    '../common-log': () => {
      return {
        info: (info) => {
          if (counter === 0) {
            t.equal(info, 'No login.json file found');
          } else {
            t.equal(info, 'logging in with nodeshift cli');
          }
          counter++;
          return info;
        }
      };
    }
  });

  const p = nodeshiftLogin.doNodeshiftLogin({ projectLocation: 'here', username: 'developer', password: 'developer', server: 'http' }).then((loginJSON) => {
    t.equal(loginJSON.token, 'abcd', 'returns the token');
    t.equal(loginJSON.server, 'http', 'returns the server');
    t.end();
  }).catch(t.fail);

  t.equal(p instanceof Promise, true, 'should return a Promise');
});

test('login-config doNodeshiftLogin, already logged in, passing a user/pass, forcing', (t) => {
  const nodeshiftLogin = proxyquire('../../lib/config/login-config', {
    'openshift-rest-client/lib/basic-auth-request': {
      getTokenFromBasicAuth: (options) => {
        t.equal(options.user, 'developer', 'has the username developer');
        t.equal(options.password, 'developer', 'has the password developer');
        t.equal(options.url, 'http', 'has the server http');
        return Promise.resolve('abcd');
      }
    },
    fs: {
      writeFile: (location, data, options, cb) => {
        t.equal(location, 'here/tmp/nodeshift/config/login.json', 'the location of the login.json file');
        t.equal(options.encoding, 'utf8', 'proper encoding');
        return cb(null, '');
      }
    },
    '../helpers': {
      createDir: (location) => {
        t.equal(location, 'here/tmp/nodeshift/config', 'the location of the directory');
        return Promise.resolve();
      }
    },
    '../common-log': () => {
      return {
        info: (info) => {
          t.equal(info, 'logging in with nodeshift cli');
          return info;
        }
      };
    }
  });

  const p = nodeshiftLogin.doNodeshiftLogin({ projectLocation: 'here', username: 'developer', password: 'developer', server: 'http', forceLogin: true }).then((loginJSON) => {
    t.equal(loginJSON.token, 'abcd', 'returns the token');
    t.equal(loginJSON.server, 'http', 'returns the server');
    t.end();
  }).catch(t.fail);

  t.equal(p instanceof Promise, true, 'should return a Promise');
});
