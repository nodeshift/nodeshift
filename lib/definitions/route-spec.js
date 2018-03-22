/*
 *
 *  Copyright 2016-2017 Red Hat, Inc, and individual contributors.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

'use strict';

// https://docs.openshift.com/enterprise/3.0/rest_api/openshift_v1.html#v1-routespec

const _ = require('lodash');

const baseRouteSpec = {
  to: {
    kind: 'Service'
  },
  port: {
    targetPort: 8080
  }
};

module.exports = (resource, config) => {
  resource.spec = _.merge({}, baseRouteSpec, resource.spec);

  resource.spec.to.name = resource.spec.to.name ? resource.spec.to.name : config.projectName;
  return resource;
};
