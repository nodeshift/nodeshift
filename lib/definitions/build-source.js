'use strict';

// https://docs.openshift.com/online/rest_api/openshift_v1.html#v1-buildsource

// ATM, we only do a Type of Binary.  In the future this could change
module.exports = (type) => {
  return {
    type: type || 'Binary', // Required
    binary: {} // leaving empty for now
  };
};
