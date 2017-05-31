'use strict';

// https://docs.openshift.com/online/rest_api/openshift_v1.html#v1-buildconfigstatus

// Not really sure how to find this out
module.exports = (lastVersion) => {
  return {lastVersion: lastVersion || 0};
};
