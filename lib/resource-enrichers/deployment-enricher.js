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
  let metaAnnotations;
  let containerImage;
  const labels = {
    app: config.projectName
  };

  if (!config.kube) {
    /* eslint no-useless-escape: "off" */
    const trigger = [{ from: { kind: 'ImageStreamTag', name: `${config.outputImageStreamName}:latest`, namespace: config.namespace.name }, fieldPath: `spec.template.spec.containers[?(@.name==\"${config.projectName}\")].image` }];

    metaAnnotations = {
      'image.openshift.io/triggers': JSON.stringify(trigger)
    };
    labels.deploymentconfig = config.projectName;
    containerImage = `image-registry.openshift-image-registry.svc:5000/${config.namespace.name}/${config.outputImageStreamName}`;
  } else {
    labels.appId = generateUUID();
    containerImage = `${config.projectName}:latest`; // TODO(lholmquist): Do we really need to use a tag other than latest?
  }

  const spec = {
    selector: {
      matchLabels: {
        app: config.projectName
      }
    },
    template: {
      metadata: {
        labels: labels
      },
      spec: {
        containers: [
          {
            name: config.projectName,
            image: containerImage,
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

  return { ...baseDeployment, spec: spec, metadata: { name: config.projectName, annotations: metaAnnotations } };
}

async function createDeploymentResource (config, resourceList) {
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
