'use strict';

const routeConfig = {
  apiVersion: 'v1',
  kind: 'Route',
  metadata: { // not required
    name: 'nodejs-rest-http', // This is the stream name, i think we can get this from the clint config
    labels: {
      group: 'io.openshift.booster', // Not sure where to get this one?
      project: 'nodejs-rest-http', // get this from the projects package.json
      provider: 'nodejs', // maybe?  this was originall fabric8
      version: '0.0.1' // get this from the projects package.json
    }
  },
  spec: {
    port: {
      targetPort: 8080
    },
    to: {
      kind: 'Service',
      name: 'nodejs-rest-http'
    }
  }
};

module.exports = () => {
  return routeConfig;
};
