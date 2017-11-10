# Nodeshift [![Build Status](https://travis-ci.org/bucharest-gold/nodeshift.svg?branch=master)](https://travis-ci.org/bucharest-gold/nodeshift) [![Coverage Status](https://coveralls.io/repos/github/bucharest-gold/nodeshift/badge.svg?branch=master)](https://coveralls.io/github/bucharest-gold/nodeshift?branch=master) [![Greenkeeper badge](https://badges.greenkeeper.io/bucharest-gold/nodeshift.svg)](https://greenkeeper.io/)

## What is it

Nodeshift is an opinionated command line application and programmable API that you can use to deploy Node.js projects to OpenShift. It's currently under heavy development and APIs are still shifting a bit. However, in spite of its beta nature, you can use nodeshift today to deploy Node.js applications to OpenShift.

## Prerequisites

* Node.js - version 8.x or greater
* npm - version 4.x or greater

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

By default, if you run just `nodeshift`, it will run the `deploy` goal, which runs everything.

**resource** - will parse and create the application resources files on disk

**apply-resource** - does the resource goal and will also push that to your running cluster

**build** - archives the code, creates build config and imagestream and pushes the binary to the cluster

**deploy** - does everything, the archiving of code and everything that apply-resource does

**undeploy** - removes things that were deployed with the apply-resource command


### .Nodeshift Directory

The `.nodeshift` directory is responsible for holding your resource fragements.  These are `.yml` files that describe you service, deployments, routes, etc.

### Resource Fragments

OpenShift resource fragments are user provided YAML files that can be enriched with metadata, labels and more by nodeshift.

Each resource gets its own file, which contains some skeleton of a resource description. Nodeshift will enrich it and then combine all the resources into a single openshift.yml and openshift.json(located in ./tmp/nodeshift/resource/).

The resource objects `Kind`, if not given, will be extracted from the filename.

### Enrichers

Enrichers will add things to the resource fragments, like missing metadata and labels.  If your project uses git, then annotations with the git branch and commit hash will be added to the metadata.

Default Enrichers will also create a default Service and DeploymentConfig when none are provided.


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

__note that we left off the "${}" on the key,  nodeshift knows to search for a key with ${} added back on__

<!-- For more on writing openshift templates, [see here](https://docs.openshift.org/latest/dev_guide/templates.html#writing-templates) -->

### API

Along with the command line, there is also a public API.  The API mirrors the commands.

* resource

* applyResource

* build

* deploy

* undeploy

Options that you can specify on the command line, can also be passed as an options object to the API

#### Example Usage

    const nodeshift = require('nodeshift');

    // Deploy an Application
    nodeshift.deploy().then((response) => {
        console.log(response);
        console.log('Application Deployed')
    }).catch((err) => {
        console.log(err);
    })

_please note: Currently, once a route, service, deployment config, build config, and imagestream config are created, those are re-used. The only thing that changes from deployment to deployment is the source code.  For application resources, you can update them by undeploying and then deploying again.  BuildConfigs and Imagestreams can be re-created using the --build.recreate flag_

## Advanced Options

While nodeshift tries to be very opinionated during the deployment process, but there are options available to pass to the cli or the API.

#### version
Outputs the current version of nodeshift

#### projectLocation
Changes the default location of where to look for your project. Defaults to your current working directory(CWD)

#### configLocation
Changes the default location of where to look for a configfile. Defaults to ~/.kube/

#### osc.strictSSL
Setting to pass to the [Openshift Rest Client](https://www.npmjs.com/package/openshift-rest-client) for SSL use.  To allow using a self-signed cert, set to false

#### osl.tryServiceAccount
Setting to pass to the [Openshift Config Loader](https://www.npmjs.com/package/openshift-config-loader). Set to false to by-pass service account lookup or use the KUBERNETES_AUTH_TRYSERVICEACCOUNT environment variable

#### nodeVersion
Specify the version of Node.js to use for the deployed application. defaults to latest.  These version tags corespond to the docker hub tags of the [bucharest-gold s2i images](https://hub.docker.com/r/bucharestgold/centos7-s2i-nodejs/tags/)

#### quiet
supress INFO and TRACE lines from output logs.

#### build.recreate
Flag to recreate a buildConfig or Imagestream.  Defaults to false. Choices are "buildConfig", "imageStream", false, true

#### build.forcePull
Flag to make your BuildConfig always pull a new image from dockerhub.  Defaults to false

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
            --configLocation         change the default location of the config    [string]
            --osc.strictSSL          setting to pass to the Openshift Rest Client. Set to
                                    false if using a self-sign cert
            --osl.tryServiceAccount  setting to pass to the Openshift Config Loader.
                                    Set to false to by-pass service account lookup
                                    or use the KUBERNETES_AUTH_TRYSERVICEACCOUNT
                                    environment variable

            --nodeVersion, -n        the version of Node.js to use for the deployed
                                    application.
                    [string] [choices: "latest", "9.x", "8.x", "7.x", "6.x", "5.x", "4.x"]
                                                                        [default: "latest"]
            --quiet                  supress INFO and TRACE lines from output logs
                                                                                [boolean]
            --build.recreate         flag to recreate a buildConfig or Imagestream
                    [choices: "buildConfig", "imageStream", false, true] [default: false]
            --build.forcePull        flag to make your BuildConfig always pull a new image
                                    from dockerhub or not
                                        [boolean] [choices: true, false] [default: false]
            --metadata.out           determines what should be done with the response
                                    metadata from OpenShift
                    [string] [choices: "stdout", "ignore", "<filename>"] [default: "ignore"]
            --help                   Show help                                   [boolean]
            --cmd                                                      [default: "deploy"]



## Contributing

Please read the [contributing guide](./CONTRIBUTING.md)
