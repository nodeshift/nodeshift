'use strict';

// Perhaps we should define this in another location
const dockerImageName = 'bucharestgold/centos7-s2i-nodejs:latest';

// https://docs.openshift.com/online/rest_api/openshift_v1.html#v1-buildstrategy
module.exports = () => {
  // Just doing the source strategy
  return {
    type: 'Source',
    sourceStrategy: {
      from: {
        kind: 'DockerImage',
        name: dockerImageName
      }
    }
  };
};
