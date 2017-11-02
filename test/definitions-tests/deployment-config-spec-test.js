'use strict';

const test = require('tape');
const proxyquire = require('proxyquire');

const deploymentConfigSpec = proxyquire('../../lib/definitions/deployment-config-spec', {
  './pod-template-spec': (resource, config) => { return resource; }
});

test('deployment-config-spec test', (t) => {
  const resource = {};
  const config = {
    projectName: 'project1',
    namespace: 'project-namespace'
  };
  const configSpec = deploymentConfigSpec(resource, config);

  t.equal(typeof deploymentConfigSpec, 'function', 'should export a function');
  t.ok(configSpec.spec, 'should have a spec property');
  t.equal(configSpec.spec.replicas, 1, 'should have 1 replica');
  t.equal(configSpec.spec.revisionHistoryLimit, 2, 'should have a value of 2');

  t.equal(configSpec.spec.selector.app, config.projectName, 'should equal the config.projectname');
  t.equal(configSpec.spec.selector.project, config.projectName, 'should equal the config.projectname');
  t.equal(configSpec.spec.selector.provider, 'nodeshift', 'should equal nodeshift');

  t.equal(Array.isArray(configSpec.spec.triggers), true, 'this should be an array');
  t.equal(configSpec.spec.triggers[0].type, 'ConfigChange', 'first trigger should be a config change');
  t.equal(configSpec.spec.triggers[1].type, 'ImageChange', 'second trigger should be a image change');
  t.equal(configSpec.spec.triggers[1].imageChangeParams.from.name, `${config.projectName}:latest`, `image name should be ${config.projectName}:latest`);
  t.end();
});

test('depoyment spec pass in ', (t) => {
  const configSpec = deploymentConfigSpec({spec: {}}, {});

  t.ok(configSpec.spec, 'should have a spec property');
  t.end();
});
