'use strict';

const test = require('tape');
const proxyquire = require('proxyquire');

test('docker-config', (t) => {
  const dockerClientSetup = proxyquire('../../lib/config/docker-config', {
    fs: {
      readFileSync: (path) => {
        t.pass();
      }
    }
  });

  const kubeEnvVars = {
    DOCKER_HOST: 'tcp://192.168.39.50:2376',
    DOCKER_CERT_PATH: '/home/lucasholmquist/.minikube/certs'
  };
  dockerClientSetup({}, kubeEnvVars);

  t.pass();
  t.end();
});

test('docker-config - no port', (t) => {
  const dockerClientSetup = proxyquire('../../lib/config/docker-config', {
    fs: {
      readFileSync: (path) => {
        t.pass();
      }
    }
  });

  const kubeEnvVars = {
    DOCKER_HOST: 'tcp://192.168.39.50',
    DOCKER_CERT_PATH: '/home/lucasholmquist/.minikube/certs'
  };
  dockerClientSetup({}, kubeEnvVars);

  t.pass();
  t.end();
});
