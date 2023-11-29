# Nodeshift

![Node.js CI](https://github.com/nodeshift/nodeshift/workflows/Node.js%20CI/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/nodeshift/nodeshift/badge.svg?branch=main)](https://coveralls.io/github/nodeshift/nodeshift?branch=main)

## What is it

Nodeshift is an opinionated command line application and programmable API that you can use to deploy Node.js projects to OpenShift and Kubernetes(minikube).

## Prerequisites

* Node.js - version 18.x or greater

## Install

To install globally: `npm install -g nodeshift`

Use with npx: `npx nodeshift`

or to use in an npm script

    npm install --save-dev nodeshift

    // inside package.json
    scripts: {
      nodeshift: nodeshift
    }

    $ npm run nodeshift

## Core Concepts

### Commands & Goals

By default, if you run just `nodeshift`, it will run the `deploy` goal, which is a shortcut for running `resource`, `build` and `apply-resource`.

**login** - will login to the cluster

**logout** - will logout of the cluster

**resource** - will parse and create the application resources files on disk

**apply-resource** - does the resource goal and then deploys the resources to your running cluster

**build** - archives the code, creates a build config and imagestream and pushes the binary to the cluster

**deploy** -  a shortcut for running `resource`, `build` and `apply-resource`

**undeploy** - removes resources that were deployed with the apply-resource command


### Using Login and Logout

By default, the Nodeshift CLI will look for a kube config in `~/.kube/config`.  This is usually created when a user does an `oc login`,  but that requires the `oc` to be installed and the extra step of running the `oc login` command.  The Nodeshift CLI allows you to pass a username/password or a valid auth token along with the clusters API server address to authenticate requests without the need to run `oc login` first.

While these parameters can be specified for each command, the `nodeshift login` command helps to simplify that.  You can now run `nodeshift login` with the parameters mentioned to first login, then run the usual `nodeshift deploy` without neededing to add the flags.

CLI Usage - Login:

```
$ nodeshift login --username=developer --password=password --server=https://api.server

or

$ nodeshift login --token=12345 --server=https://api.server
```

CLI Usage - Logout

```
$ nodeshift logout
```

API usage using async/await would look something like this:

```
const nodeshift = require('nodeshift');

const options = {
  username: 'kubeadmin',
  password: '...',
  server: '...',
  insecure: true
};

(async () => {
  await nodeshift.login(options);
  await nodeshift.deploy();
  await nodeshift.logout();
})();
```

### `.nodeshift` Directory

The `.nodeshift` directory contains your resource fragments.  These are `.yml` files that describe your services, deployments, routes, etc.  By default, nodeshift will create a `Service` and `DeploymentConfig` in memory, if none are provided.  A `Route` resource fragment should be provided or use the `expose` flag if you want to expose your application to the outside world.

For kubernetes based deployments,  a `Service` and `Deployment` will be created by default, if none are provided.  The `Service` is of a `LoadBalancer` type, so no `Ingress` is needed to expose the application.

### Resource Fragments

OpenShift resource fragments are user provided YAML files which describe and enhance your deployed resources.  They are enriched with metadata, labels and more by nodeshift.

Each resource gets its own file, which contains some skeleton of a resource description. Nodeshift will enrich it and then combine all the resources into a single openshift.yml and openshift.json(located in ./tmp/nodeshift/resource/).

The resource object's `Kind`, if not given, will be extracted from the filename.

### Enrichers

Enrichers will add things to the resource fragments, like missing metadata and labels.  If your project uses git, then annotations with the git branch and commit hash will be added to the metadata.

Default Enrichers will also create a default Service and DeploymentConfig when none are provided.

The default port value is 8080, but that can be overridden with the `--deploy.port` flag.

You can also override this value by providing a .nodeshift/deployment.yaml resource file


#### Resource Fragment Parameters

Some Resource Fragments might need to have a value set at "run time".  For example, in the fragment below, we have the `${SSO_AUTH_SERVER_URL}` parameter:

        apiVersion: v1
        kind: Deployment
        metadata:
            name: nodejs-rest-http-secured
        spec:
          template:
            spec:
              containers:
                - env:
                  - name: SSO_AUTH_SERVER_URL
                    value: "${SSO_AUTH_SERVER_URL}"
                  - name: REALM
                    value: master

To set that using nodeshift, use the `-d` option with a KEY=VALUE, like this:

    nodeshift -d SSO_AUTH_SERVER_URL=https://sercure-url

<!-- For more on writing openshift templates, [see here](https://docs.openshift.org/latest/dev_guide/templates.html#writing-templates) -->

### Project Archive

A user can specify exactly what files would like nodeshift to include to the archive it will generate by using the files property in package.json.

If a user does not use the files property in the package.json to filter what files they would like to include, then nodeshift by default will include everything except the **node_modules**, **.git** and **tmp** directories.

Nodeshift will also look for additional exclusion rules at a .gitignore file if there is one. Same thing with a .dockerignore file.

If both ignore files are present,  nodeshift will union them together and use that.

### API

Along with the command line, there is also a public API.  The API mirrors the commands.

API Docs - https://nodeshift.github.io/nodeshift/

* resource

* applyResource

* build

* deploy

* undeploy

Options that you can specify on the command line, can also be passed as an options object to the API

All methods are Promise based and will return a JSON object with information about each goal that is run.

For example, if the `deploy` method was run, it would return something similar:

    {
        build: {
            ... // build information
        },
        resources: [
            ... // resources created
        ],
        appliedResources: [
            ... // resources that were applied to the running cluster
        ]
    }

#### Example Usage
```javascript
const nodeshift = require('nodeshift');

// Deploy an Application
nodeshift.deploy().then((response) => {
    console.log(response);
    console.log('Application Deployed')
}).catch((err) => {
    console.log(err);
})
````
_please note: Currently, once a route, service, deployment config, build config, and imagestream config are created, those are re-used. The only thing that changes from deployment to deployment is the source code.  For application resources, you can update them by undeploying and then deploying again.  BuildConfigs and Imagestreams can be re-created using the --build.recreate flag_

#### Using with Kubernetes

Nodeshift can deploy Node.js applications to a Kubernetes Cluster using the `--kube` flag.

There are 2 options that can be passed.  `minikube` or `docker-desktop` . Passing just the `--kube` flag will default to minikube

Nodeshift expects that your code has a Dockerfile in its root directory.  Then deploying to kubernetes is as easy as running:

`npx nodeshift --kube=minikube`

Note on Minikube: This connects to Minikubes docker server, create a new container and then deploy and expose that container with a `Deployment` and `Service`

To learn more about [minikube](https://minikube.sigs.k8s.io/docs/start/).

To learn more about [docker-desktop](https://docs.docker.com/desktop/kubernetes/).


#### Openshift Rest Client Configuration

Nodeshift uses the [Openshift Rest Client](https://github.com/nodeshift/openshift-rest-client) under the hood to make all REST calls to the cluster.  By default, the rest client will look at your `~/.kube/config` file to authenticate you.  This file will be created when you do an `oc login`.

If you don't want to use `oc` to login first, you can pass in a username, password, and the server of the cluster to authenticate against.  If you are using a cluster with a self-signed certificate(like code ready containers), then you will need to add the `insecure` flag.

Also note, that when accessing the cluster this way,  the namespace will default to `default`.  If you need to target another namespace,  use the `namespace.name` flag.  Just make sure the user you use has the appropriate permissions.

An example of this might look something like this:

`npx nodeshift --username developer --password developer --server https://apiserver_for_cluster --insecure --namespace.name nodejs-examples`

You can also pass in a valid auth token using the `token` flag.  If both a token and username/password is specified,  the token will take the preference.

`npx nodeshift --token 123456789  --server https://apiserver_for_cluster --insecure --namespace.name nodejs-examples`

## Advanced Options

While nodeshift is very opinionated about deployment parameters, both the CLI and the API accept options that allow you to customize nodeshift's behavior.

#### version
Outputs the current version of nodeshift

#### projectLocation
Changes the default location of where to look for your project. Defaults to your current working directory(CWD)

#### configLocation
This option is passed through to the [Openshift Rest Client](https://www.npmjs.com/package/openshift-rest-client).  Defaults to the `~/.kube/config`

#### token
Auth token to pass into the openshift rest client for logging in with the API Server.  Overrides the username/password

#### username
username to pass into the openshift rest client for logging in with the API Server.

#### password
password to pass into the openshift rest client for logging in with the API Server.

#### server
server to pass into the openshift rest client for logging in with the API Server.

#### apiServer - Deprecated
Use server instead. apiServer to pass into the openshift rest client for logging in with the API Server.

#### insecure
flag to pass into the openshift rest client for logging in with a self signed cert.  Only used with apiServer login.  default to false.

#### forceLogin
Force a login when using the apiServer login.  Only used with apiServer login.  default to false

#### imageTag
Specify the tag of the docker image or image stream to use for the deployed application. defaults to latest.
For docker images these version tags correspond to the RHSCL tags of the [ubi8/nodejs s2i images](https://access.redhat.com/containers/#/registry.access.redhat.com/ubi8/nodejs-14)

#### dockerImage
Specify the s2i builder image of Node.js to use for the deployed applications.  Defaults to [ubi8/nodejs s2i images](https://access.redhat.com/containers/#/registry.access.redhat.com/ubi8/nodejs-14)

#### imageStream
Specify the image stream from which to get the s2i image of Node.js to use for the deployed application. If not specified defaults to
using a docker image instead.

#### web-app
Flag to automatically set the appropriate docker image for web app deployment. Defaults to false

#### resourceProfile
Define a subdirectory below .nodeshift/ that indicates where OpenShift resources are stored

#### outputImageStream
The name of the ImageStream to output to.  Defaults to project name from package.json

#### outputImageStreamTag
The tag of the ImageStream to output to. Defaults to latest

#### quiet
suppress INFO and TRACE lines from output logs.

#### expose
options to create a default route, if non is provided.  Defaults to false

#### removeAll
option to remove builds, buildConfigs and Imagestreams.  Defaults to false - **Only for the `undeploy` Command**

#### deploy.port
Flag to update the default ports on the resource files. Defaults to 8080

#### deploy.env
Flag to pass deployment config environment variables as NAME=Value.  Can be used multiple times.  ex: `nodeshift --deploy.env NODE_ENV=development --deploy.env YARN_ENABLED=true`

#### build.recreate
Flag to recreate a BuildConfig or Imagestream.  Defaults to false. Choices are "buildConfig", "imageStream", false, true.  If true, both are re-created

#### build.forcePull
Flag to make your BuildConfig always pull a new image from dockerhub.  Defaults to false

#### build.incremental
Flag to perform incremental builds(if applicable), which means it reuses artifacts from previously-built images. Defaults to false

#### build.env
Flag to pass build config environment variables as NAME=Value.  Can be used multiple times.  ex: `nodeshift --build.env NODE_ENV=development --build.env YARN_ENABLED=true`

#### build.strategy
Flag to change the build strategy used.  Values can be Docker or Source.  Defaults to Source

#### useDeployment
Flag to deploy the application using a Deployment instead of a DeploymentConfig. Defaults to false

#### knative
EXPERIMENTAL. Flag to deploy an application as a Knative Serving Service.  Defaults to false
Since this feature is experimental,  it is subject to change without a Major version release until it is fully stable.

#### kube
Flag to deploy an application to a vanilla kubernetes cluster.  At the moment only Minikube is supported.

#### rh-metering
Flag to add some metering labels to a deployment.  To change the nodeVersion label, use `--rh-metering.nodeVersion` flag.  Intended for use with Red Hat product images.  For more information on metering for Red Hat images, see [here](https://access.redhat.com/documentation/en-us/red_hat_build_of_node.js/14/html/release_notes_for_node.js_14/features-nodejs#node_js_metering_labels_for_openshift)

#### help
Shows the below help

        Usage: nodeshift [--options]

        Commands:
            nodeshift deploy          default command - deploy                   [default]
            nodeshift build           build command
            nodeshift resource        resource command
            nodeshift apply-resource  apply resource command
            nodeshift undeploy        undeploy resources
            nodeshift login           login to the cluster
            nodeshift logout          logout of the cluster

        Options:
            --version                Show version number                         [boolean]
            --projectLocation        change the default location of the project   [string]
            --kube                   Flag to deploy an application to a vanilla kubernetes
                           cluster.  At the moment only Minikube is supported.
                                                                                 [boolean]
            --configLocation         change the default location of the config    [string]
            --token                  auth token to pass into the openshift rest client for
                                     logging in.  Overrides the username/password [string]
            --username               username to pass into the openshift rest client for
                                     logging in                                   [string]
            --password               password to pass into the openshift rest client for
                                     logging in                                   [string]
            --apiServer              Deprecated - use the "server" flag instead. server address to pass into the openshift rest client
                                     for logging in                               [string]
            --server                 server address to pass into the openshift rest client
                                     for logging in                               [string]
            --insecure               flag to pass into the openshift rest client for
                                     logging in with a self signed cert.  Only used with
                                     apiServer login                             [boolean]
            --forceLogin             Force a login when using the apiServer login[boolean]
            --imageTag           The tag of the docker image to use for the deployed
                                application.                 [string] [default: "latest"]
            --web-app                flag to automatically set the appropriate docker image
                                     for web app deployment
                                                             [boolean] [default: false]
            --resourceProfile        Define a subdirectory below .nodeshift/ that indicates
                                     where Openshift resources are stored         [string]
            --outputImageStream      The name of the ImageStream to output to.  Defaults
                           to project name from package.json            [string]
            --outputImageStreamTag   The tag of the ImageStream to output to.    [string]
            --quiet                  suppress INFO and TRACE lines from output logs
                                                                                [boolean]
            --expose            flag to create a default Route and expose the default
                       service [boolean] [choices: true, false] [default: false]
            --namespace.displayName  flag to specify the project namespace display name to
                           build/deploy into.  Overwrites any namespace settings
                           in your OpenShift or Kubernetes configuration files
                                                                        [string]
            --namespace.create       flag to create the namespace if it does not exist.
                           Only applicable for the build and deploy command.
                           Must be used with namespace.name            [boolean]
            --namespace.remove       flag to remove the user created namespace.  Only
                           applicable for the undeploy command.  Must be used
                           with namespace.name                         [boolean]
            --namespace.name         flag to specify the project namespace name to
                           build/deploy into.  Overwrites any namespace settings
                           in your OpenShift or Kubernetes configuration files
                                                                        [string]
            --deploy.port        flag to update the default ports on the resource files.
                       Defaults to 8080                          [default: 8080]
            --build.recreate         flag to recreate a buildConfig or Imagestream
                    [choices: "buildConfig", "imageStream", false, true] [default: false]
            --build.forcePull        flag to make your BuildConfig always pull a new image
                                    from dockerhub or not
                                        [boolean] [choices: true, false] [default: false]
            --build.incremental  flag to perform incremental builds, which means it reuses
                                    artifacts from previously-built images
                                        [boolean] [choices: true, false] [default: false]
            --build.strategy         flag to change the build strategy.  Defaults to Source
                                      [choices: "Source", "Docker"]
            --metadata.out           determines what should be done with the response
                                    metadata from OpenShift
                    [string] [choices: "stdout", "ignore", "<filename>"] [default: "ignore"]
            --useDeployment          flag to deploy the application using a Deployment
                           instead of a DeploymentConfig
                               [boolean] [choices: true, false] [default: false]
            --knative                EXPERIMENTAL. flag to deploy an application
                           as a Knative Serving Service
                               [boolean] [choices: true, false] [default: false]
            --help                   Show help                                   [boolean]
            --cmd                                                      [default: "deploy"]



## Contributing

Please read the [contributing guide](./CONTRIBUTING.md)
