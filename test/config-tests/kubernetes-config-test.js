'use strict';

const test = require('tape');
const proxyquire = require('proxyquire');

test('kubernetes-config - minikube', (t) => {
  const getKubernetesEnv = proxyquire('../../lib/config/kubernetes-config', {
    child_process: {
      exec: function (cmd, cb) {
        t.equal(cmd, 'minikube docker-env');
        const envs = 'export DOCKER_TLS_VERIFY="1" \n' +
               'export DOCKER_HOST="tcp://192.168.39.50:2376 \n' +
               'export DOCKER_CERT_PATH="/home/lucasholmquist/.minikube/certs \n' +
               'export MINIKUBE_ACTIVE_DOCKERD="minikube"';
        return cb(null, { stdout: envs });
      }
    }
  });

  const p = getKubernetesEnv().then((env) => {
    t.pass();
    t.equal(env.DOCKER_HOST, 'tcp://192.168.39.50:2376');
    t.equal(env.DOCKER_CERT_PATH, '/home/lucasholmquist/.minikube/certs');
    t.end();
  }).catch(t.fail);

  t.equal(p instanceof Promise, true, 'should return a Promise');
});

test('kubernetes-config - minikube - error', (t) => {
  const getKubernetesEnv = proxyquire('../../lib/config/kubernetes-config', {
    child_process: {
      exec: function (cmd, cb) {
        t.equal(cmd, 'minikube docker-env');
        const envs = 'export DOCKER_TLS_VERIFY="1" \n' +
               'export DOCKER_HOST="tcp://192.168.39.50:2376 \n' +
               'export DOCKER_CERT_PATH="/home/lucasholmquist/.minikube/certs \n' +
               'export MINIKUBE_ACTIVE_DOCKERD="minikube"';
        return cb(new Error('error'), { stdout: envs });
      }
    }
  });

  const p = getKubernetesEnv().then((env) => {
    t.fail();
    t.end();
  }).catch(() => {
    t.pass();
    t.end();
  });

  t.equal(p instanceof Promise, true, 'should return a Promise');
});
