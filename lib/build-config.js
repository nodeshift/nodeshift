'use strict';

const baseBuildConfig = {
  apiVersion: 'v1', // not required
  kind: 'BuildConfig', // not required
  spec: { // required
    triggers: [], // required.  leaving it empty for now
    // runPolicy: Serial // This is optional, defaults to Serial
    source: {// not required
      type: 'Binary', // required
      binary: {} // leaving empty for now
    },
    strategy: { // required
      type: 'Source', // required
      sourceStrategy: { // based on the type above.  just going with source type for now
        from: { // required
          kind: 'DockerImage',
          name: 'bucharestgold/centos7-s2i-nodejs:7.10.0' // Probably replace this with bucharest-gold/nodejs s2i image
        }
      }
    },
    output: { // not required
      to: {
        kind: 'ImageStreamTag'
      }
    }
  },
  status: { // required
    lastVersion: 1 // last triggered build, where to get this number?
  }
};

function enrich (project) {
  project = project || {};
  // Create the build config
  const buildConfig = {
    metadata: {
      name: project.buildName, // This is the build name, i think we can get this from the clint config
      namespace: project.namespace, // 'for-node-client-testing', // probably pull this from the client config
      labels: {
        group: 'io.openshift.booster', // Not sure where to get this one?
        project: project.name, // 'nodejs-rest-http', // get this from the projects package.json
        provider: 'nodejs', // maybe?  this was originall fabric8
        version: project.version // '0.0.1' // get this from the projects package.json
      }
    }
  };

  const newBuildConfig = Object.assign({}, baseBuildConfig, buildConfig);

  // Add spec output, probably a better way
  newBuildConfig.spec.output.to.name = `${project.name}:latest`; // proejct name stuff
  return newBuildConfig;
}

module.exports = {
  enrich: enrich
};
