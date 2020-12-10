'use strict';

const { readFileSync } = require('fs');
const Docker = require('dockerode');

function dockerClientSetup (options = {}, kubeEnvVars) {
  const url = new URL(kubeEnvVars.DOCKER_HOST);

  const docker = new Docker({
    host: url.hostname,
    port: url.port || 2375,
    ca: readFileSync(`${kubeEnvVars.DOCKER_CERT_PATH}/ca.pem`),
    cert: readFileSync(`${kubeEnvVars.DOCKER_CERT_PATH}/cert.pem`),
    key: readFileSync(`${kubeEnvVars.DOCKER_CERT_PATH}/key.pem`)
  });

  return docker;
}

module.exports = dockerClientSetup;
