# Nodeshift [![CircleCI](https://circleci.com/gh/nodeshift/nodeshift.svg?style=svg)](https://circleci.com/gh/nodeshift/nodeshift)
[![Build Status](https://travis-ci.org/nodeshift/nodeshift.svg?branch=master)](https://travis-ci.org/nodeshift/nodeshift) [![Coverage Status](https://coveralls.io/repos/github/nodeshift/nodeshift/badge.svg?branch=master)](https://coveralls.io/github/nodeshift/nodeshift?branch=master) [![Greenkeeper badge](https://badges.greenkeeper.io/nodeshift/nodeshift.svg)](https://greenkeeper.io/)

## What is it

Nodeshift is an opinionated command line application and programmable API that you can use to deploy Node.js projects to OpenShift. It's currently under heavy development and APIs are still shifting a bit. However, in spite of its beta nature, you can use nodeshift today to deploy Node.js applications to OpenShift.

## Prerequisites

* Node.js - version 8.x or greater

## Install

To install globally: `npm install -g nodeshift`

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

**resource** - will parse and create the application resources files on disk

**apply-resource** - does the resource goal and then deploys the resources to your running cluster

**build** - archives the code, creates a build config and imagestream and pushes the binary to the cluster

**deploy** -  a shortcut for running `resource`, `build` and `apply-resource`

**undeploy** - removes resources that were deployed with the apply-resource command


### `.nodeshift` Directory

The `.nodeshift` directory contains your resource fragements.  These are `.yml` files that describe your services, deployments, routes, etc.  By default, nodeshift will create a `Service` and `DeploymentConfig` in memory, if none are provided.  A `Route` resource fragment should be provided or use the `expose` flag if you want to expose your application to the outside world.

### Resource Fragments

OpenShift resource fragments are user provided YAML files which describe and enhance your deployed resources.  They are enriched with metadata, labels and more by nodeshift.

Each resource gets its own file, which contains some skeleton of a resource description. Nodeshift will enrich it and then combine all the resources into a single openshift.yml and openshift.json(located in ./tmp/nodeshift/resource/).

The resource object's `Kind`, if not given, will be extracted from the filename.

### Enrichers

Enrichers will add things to the resource fragments, like missing metadata and labels.  If your project uses git, then annotations with the git branch and commit hash will be added to the metadata.

Default Enrichers will also create a default Service and DeploymentConfig when none are provided.

The default port value is 8080, but that can be overriden with the `--deploy.port` flag.

You can also override this value by provideding a .nodeshift/deployment.yaml resource file


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

## Advanced Options

While nodeshift is very opinionated about deployment parameters, both the CLI and the API accept options that allow you to customize nodeshift's behavior.

#### version
Outputs the current version of nodeshift

#### projectLocation
Changes the default location of where to look for your project. Defaults to your current working directory(CWD)

#### configLocation
This option is passed through to the [Openshift Config Loader](https://www.npmjs.com/package/openshift-config-loader).  Defaults to the `~/.kube/config`

#### imageTag
Specify the tag of the docker image to use for the deployed application. defaults to latest.  These version tags corespond to the docker hub tags of the [nodeshift s2i images](https://hub.docker.com/r/nodeshift/centos7-s2i-nodejs/tags/)

#### dockerImage
Specify the s2i builder image of Node.js to use for the deployed applications.  Defaults to [nodeshift/centos7-s2i-nodejs](https://hub.docker.com/r/nodeshift/centos7-s2i-nodejs)

#### quiet
supress INFO and TRACE lines from output logs.

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

#### help
Shows the below help

        Usage: nodeshift [--options]

        Commands:
            nodeshift deploy          default command - deploy                   [default]
            nodeshift build           build command
            nodeshift resource        resource command
            nodeshift apply-resource  apply resource command
            nodeshift undeploy        undeploy resources

        Options:
            --version                Show version number                         [boolean]
            --projectLocation        change the default location of the project   [string]
            --imageTag           The tag of the docker image to use for the deployed
                                application.                 [string] [default: "latest"]
            --quiet                  supress INFO and TRACE lines from output logs
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
            --namesapce.name         flag to specify the project namespace name to
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
            --metadata.out           determines what should be done with the response
                                    metadata from OpenShift
                    [string] [choices: "stdout", "ignore", "<filename>"] [default: "ignore"]
            --help                   Show help                                   [boolean]
            --cmd                                                      [default: "deploy"]



## Contributing

Please read the [contributing guide](./CONTRIBUTING.md)
