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

// https://docs.openshift.com/online/rest_api/openshift_v1.html#v1-deploymentconfig

const _ = require('lodash');

const deploymentConfigSpec = require('../definitions/deployment-config-spec');
const objectMetadata = require('../definitions/object-metadata');

const baseDeploymentConfig = {
  apiVersion: 'v1', // not required
  kind: 'DeploymentConfig' // not required
};

function defaultDeploymentConfig (config) {
  const deploymentConfig = _.merge({}, baseDeploymentConfig);

  // Apply MetaData
  deploymentConfig.metadata = objectMetadata({
    name: config.projectName,
    namespace: config.context.namespace
  });

  // Apply DeploymentConfig Spec,  Not thrilled about mutating
  deploymentConfigSpec(deploymentConfig, config);

  return deploymentConfig;
}

async function createDeploymentConfig (config, resourceList) {
  // First check to see if we have a Deployment
  if (_.filter(resourceList, {'kind': 'Deployment'}).length < 1) {
    // create the default deployment config and add in to the resource list
    resourceList.push(defaultDeploymentConfig(config));
    return resourceList;
  }

  return resourceList.map((resource) => {
    if (resource.kind !== 'Deployment') {
      return resource;
    }

    // This first "converts" the Deployment into a DeploymentConfig. probably will make sense more when we are just straight up kube
    const deploymentConfig = _.merge({}, resource, {kind: 'DeploymentConfig'});

    // Merge the default Service Config with the current resource
    return _.merge({}, defaultDeploymentConfig(config), deploymentConfig);
  });
}

module.exports = {
  enrich: createDeploymentConfig,
  name: 'deployment-config'
};

// const deploymentConfig = {
//   spec: {
//     replicas: 1, // required
//     selector: {
//       group: 'io.openshift.booster', // Not sure where to get this one?
//       project: 'nodejs-rest-http', // get this from the projects package.json
//       provider: 'nodejs' // maybe?  this was original fabric8
//     },
//    //    triggers:
//    // [ { type: 'ConfigChange' },
//    //   { type: 'ImageChange', imageChangeParams: [Object] } ],

//   //  { type: 'ImageChange',
//   // imageChangeParams:
//   //  { automatic: true,
//   //    containerNames: [ 'wildfly-swarm' ],
//   //    from:
//   //     { kind: 'ImageStreamTag',
//   //       namespace: 'for-testing-purposes',
//   //       name: 'wfswarm-rest-http:latest' } } }
//     triggers: [
//       { type: 'ConfigChange' },
//       {
//         type: 'ImageChange',
//         imageChangeParams: {
//           automatic: true,
//           containerNames: [ 'nodejs-rest-http' ],
//           from: {
//             kind: 'ImageStreamTag',
//             namespace: 'node-demo',
//             name: 'nodejs-rest-http:latest'
//           }
//         }
//       }
//     ],
//     template: {
//       metadata: { // not required
//         labels: {
//           group: 'io.openshift.booster', // Not sure where to get this one?
//           project: 'nodejs-rest-http', // get this from the projects package.json
//           provider: 'nodejs', // maybe?  this was original fabric8
//           version: '0.0.1' // get this from the projects package.json
//         }
//       },
//       spec: {
//         containers: [
//           {
//             // image: '172.30.1.1:5000/node-demo/nodejs-rest-http@sha256:abb02a0e79d867e18f04957e48eb21751a9b9c1af5877cb71eb5d5c29d639ba2',
//             image: '172.30.1.1:5000/node-demo/nodejs-rest-http:latest', // required
//             name: 'nodejs-rest-http', // required
//             securityContext: {
//               privileged: false
//             },
//             ports: [
//               {
//                 containerPort: 8080,
//                 name: 'http',
//                 protocol: 'TCP'
//               }
//             ],
//             readinessProbe: {
//               httpGet: {
//                 path: '/api/greeting',
//                 port: 8080,
//                 scheme: 'HTTP'
//               }
//             },
//             livenessProbe: {
//               httpGet: {
//                 path: '/api/greeting',
//                 port: 8080,
//                 scheme: 'HTTP'
//               },
//               initialDelaySeconds: 60,
//               periodSeconds: 30
//             }
//           }
//         ]
//       }
//     }
//   }
// };

// // triggers:
// //     - type: ConfigChange
// //     - type: ImageChange
// //       imageChangeParams:
// //         automatic: true
// //         containerNames:
// //           - wildfly-swarm
// //         from:
// //           kind: ImageStreamTag
// //           namespace: for-testing-purposes
//           name: 'wfswarm-rest-http:latest'
