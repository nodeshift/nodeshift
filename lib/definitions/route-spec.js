'use strict';

// https://docs.openshift.com/enterprise/3.0/rest_api/openshift_v1.html#v1-routespec

const _ = require('lodash');

const baseRouteSpec = {
  to: {
    kind: 'Serivce',
    name: ''
  }
};

module.exports = (resource, config) => {
  resource.spec = _.merge({}, baseRouteSpec, resource.spec);

  // Overrite the spec.to.name which should be the projectName
  resource.spec.to.name = config.projectName;

  return resource;
};

// spec: {
  //   port: {
  //     targetPort: 8080
  //   },
  //   to: {
  //     kind: 'Service',
  //     name: 'nodejs-rest-http'
  //   }
  // }
