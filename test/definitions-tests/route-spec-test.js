'use strict';

const test = require('tape');

const routeSpec = require('../../lib/definitions/route-spec');

test('route spec test', (t) => {
  const resource = {
    spec: {}
  };

  const config = {
    projectName: 'project name',
    port: 8080,
    exposeHost: 'project.name'
  };

  const rs = routeSpec(resource, config);
  t.equal(rs.spec.port.targetPort, 8080, 'targetPort should be 8080');
  t.equal(rs.spec.host, 'project.name', 'host should be project.name');
  t.equal(rs.spec.to.kind, 'Service', 'should have a kind of Service');
  t.equal(rs.spec.to.name, config.projectName, `name should be config.name ${config.projectName}`);
  t.equal(rs.spec.tls.insecureEdgeTerminationPolicy, 'Redirect', 'tls.insecureEdgeTerminationPoliocy shoud be redirect');
  t.end();
});

test('route spec test', (t) => {
  const resource = {
    spec: {
      to: {
        name: 'Not Project Name'
      },
      port: {
        targetPort: 3000
      },
      host: 'not.project.name'
    }
  };

  const config = {
    projectName: 'project name',
    port: 8080,
    exposeHost: 'project.name'
  };

  const rs = routeSpec(resource, config);
  t.equal(rs.spec.port.targetPort, 3000, 'targetPort should be 3000');
  t.equal(rs.spec.host, 'not.project.name', `host should not be overridden and use ${resource.spec.host}`);
  t.equal(rs.spec.to.kind, 'Service', 'should have a kind of Service');
  t.equal(rs.spec.to.name, 'Not Project Name', `name should not be overridden and use ${resource.spec.to.name}`);
  t.end();
});
