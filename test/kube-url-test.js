'use strict';

const test = require('tape');
const proxyquire = require('proxyquire');

test('finds the kube url', (t) => {
  const config = {
    openshiftRestClient: {
      backend: {
        requestOptions: {
          baseUrl: 'http://localhost'
        }
      }
    }
  };

  const appliedResources = [{
    body: {
      kind: 'Service',
      spec: {
        ports: [{
          nodePort: 3000
        }]
      }
    }
  }];

  const outputKubeUrl = proxyquire('../lib/kube-url', {
    './common-log': () => ({
      info: (message) => {
        t.equal(message, 'Application running at: http://localhost:3000');
        t.pass();
      }
    })
  });

  outputKubeUrl(config, appliedResources);
  t.end();
});

test('finds the kube url - No Services', (t) => {
  const config = {
    openshiftRestClient: {
      backend: {
        requestOptions: {
          baseUrl: 'http://localhost'
        }
      }
    }
  };

  const outputKubeUrl = proxyquire('../lib/kube-url', {
    './common-log': () => ({
      info: (message) => {
        t.fail('should not reach this');
      },
      warn: (message) => {
        t.equal(message, 'No Deployed Service Found');
      }
    })
  });

  outputKubeUrl(config, []);
  t.end();
});
