'use strict';

const test = require('tape');

const routeSpec = require('../../lib/definitions/route-spec');

test('route spec test', (t) => {
  const resource = {
    spec: {}
  };

  const config = {
    projectName: 'project name'
  };

  const rs = routeSpec(resource, config);
  t.equal(rs.spec.to.kind, 'Service', 'should have a kind of Service');
  t.equal(rs.spec.to.name, config.projectName, `name should be config.name ${config.name}`);
  t.end();
});
