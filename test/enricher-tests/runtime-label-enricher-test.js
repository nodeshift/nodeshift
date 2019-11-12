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

// test('service enricher test - service', async (t) => {
//   const resourceList = [
//     {
//       kind: 'Service',
//       spec: {
//         ports: [
//           {
//             protocol: 'TCP',
//             port: 3000,
//             targetPort: 3000
//           }
//         ]
//       }
//     },
//     { kind: 'Deployment' }
//   ];
//   const se = await serviceEnricher.enrich(config, resourceList);

//   t.notEqual(se, resourceList, 'arrays should not be equal');
//   t.equal(Array.isArray(se), true, 'should return an array');
//   t.equal(resourceList.length, 2, 'resourceList size should not increases by 2');
//   t.ok(se[0].spec.selector, 'selector prop should be here');
//   t.equal(se[0].spec.selector.provider, 'nodeshift', 'provider should be nodeshift');
//   t.equal(se[0].spec.selector.project, config.projectName, `spec.selector.project should be ${config.projectName}`);
//   t.ok(se[0].spec.ports, 'ports prop should be here');
//   t.equal(se[0].spec.ports[0].port, 3000, 'port should be 3000');
//   t.equal(se[0].spec.ports[0].targetPort, 3000, 'targetPort should be 3000');
//   t.ok(Array.isArray(se[0].spec.ports), 'ports prop should be here');
//   t.ok(se[0].spec.type, 'type prop should be here');
//   t.equal(se[0].spec.type, 'ClusterIP', 'spec.type should be ClusterIP');
//   t.equal(se[0].spec.ports[0].name, 'http');
//   t.end();
// });

