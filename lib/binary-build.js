'use strict';

const request = require('request');
const chalk = require('chalk');

// https://192.168.99.100:8443/api/v1/namespaces/node-demo-1/pods/wfswarm-rest-http-s2i-5-build/log?pretty=false&follow=true';

// Probably do this somewhere else eventually
function watchBuildLog (config, build) {
  return new Promise((resolve, reject) => {
    const req = {
      url: `${config.openshiftRestClient.kubeUrl}/namespaces/${config.context.namespace}/pods/${build}-build/log?pretty=false&follow=true`,
      auth: {
        bearer: config.user.token
      },
      strictSSL: false // just for testing since self-signed cert
    };

    request.get(req).on('data', (chunk) => {
      console.log(chalk.blue(chunk.toString('utf8')));
    }).on('end', () => {
      return resolve();
    }).on('error', (err) => {
      return reject(err);
    });
  });
}

// Start the build process
module.exports = (config, archiveLocation) => {
  // Upload the .tar file
  return config.openshiftRestClient.buildconfigs.instantiateBinary(config.buildName, {dockerArchive: archiveLocation}).then((response) => {
    console.log('Binary Upload Complete');

    // Trigger watch of build
    const watchPromise = watchBuildLog(config, response.metadata.name);
    const timerPromise = new Promise((resolve, reject) => {
      console.log('Waiting for build to finish');
      const internvalId = setInterval(() => {
        // find the current build
        config.openshiftRestClient.builds.find(response.metadata.name).then((buildStatus) => {
          if (buildStatus.status.phase === 'Complete') {
            clearInterval(internvalId);
            console.log('Build finished');
            return resolve(buildStatus);
          }
        });
      }, 2000);
    });
    return Promise.all([timerPromise, watchPromise]).then((results) => {
      return results[0];
    });
  });
};
