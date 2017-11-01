'use strict';

// Perhaps we should define this in another location
const dockerImage = 'bucharestgold/centos7-s2i-nodejs';
const dockerTag = 'latest';

// https://docs.openshift.com/online/rest_api/openshift_v1.html#v1-buildstrategy
module.exports = (options = {}) => {
  // Just doing the source strategy
  const dockerImageName = `${dockerImage}:${options.nodeVersion ? options.nodeVersion : dockerTag}`;
  return {
    type: 'Source',
    sourceStrategy: {
      from: {
        kind: 'DockerImage',
        name: dockerImageName
      },
      forcePull: options.forcePull
    }
  };
};
