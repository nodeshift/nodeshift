'use strict';

const test = require('tape');
const rle = require('../../lib/resource-enrichers/runtime-label-enricher');

const config = {
  projectName: 'Project Name',
  version: '1.0.0',
  namespace: {
    name: 'the namespace'
  },
  port: 8080
};

test('runtime-label-enricher', (t) => {
  t.ok(rle.enrich, 'has an enrich property');
  t.equal(typeof rle.enrich, 'function', 'enrich property is a function');
  t.ok(rle.name, 'has an name property');
  t.equal(rle.name, 'runtime-label', 'name property is runtime-label');
  t.end();
});

test('test runtime-label addition', async (t) => {
  const resourceList = [
    {
      kind: 'Service',
      metadata: {}
    },
    {
      kind: 'Deployment',
      metadata: {}
    }
  ];
  const le = await rle.enrich(config, resourceList);
  t.notEqual(le, resourceList, 'arrays should not be equal');
  t.equal(Array.isArray(le), true, 'should return an array');
  t.equal(resourceList.length, 2, 'resourceList size should not increases by 2');
  t.equal(resourceList[0].metadata.labels['app.openshift.io/runtime'], 'nodejs', 'should have the proper label');
  t.equal(resourceList[0].metadata.labels['app.kubernetes.io/name'], 'nodejs', 'should have the proper label');
  t.equal(resourceList[0].metadata.labels['app.kubernetes.io/component'], config.projectName, 'should have the proper label');
  t.equal(resourceList[0].metadata.labels['app.kubernetes.io/instance'], config.projectName, 'should have the proper label');
  t.end();
});
