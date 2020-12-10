'use strict';

const _ = require('lodash');
const { generateUUID } = require('../helpers');

const baseDeployment = {
  apiVersion: 'apps/v1',
  kind: 'Deployment',
  metadata: {},
  spec: {}
};

function defaultDeployment (config) {
  const spec = {
    selector: {
      matchLabels: {
        app: config.projectName
      }
    },
    template: {
      metadata: {
        labels: {
          app: config.projectName,
          appId: generateUUID()
        }
      },
      spec: {
        containers: [
          {
            name: config.projectName,
            image: `${config.projectName}:latest`, // TODO(lholmquist): Do we really need to use a tag other than latest?
            imagePullPolicy: 'IfNotPresent',
            ports: [
              {
                containerPort: config.port
              }
            ]
          }
        ]
      }
    }
  };

  return { ...baseDeployment, spec: spec, metadata: { name: config.projectName } };
}

function createDeploymentResource (config, resourceList) {
  // First check to see if we have a Deployment
  if (_.filter(resourceList, { kind: 'Deployment' }).length < 1) {
    // create the default deployment config and add in to the resource list
    resourceList.push(defaultDeployment(config));
    return resourceList;
  }

  return resourceList.map((resource) => {
    if (resource.kind !== 'Deployment') {
      return resource;
    }

    // Merge the default Deployment with the current resource
    return _.merge({}, defaultDeployment(config), resource);
  });
}

module.exports = {
  enrich: createDeploymentResource,
  name: 'kube-deployment'
};

// apiVersion: apps/v1
// kind: Deployment
// metadata:
//   name: hello-openshift
// spec:
//   replicas: 1
//   selector:
//     matchLabels:
//       app: hello-openshift
//   template:
//     metadata:
//       labels:
//         app: hello-openshift
//     spec:
//       containers:
//       - name: hello-openshift
//         image: openshift/hello-openshift:latest
//         ports:
//         - containerPort: 80
