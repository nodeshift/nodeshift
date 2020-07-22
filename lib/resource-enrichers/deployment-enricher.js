'use strict';

const _ = require('lodash');

const baseDeployment = {
  apiVersion: 'apps/v1',
  kind: 'Deployment',
  metadata: {},
  spec: {}
};

function defaultDeployment (config) {
  const trigger = [{ from: { kind: 'ImageStreamTag', name: `${config.outputImageStreamName}:latest`, namespace: config.namespace.name }, fieldPath: `spec.template.spec.containers[?(@.name==\"${config.projectName}\")].image` }];

  const metaAnnotations = {
    'image.openshift.io/triggers': JSON.stringify(trigger)
  };
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
          deploymentconfig: config.projectName
        }
      },
      spec: {
        containers: [
          {
            name: config.projectName,
            image: `image-registry.openshift-image-registry.svc:5000/${config.namespace.name}/${config.outputImageStreamName}`,
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

  // image.openshift.io/triggers: >-
  //     [{'from":{"kind":"ImageStreamTag","name":"fun-with-deployments:latest","namespace":"deployments-testsing"},"fieldPath":"spec.template.spec.containers[?(@.name==\"fun-with-deployments-part2\")].image"}]

  return { ...baseDeployment, spec: spec, metadata: { name: config.projectName, annotations: metaAnnotations } };
}

function createDeploymentResource (config, resourceList) {
  // First check to see if we have a Deployment
  if (_.filter(resourceList, { kind: 'Deployment' }).length < 1) {
    // create the default deployment config and add in to the resource list
    resourceList.push(defaultDeployment(config));
    return resourceList;
  }

  // return resourceList.map((resource) => {
  //   if (resource.kind !== 'Deployment' && resource.kind !== 'DeploymentConfig') {
  //     return resource;
  //   }

  //   // This first "converts" the Deployment into a DeploymentConfig. probably will make sense more when we are just straight up kube
  //   const deploymentConfig = _.merge({}, resource, { kind: 'DeploymentConfig' });

  //   // Merge the default Service Config with the current resource
  //   return _.merge({}, defaultDeploymentConfig(config), deploymentConfig);
  // });
}

module.exports = {
  enrich: createDeploymentResource,
  name: 'deployment'
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
