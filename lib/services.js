'use strict';

const baseServiceConfig = {
  apiVersion: 'v1', // not required
  kind: 'Service', // not required
  metadata: { // not required
    name: 'nodejs-rest-http', // This is the stream name, i think we can get this from the clint config
    labels: {
      expose: 'true', // not sure where this one is coming from
      group: 'io.openshift.booster', // Not sure where to get this one?
      project: 'nodejs-rest-http', // get this from the projects package.json
      provider: 'nodejs', // maybe?  this was originall fabric8
      version: '0.0.1' // get this from the projects package.json
    }
  },
  spec: { // required
    ports: [
      {
        name: 'http', // not required if we only have 1 port entry
        protocol: 'TCP', // TCP is the default, do we need to specifiy
        port: 8080,
        targetPort: 8080
      }
    ],
    selector: {
      group: 'io.openshift.booster', // Not sure where to get this one?
      project: 'nodejs-rest-http', // get this from the projects package.json
      provider: 'nodejs' // maybe?  this was originall fabric8
    }// ,
    // type: 'ClusterIP' // will default to this if not there
  }
};

const _ = require('lodash');

module.exports = (projectServiceConfig, projectName) => {
  // Also need to replace any ${project.name} with the projectName
  return _.merge({}, baseServiceConfig, projectServiceConfig);
};
