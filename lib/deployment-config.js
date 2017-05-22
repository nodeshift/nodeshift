'use strict';

const deploymentConfig = {
  apiVersion: 'v1', // not required
  kind: 'DeploymentConfig', // not required
  metadata: { // not required
    name: 'nodejs-rest-http', // This is the stream name, i think we can get this from the clint config
    labels: {
      group: 'io.openshift.booster', // Not sure where to get this one?
      project: 'nodejs-rest-http', // get this from the projects package.json
      provider: 'nodejs', // maybe?  this was originall fabric8
      version: '0.0.1' // get this from the projects package.json
    }
  },
  spec: {
    replicas: 1, // required
    selector: {
      group: 'io.openshift.booster', // Not sure where to get this one?
      project: 'nodejs-rest-http', // get this from the projects package.json
      provider: 'nodejs' // maybe?  this was originall fabric8
    },
   //    triggers:
   // [ { type: 'ConfigChange' },
   //   { type: 'ImageChange', imageChangeParams: [Object] } ],

  //  { type: 'ImageChange',
  // imageChangeParams:
  //  { automatic: true,
  //    containerNames: [ 'wildfly-swarm' ],
  //    from:
  //     { kind: 'ImageStreamTag',
  //       namespace: 'for-testing-purposes',
  //       name: 'wfswarm-rest-http:latest' } } }
    triggers: [
      { type: 'ConfigChange' },
      {
        type: 'ImageChange',
        imageChangeParams: {
          automatic: true,
          containerNames: [ 'nodejs-rest-http' ],
          from: {
            kind: 'ImageStreamTag',
            namespace: 'node-demo',
            name: 'nodejs-rest-http:latest'
          }
        }
      }
    ],
    template: {
      metadata: { // not required
        labels: {
          group: 'io.openshift.booster', // Not sure where to get this one?
          project: 'nodejs-rest-http', // get this from the projects package.json
          provider: 'nodejs', // maybe?  this was originall fabric8
          version: '0.0.1' // get this from the projects package.json
        }
      },
      spec: {
        containers: [
          {
            // image: '172.30.1.1:5000/node-demo/nodejs-rest-http@sha256:abb02a0e79d867e18f04957e48eb21751a9b9c1af5877cb71eb5d5c29d639ba2',
            image: '172.30.1.1:5000/node-demo/nodejs-rest-http:latest', // required
            name: 'nodejs-rest-http', // required
            securityContext: {
              privileged: false
            },
            ports: [
              {
                containerPort: 8080,
                name: 'http',
                protocol: 'TCP'
              }
            ],
            readinessProbe: {
              httpGet: {
                path: '/api/greeting',
                port: 8080,
                scheme: 'HTTP'
              }
            },
            livenessProbe: {
              httpGet: {
                path: '/api/greeting',
                port: 8080,
                scheme: 'HTTP'
              },
              initialDelaySeconds: 60,
              periodSeconds: 30
            }
          }
        ]
      }
    }
  }
};

// triggers:
//     - type: ConfigChange
//     - type: ImageChange
//       imageChangeParams:
//         automatic: true
//         containerNames:
//           - wildfly-swarm
//         from:
//           kind: ImageStreamTag
//           namespace: for-testing-purposes
//           name: 'wfswarm-rest-http:latest'

module.exports = () => {
  return deploymentConfig;
};
