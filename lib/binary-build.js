'use strict';

// There is supposedly a Websocket endpoint we can connect to, to watch the build and output the log

// Start the build process
module.exports = (config, archiveLocation) => {
  // Upload the .tar file
  return config.openshiftRestClient.buildconfigs.instantiateBinary(config.buildName, {dockerArchive: archiveLocation}).then((response) => {
    console.log('Binary Upload Complete');
    return new Promise((resolve, reject) => {
      console.log('Waiting for build to finish');
      const internvalId = setInterval(() => {
        // find the current build
        config.openshiftRestClient.builds.find(response.metadata.name).then((buildStatus) => {
          if (buildStatus.status.phase === 'Complete') {
            clearInterval(internvalId);
            return resolve(buildStatus);
          }

          console.log('Waiting for build to finish');
        });
      }, 2000);
    });
  });
};
