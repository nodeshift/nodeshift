'use strict';

const baseImageStreamConfig = {
  apiVersion: 'v1', // not required
  kind: 'ImageStream', // not required
  spec: {} // required
};

function enrich (project) {
  project = project || {};
  // Create the build config
  const imageStreamConfig = {
    metadata: {
      name: project.name, // This is the build name, i think we can get this from the clint config
      namespace: project.namespace, // 'for-node-client-testing', // probably pull this from the client config
      labels: {
        group: 'io.openshift.booster', // Not sure where to get this one?
        project: project.name, // 'nodejs-rest-http', // get this from the projects package.json
        provider: 'nodejs', // maybe?  this was originall fabric8
        version: project.version // '0.0.1' // get this from the projects package.json
      }
    }
  };

  return Object.assign({}, baseImageStreamConfig, imageStreamConfig);
}

module.exports = {
  enrich: enrich
};
