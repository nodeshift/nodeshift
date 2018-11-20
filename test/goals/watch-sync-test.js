'use strict';

const test = require('tape');
const proxyquire = require('proxyquire');
const _ = require('lodash');

test('watch commnd default options test', async (t) => {
  const commandOptions = [
    'rsync',
    '--progress',
    '--watch',
    '--exclude=node_modules',
    '--exclude=tmp',
    '--exclude=.git',
    '--exclude=test',
    './',
    'pod1:/opt/app-root/src'
  ];

  const config = {
    projectName: 'watch sync project',
    projectPackage: {
    },
    openshiftRestClient: {
      pods: {
        findAll: () => {
          return {
            items: [{
              metadata: {
                name: 'pod1'
              },
              status: {
                conditions: [{
                  type: 'Ready',
                  status: 'True'
                }]
              }
            }]
          };
        }
      }
    }
  };

  const watchSync = proxyquire('../../lib/goals/watch-sync', {
    'child_process': {
      'spawn': (args, options) => {
        // make sure we are excluding the correct things
        t.equal(_.difference(commandOptions, options).length, 0, 'should have all the default values');
        return {};
      }
    }
  });

  watchSync(config).then(spawnedProcess => {
    t.end();
  });
});

test('watch commnd include files test', async (t) => {
  const config = {
    projectName: 'watch sync project',
    projectPackage: {
      files: ['package.json', 'public/']
    },
    openshiftRestClient: {
      pods: {
        findAll: () => {
          return {
            items: [{
              metadata: {
                name: 'pod1'
              },
              status: {
                conditions: [{
                  type: 'Ready',
                  status: 'True'
                }]
              }
            }]
          };
        }
      }
    }
  };

  const watchSync = proxyquire('../../lib/goals/watch-sync', {
    'child_process': {
      'spawn': (args, options) => {
        // make sure we are including the correct things
        const filtered = options.filter(f => {
          return f === '--include=package.json' || f === '--include=public/';
        });

        t.equal(filtered.length, 2, 'should return 2 values');
        return {};
      }
    }
  });

  watchSync(config).then(spawnedProcess => {
    t.end();
  });
});

test('watch commnd no pods found test', async (t) => {
  const config = {
    projectName: 'watch sync project',
    projectPackage: {
      files: ['package.json', 'public/']
    },
    openshiftRestClient: {
      pods: {
        findAll: () => {
          return {
            items: []
          };
        }
      }
    }
  };

  const watchSync = proxyquire('../../lib/goals/watch-sync', {
    'child_process': {
      'spawn': (args, options) => {
        return {};
      }
    }
  });

  watchSync(config).then(spawnedProcess => {
    t.fail('You shall not pass........this test');
  }).catch((err) => {
    t.equal(err.message, 'No Pods for project watch sync project found', 'should be the no pods found error');
    t.end();
  });
});

test('watch commnd error on not ready test', async (t) => {
  const config = {
    projectName: 'watch sync project',
    projectPackage: {
      files: ['package.json', 'public/']
    },
    openshiftRestClient: {
      pods: {
        findAll: () => {
          return {
            items: [{
              metadata: {
                name: 'pod1'
              },
              status: {
                conditions: [{
                  type: 'Ready',
                  status: 'False'
                }]
              }
            }]
          };
        }
      }
    }
  };

  const watchSync = proxyquire('../../lib/goals/watch-sync', {
    'child_process': {
      'spawn': (args, options) => {
        return {};
      }
    },
    '../helpers': {
      'wait': async () => {}
    }
  });

  watchSync(config).then(spawnedProcess => {
    t.fail('You shall not pass........this test');
  }).catch((err) => {
    t.equal(err.message, `Pod for project ${config.projectName} is not available`, 'should be the not availabe pods error');
    t.end();
  });
});
