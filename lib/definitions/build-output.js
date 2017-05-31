'use strict';

// https://docs.openshift.com/online/rest_api/openshift_v1.html#v1-buildoutput

// Only doing the ImageStreamTag for now
module.exports = (buildOutput) => {
  return {
    to: {
      kind: 'ImageStreamTag',
      name: buildOutput
    }
  };
};
