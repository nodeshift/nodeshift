# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [5.0.0](https://github.com/nodeshift/nodeshift/compare/v4.2.0...v5.0.0) (2020-01-22)


### ⚠ BREAKING CHANGES

* The api for the openshift rest client has changed slightly, but there should be no nodeshift api changes

While this doesn't have to be a semver-major release, there might be some unexpected bugs.  One known issue, is we are no longer passing a custom config to the rest client.  If this removal causes issues we can work on a way to put it back in

### Features

* pass in a non-default configLocation. ([#400](https://github.com/nodeshift/nodeshift/issues/400)) ([f1bd1b3](https://github.com/nodeshift/nodeshift/commit/f1bd1b3cba5e64cbfd8356f842f1c16e42f2e036)), closes [#341](https://github.com/nodeshift/nodeshift/issues/341) [#373](https://github.com/nodeshift/nodeshift/issues/373)
* remove deprecation warnings from openshift rest client ([#398](https://github.com/nodeshift/nodeshift/issues/398)) ([2b97f49](https://github.com/nodeshift/nodeshift/commit/2b97f491eaf252ed0166eb1cf6f6067d081a66c9)), closes [#377](https://github.com/nodeshift/nodeshift/issues/377)

## [4.2.0](https://github.com/nodeshift/nodeshift/compare/v4.1.0...v4.2.0) (2020-01-13)


### Features

* Adding web-app flag ([#395](https://github.com/nodeshift/nodeshift/issues/395)) ([d1d0c14](https://github.com/nodeshift/nodeshift/commit/d1d0c1429b12e3a00ad2cf754ec14639ff79e581))

## [4.1.0](https://github.com/nodeshift/nodeshift/compare/v4.0.0...v4.1.0) (2019-11-18)


### Features

* **enricher:** add runtime labels to resources. ([#380](https://github.com/nodeshift/nodeshift/issues/380)) ([1028af2](https://github.com/nodeshift/nodeshift/commit/1028af2c5776a54023d9e1ddca17f90b86c923ec)), closes [#374](https://github.com/nodeshift/nodeshift/issues/374)

## [4.0.0](https://github.com/nodeshift/nodeshift/compare/v3.1.1...v4.0.0) (2019-11-04)


### ⚠ BREAKING CHANGES

* Changing the base s2i images

This removes the deprecated nodeshift/centos7-s2i-nodejs images and replaces then with the UBI based Node images from Red Hat Software Collections

### src

* using ubi7/nodejs-10 as default image ([#372](https://github.com/nodeshift/nodeshift/issues/372)) ([0bc82bd](https://github.com/nodeshift/nodeshift/commit/0bc82bdf18a6bc0bb7195a95093bf91cd0c48294))

### [3.1.1](https://github.com/nodeshift/nodeshift/compare/v3.1.0...v3.1.1) (2019-08-19)

## [3.1.0](https://github.com/nodeshift/nodeshift/compare/v3.0.1...v3.1.0) (2019-08-19)


### Bug Fixes

* some typos in code and comments ([#330](https://github.com/nodeshift/nodeshift/issues/330)) ([b510e9d](https://github.com/nodeshift/nodeshift/commit/b510e9d))


### Features

* change the output Image Stream name and tag ([#347](https://github.com/nodeshift/nodeshift/issues/347)) ([3faa599](https://github.com/nodeshift/nodeshift/commit/3faa599)), closes [#337](https://github.com/nodeshift/nodeshift/issues/337)

## [3.0.1](https://github.com/nodeshift/nodeshift/compare/v3.0.0...v3.0.1) (2019-04-24)



# [3.0.0](https://github.com/nodeshift/nodeshift/compare/v2.1.1...v3.0.0) (2019-04-12)


* remove the string version of the namespace flag (#299) ([5674b89](https://github.com/nodeshift/nodeshift/commit/5674b89)), closes [#299](https://github.com/nodeshift/nodeshift/issues/299) [#282](https://github.com/nodeshift/nodeshift/issues/282)


### Bug Fixes

* build.recreate should also check the string version of true/false ([#297](https://github.com/nodeshift/nodeshift/issues/297)) ([140b13a](https://github.com/nodeshift/nodeshift/commit/140b13a)), closes [#295](https://github.com/nodeshift/nodeshift/issues/295)
* load the projectLocation not relative to the nodeshift-config.js file ([#302](https://github.com/nodeshift/nodeshift/issues/302)) ([eaf0046](https://github.com/nodeshift/nodeshift/commit/eaf0046)), closes [#301](https://github.com/nodeshift/nodeshift/issues/301)
* when the projectLocation flag is used and no file property in the package.json, use the correct location ([58e340a](https://github.com/nodeshift/nodeshift/commit/58e340a)), closes [#303](https://github.com/nodeshift/nodeshift/issues/303)


### Features

* BREAKING CHANGE: remove the nodeVersion flag. ([#298](https://github.com/nodeshift/nodeshift/issues/298)) ([1c104ff](https://github.com/nodeshift/nodeshift/commit/1c104ff)), closes [#281](https://github.com/nodeshift/nodeshift/issues/281)
* Remove Watch command ([#296](https://github.com/nodeshift/nodeshift/issues/296)) ([fa79166](https://github.com/nodeshift/nodeshift/commit/fa79166)), closes [#280](https://github.com/nodeshift/nodeshift/issues/280)
* Update to latest Openshift Rest Client ([#293](https://github.com/nodeshift/nodeshift/issues/293)) ([e73db9c](https://github.com/nodeshift/nodeshift/commit/e73db9c))


### BREAKING CHANGES

* Slight Refactor

* Updating the Openshift Rest Client to 2.1.0, which has a new API

* Removing strictSSL and tryServiceAccount flags since the updated openshift rest client doesn't need them.

* Removes the openshift config loader, which is no longer used
* remove the string option for namespace creation.  This has been deprecated and it is now time to remove it
* This removes the watch command

This feature was just wrapping the `oc rsync` command, which nodeshift probably shouldn't be doing.  It is better to just use that command instead



<a name="2.1.1"></a>
## [2.1.1](https://github.com/nodeshift/nodeshift/compare/v2.1.0...v2.1.1) (2019-02-04)


### Bug Fixes

* namespace.name spelling/parsing error ([#283](https://github.com/nodeshift/nodeshift/issues/283)) ([afb2a64](https://github.com/nodeshift/nodeshift/commit/afb2a64))



<a name="2.1.0"></a>
# [2.1.0](https://github.com/nodeshift/nodeshift/compare/v2.0.1...v2.1.0) (2019-02-01)


### Bug Fixes

* add the --no-perm=true option to the oc rsync command ([#277](https://github.com/nodeshift/nodeshift/issues/277)) ([b4695c6](https://github.com/nodeshift/nodeshift/commit/b4695c6)), closes [#274](https://github.com/nodeshift/nodeshift/issues/274)


### Features

* Create a namespace/project if one doesn't exist when using the --namespace flag ([#275](https://github.com/nodeshift/nodeshift/issues/275)) ([202d71b](https://github.com/nodeshift/nodeshift/commit/202d71b)), closes [#235](https://github.com/nodeshift/nodeshift/issues/235)



<a name="2.0.1"></a>
## [2.0.1](https://github.com/nodeshift/nodeshift/compare/v2.0.0...v2.0.1) (2018-12-12)


### Bug Fixes

* deployment enricher should also look for DeploymentConfig kind ([6a2c162](https://github.com/nodeshift/nodeshift/commit/6a2c162)), closes [#271](https://github.com/nodeshift/nodeshift/issues/271)



<a name="2.0.0"></a>
# [2.0.0](https://github.com/nodeshift/nodeshift/compare/v1.12.0...v2.0.0) (2018-11-07)


### Features

* update references of bucharest-gold to use the nodeshift namespace ([#269](https://github.com/nodeshift/nodeshift/issues/269)) ([6092108](https://github.com/nodeshift/nodeshift/commit/6092108)), closes [#268](https://github.com/nodeshift/nodeshift/issues/268)


### BREAKING CHANGES

* this now uses the nodeshift/centos7-s2i-nodejs image by default. This should be a semver major change.



<a name="1.12.0"></a>
# [1.12.0](https://github.com/nodeshift/nodeshift/compare/v1.11.0...v1.12.0) (2018-08-15)


### Features

* add the imageTag flag. ([#258](https://github.com/nodeshift/nodeshift/issues/258)) ([399081e](https://github.com/nodeshift/nodeshift/commit/399081e)), closes [#256](https://github.com/nodeshift/nodeshift/issues/256)



<a name="1.11.0"></a>
# [1.11.0](https://github.com/nodeshift/nodeshift/compare/v1.10.0...v1.11.0) (2018-07-24)


### Features

* create/update/remove a config map if there is one in the .nodeshift directory. ([#255](https://github.com/nodeshift/nodeshift/issues/255)) ([f6f96c7](https://github.com/nodeshift/nodeshift/commit/f6f96c7)), closes [#203](https://github.com/nodeshift/nodeshift/issues/203)



<a name="1.10.0"></a>
# [1.10.0](https://github.com/nodeshift/nodeshift/compare/v1.9.1...v1.10.0) (2018-07-19)


### Features

* add a flag, --build.incremental, that turns on incremental builds. ([#254](https://github.com/nodeshift/nodeshift/issues/254)) ([68be3dc](https://github.com/nodeshift/nodeshift/commit/68be3dc)), closes [#253](https://github.com/nodeshift/nodeshift/issues/253)



<a name="1.9.1"></a>
## [1.9.1](https://github.com/nodeshift/nodeshift/compare/v1.9.0...v1.9.1) (2018-07-03)


### Bug Fixes

* **health-check enricher:** don't fail if there is no dependencies prop in the package.json ([#250](https://github.com/nodeshift/nodeshift/issues/250)) ([96789c1](https://github.com/nodeshift/nodeshift/commit/96789c1)), closes [#249](https://github.com/nodeshift/nodeshift/issues/249)



<a name="1.9.0"></a>
# [1.9.0](https://github.com/nodeshift/nodeshift/compare/v1.8.1...v1.9.0) (2018-06-07)


### Bug Fixes

* travis-ci should use npm install instead of npm ci ([#242](https://github.com/nodeshift/nodeshift/issues/242)) ([938ec7d](https://github.com/nodeshift/nodeshift/commit/938ec7d))


### Features

* add the namespace flag ([#234](https://github.com/nodeshift/nodeshift/issues/234)) ([13e5316](https://github.com/nodeshift/nodeshift/commit/13e5316)), closes [#233](https://github.com/nodeshift/nodeshift/issues/233)
* **ingress:** create an Ingress if there is one in the .nodeshift directory ([#244](https://github.com/nodeshift/nodeshift/issues/244)) ([f98cad4](https://github.com/nodeshift/nodeshift/commit/f98cad4)), closes [#238](https://github.com/nodeshift/nodeshift/issues/238)



<a name="1.8.1"></a>
## [1.8.1](https://github.com/nodeshift/nodeshift/compare/v1.8.0...v1.8.1) (2018-05-25)


### Bug Fixes

* **README:** remove the section talking about default environment variables being added to the DeploymentConfig ([14cfb74](https://github.com/nodeshift/nodeshift/commit/14cfb74)), closes [#231](https://github.com/nodeshift/nodeshift/issues/231)



<a name="1.8.0"></a>
# [1.8.0](https://github.com/nodeshift/nodeshift/compare/v1.7.3...v1.8.0) (2018-05-25)


### Features

* add the --deploy.env flag ([#226](https://github.com/nodeshift/nodeshift/issues/226)) ([74c482c](https://github.com/nodeshift/nodeshift/commit/74c482c)), closes [#223](https://github.com/nodeshift/nodeshift/issues/223)



<a name="1.7.3"></a>
## [1.7.3](https://github.com/nodeshift/nodeshift/compare/v1.7.2...v1.7.3) (2018-05-21)


### Bug Fixes

* **package:** update request to version 2.87.0 ([#224](https://github.com/nodeshift/nodeshift/issues/224)) ([2af9b47](https://github.com/nodeshift/nodeshift/commit/2af9b47))



<a name="1.7.2"></a>
## [1.7.2](https://github.com/nodeshift/nodeshift/compare/v1.7.1...v1.7.2) (2018-05-14)


### Bug Fixes

* add a name (http) to the service port ([#218](https://github.com/nodeshift/nodeshift/issues/218)) ([c599dc0](https://github.com/nodeshift/nodeshift/commit/c599dc0))
* remove the hardcoded 8080 for ports. ([bd3f10b](https://github.com/nodeshift/nodeshift/commit/bd3f10b)), closes [#216](https://github.com/nodeshift/nodeshift/issues/216)
* update openshift-rest-client and request for security vulnerability.  https://nodesecurity.io/advisories/606 ([#220](https://github.com/nodeshift/nodeshift/issues/220)) ([95cf4c9](https://github.com/nodeshift/nodeshift/commit/95cf4c9))



<a name="1.7.1"></a>
## [1.7.1](https://github.com/nodeshift/nodeshift/compare/v1.7.0...v1.7.1) (2018-04-10)


### Bug Fixes

* **config:** add package name sanitisation ([#212](https://github.com/nodeshift/nodeshift/issues/212)) ([1c18b2a](https://github.com/nodeshift/nodeshift/commit/1c18b2a)), closes [#211](https://github.com/nodeshift/nodeshift/issues/211)



<a name="1.7.0"></a>
# [1.7.0](https://github.com/nodeshift/nodeshift/compare/v1.6.0...v1.7.0) (2018-04-02)


### Features

* **build.env:** add a --build.env flag to specify build config environment variables ([0a43536](https://github.com/nodeshift/nodeshift/commit/0a43536)), closes [#208](https://github.com/nodeshift/nodeshift/issues/208)



<a name="1.6.0"></a>
# [1.6.0](https://github.com/nodeshift/nodeshift/compare/v1.5.1...v1.6.0) (2018-03-22)


### Features

* Add an `--expose` flag which when true will create a default route and expose the default service ([6e06ec6](https://github.com/nodeshift/nodeshift/commit/6e06ec6))



<a name="1.5.1"></a>
## [1.5.1](https://github.com/nodeshift/nodeshift/compare/v1.5.0...v1.5.1) (2018-03-15)


### Bug Fixes

* **archiver:** fix for source archiver when no files property is found in the package.json ([3c856e8](https://github.com/nodeshift/nodeshift/commit/3c856e8)), closes [#200](https://github.com/nodeshift/nodeshift/issues/200)



<a name="1.5.0"></a>
# [1.5.0](https://github.com/nodeshift/nodeshift/compare/v1.4.1...v1.5.0) (2018-03-12)


### Features

* **config-loader:** expose the configLocation options for the openshift-config-loader. ([#198](https://github.com/nodeshift/nodeshift/issues/198)) ([7462ead](https://github.com/nodeshift/nodeshift/commit/7462ead)), closes [#197](https://github.com/nodeshift/nodeshift/issues/197)



<a name="1.4.1"></a>
## [1.4.1](https://github.com/nodeshift/nodeshift/compare/v1.4.0...v1.4.1) (2018-03-02)


### Bug Fixes

* **nodeshift:** No longer check and emit a warning for non-standard Node versions. ([fa0c44e](https://github.com/nodeshift/nodeshift/commit/fa0c44e)), closes [#194](https://github.com/nodeshift/nodeshift/issues/194)



<a name="1.4.0"></a>
# [1.4.0](https://github.com/nodeshift/nodeshift/compare/v1.3.3...v1.4.0) (2018-02-21)


### Features

* undeploy: Add an option that, when true, will also remove builds, buildConfigs and Imagestreams ([#190](https://github.com/nodeshift/nodeshift/issues/190))([aebb5a1](https://github.com/nodeshift/nodeshift/commit/aebb5a1626f861e0143807d133ce8dc5b3ab767a))


<a name="1.3.3"></a>
## [1.3.3](https://github.com/nodeshift/nodeshift/compare/v1.3.2...v1.3.3) (2018-02-19)



<a name="1.3.2"></a>
## [1.3.2](https://github.com/nodeshift/nodeshift/compare/v1.3.1...v1.3.2) (2018-02-13)


### Bug Fixes

* projectLocation should be set correctly. ([#189](https://github.com/nodeshift/nodeshift/issues/189)) ([4e061a9](https://github.com/nodeshift/nodeshift/commit/4e061a9)), closes [#188](https://github.com/nodeshift/nodeshift/issues/188)



<a name="1.3.1"></a>
## [1.3.1](https://github.com/nodeshift/nodeshift/compare/v1.3.0...v1.3.1) (2018-02-12)


### Bug Fixes

* **nodeshift-config:** allow config properties to overwritten with new rest client update ([#187](https://github.com/nodeshift/nodeshift/issues/187)) ([9587efb](https://github.com/nodeshift/nodeshift/commit/9587efb))

* **route-spec** update route spec definition to not overwrite the spec:to:name property if one is specified. ([#185](https://github.com/nodeshift/nodeshift/pull/185)) fixes [#184](https://github.com/nodeshift/nodeshift/issues/184)



# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.
