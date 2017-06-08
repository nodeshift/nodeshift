# Nodeshift [![Build Status](https://travis-ci.org/bucharest-gold/nodeshift.svg?branch=master)](https://travis-ci.org/bucharest-gold/nodeshift) [![Coverage Status](https://coveralls.io/repos/github/bucharest-gold/nodeshift/badge.svg?branch=master)](https://coveralls.io/github/bucharest-gold/nodeshift?branch=master)

Nodeshift is a Plugin for running openshift deployments for node.js projects

_Disclaimer: Nodeshift is extremely experimental at the moment.  This means it is under heavy development, api's could change at any time until a 1.0.0 release_

### Install

To install globally: `npm install -g nodeshift`

or to use in an npm script

    npm install --save-dev nodeshift

    // inside package.json
    scripts: {
      nodeshift: nodeshift
    }

    $ npm run nodeshift

### Example Usage

#### Prerequisites

* Minishift

For this example, we will run against an Openshift Cluster running locally using Minishift.

There are directions here to install [Minishift](https://docs.openshift.org/latest/minishift/getting-started/installing.html)

_I installed using Homebrew and use Virtual Box as my hypervisor provider, so my command to initially start minishift was something like this: `minishift start --vm-driver=virtualbox`_


* OC command line tools

These are also part of the minishift install, and [step 2 of this section](https://docs.openshift.org/latest/minishift/getting-started/quickstart.html#starting-minishift) tells you how to put them on your path.

This guide also assumes you have a modern version(4+) of Node.js and npm installed.

#### Example

For this example, we will use this very simple express based node app, https://github.com/bucharest-gold/nodejs-rest-http

_From this point on, all commands will assume you are in the directory of this source code_

Notice that there is a `.nodeshift` directory in the project, this will hold application specific resource files for creating Routes/Serivces/DeploymentConfigs

Before running the nodeshift command, we first need to login to our Openshift Cluster running on Minishift using the `oc login` command

`oc login -u developer` for example.

Also make sure to either create a new project or change into an existing one.

Lets just create a new project for this example: `oc new-project node-demo`

All that is left is to run the nodeshift command.

The examples package.json has a script defined called "openshift" that will run the nodeshift command, run that like this:

    $ npm run openshift

There is a file called `runner.js`, this makes use of the one(currently) public API called `deployApplication`, that can be run like so:

    $ node runner.js


Or just calling nodeshift directly if you have it installed globally

    $ nodeshift


Whatever is run, you will see output similiar to this:

    > nodejs-rest-http@0.0.0 openshift /Users/lholmquist/develop/nodejs-boosters/nodejs-rest-http
    > nodeshift

    cleaned up
    created
    Archive Created
    Creating Build Config nodejs-rest-http-s2i for Source build
    Build Config Created/Updated
    Creating ImageStream nodejs-rest-http
    Image Stream Created/Updated
    Binary Upload Complete
    Waiting for build to finish
    Waiting for build to finish
    Waiting for build to finish
    Waiting for build to finish
    Build nodejs-rest-http-s2i-1 Complete
    Creating New Serivce
    Creating New Route
    Need to create deployment
    Resources Applied


If you login to your local Openshift cluster and navigate to the "node-demo" project, there should be a new deployment with a route to your application.

For example: `http://nodejs-rest-http-node-demo.192.168.99.100.nip.io/`

_please note: Currently, once a route, service, deployment config, build config, and imagestream config are created, those are re-used. The only thing that changes from deployment to deployment is the source code.  This will change in the future_

### .Nodeshift Directory

The `.nodeshift` directory is responsible for holding your resource files.  These are `.yml` files that describe you service, deployments and routes.

Currently, nodeshift will only create resources based on the files specified,  in the future, its possible somethings could be created by default

## Contributing

Please read the [contributing guide](./CONTRIBUTING.md)
