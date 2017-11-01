# Nodeshift [![Build Status](https://travis-ci.org/bucharest-gold/nodeshift.svg?branch=master)](https://travis-ci.org/bucharest-gold/nodeshift) [![Coverage Status](https://coveralls.io/repos/github/bucharest-gold/nodeshift/badge.svg?branch=master)](https://coveralls.io/github/bucharest-gold/nodeshift?branch=master)

[![Greenkeeper badge](https://badges.greenkeeper.io/bucharest-gold/nodeshift.svg)](https://greenkeeper.io/)

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

```term
~/s/nodejs-rest-http ❯❯❯ nodeshift  --osc.strictSSL false
2017-07-12T18:56:28.850Z INFO loading configuration
2017-07-12T18:56:28.866Z INFO using namespace nodeshift-demo at https://192.168.99.100:8443
2017-07-12T18:56:28.882Z INFO creating archive of package.json, README.md, app.js, public, bin
2017-07-12T18:56:28.934Z INFO creating build configuration nodejs-rest-http-s2i
2017-07-12T18:56:28.952Z INFO creating image stream nodejs-rest-http
2017-07-12T18:56:28.962Z INFO uploading binary archive /usr/src/nodejs-rest-http/tmp/nodeshift/build/archive.tar
2017-07-12T18:56:31.138Z INFO binary upload complete
2017-07-12T18:56:31.138Z INFO waiting for build to finish
2017-07-12T18:56:31.192Z TRACE Receiving source from STDIN as archive ...
2017-07-12T18:56:31.399Z TRACE ---> Installing application source
2017-07-12T18:56:31.418Z TRACE ---> Building your Node application from source
2017-07-12T18:56:31.418Z TRACE ---> Using 'npm install'
2017-07-12T18:56:34.294Z TRACE added 50 packages in 2.441s
2017-07-12T18:56:34.913Z TRACE
2017-07-12T18:56:34.913Z TRACE Pushing image 172.30.1.1:5000/nodeshift-demo/nodejs-rest-http:latest ...
2017-07-12T18:56:34.986Z TRACE Pushed 3/8 layers, 38% complete
2017-07-12T18:56:34.986Z TRACE Pushed 4/8 layers, 51% complete
2017-07-12T18:56:35.000Z TRACE Pushed 5/8 layers, 64% complete
2017-07-12T18:56:35.004Z TRACE Pushed 6/8 layers, 77% complete
2017-07-12T18:56:35.006Z TRACE Pushed 7/8 layers, 89% complete
2017-07-12T18:56:35.315Z TRACE Pushed 8/8 layers, 100% complete
2017-07-12T18:56:35.610Z TRACE Push successful
2017-07-12T18:56:39.139Z INFO build nodejs-rest-http-s2i-1 complete
2017-07-12T18:56:39.147Z INFO docker image repository 172.30.1.1:5000/nodeshift-demo/nodejs-rest-http
2017-07-12T18:56:39.171Z INFO creating deployment configuration nodejs-rest-http
2017-07-12T18:56:39.177Z INFO creating new serivce nodejs-rest-http
2017-07-12T18:56:39.178Z INFO creating new route nodejs-rest-http
2017-07-12T18:56:39.187Z INFO route host mapping nodejs-rest-http-nodeshift-demo.192.168.99.100.nip.io
2017-07-12T18:56:39.199Z INFO done
```

If you login to your local Openshift cluster and navigate to the "node-demo" project, there should be a new deployment with a route to your application.

For example: `http://nodejs-rest-http-node-demo.192.168.99.100.nip.io/`

_please note: Currently, once a route, service, deployment config, build config, and imagestream config are created, those are re-used. The only thing that changes from deployment to deployment is the source code.  This will change in the future_

### .Nodeshift Directory

The `.nodeshift` directory is responsible for holding your resource files.  These are `.yml` files that describe you service, deployments and routes.

Currently, nodeshift will only create resources based on the files specified,  in the future, its possible somethings could be created by default

#### Commands & Goals

By default, if you run just `nodeshift`, it will run the `deploy` goal, which runs everything.

**resource** - will parse and create the application resources files on disk

**apply-resource** - does the resource goal and will also push that to your running cluster

**deploy** - does everything, the archiving of code and everything that apply-resource does

#### Template Parameters

Some templates might need to have a value set at "run time".  For example, in the template below, we have the `${SSO_AUTH_SERVER_URL}` parameter:

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

For more on writing openshift templates, [see here](https://docs.openshift.org/latest/dev_guide/templates.html#writing-templates)

### Advanced Options

There are a few options available on the CLI or when using the API

        Usage: nodeshift [--options]

        Commands:
            nodeshift deploy          default command - deploy                   [default]
            nodeshift resource        resource command
            nodeshift apply-resource  apply resource command

        Options:
            --version             Show version number                            [boolean]
            --projectLocation     change the default location of the project      [string]
            --configLocation      change the default location of the config       [string]
            --nodeshiftDirectory  change the default name of the directory nodeshift looks
                                    at for resource files                           [string]
            --osc.strictSSL       setting to pass to the Openshift Rest Client. Set to
                                    false if using a self-sign cert
            --nodeVersion, -n     the version of Node.js to use for the deployed
                                    application.
                [string] [choices: "latest", "8.x", "7.x", "6.x", "5.x", "4.x"] [default:
                                                                                "latest"]
            --build.recreate         flag to recreate a buildConfig or Imagestream
                [choices: "buildConfig", "imageStream", false, true] [default: false]
            --build.forcePull        flag to make your BuildConfig always pull a new image
                                      from dockerhub or not
                [boolean] [choices: true, false] [default: false]
            --help                Show help                                      [boolean]



## Contributing

Please read the [contributing guide](./CONTRIBUTING.md)
