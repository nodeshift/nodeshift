'use strict';

const test = require('tape');
const container = require('../../lib/definitions/container');

test('container test no container passed in', (t) => {
  const resource = {
    spec: {
      template: {
        spec: {}
      }
    }
  };
  const config = {
    projectName: 'project name',
    port: 8080
  };

  const c = container(resource, config);
  t.ok(c.spec.template.spec.containers, 'should have this property');
  t.ok(Array.isArray(c.spec.template.spec.containers), 'should be an array');
  t.equal(c.spec.template.spec.containers[0].ports[0].containerPort, 8080, 'should have port 8080');
  t.end();
});

test('container test', (t) => {
  const resource = {
    spec: {
      template: {
        spec: {
          containers: []
        }
      }
    }
  };
  const config = {
    projectName: 'project name'
  };

  const c = container(resource, config);
  t.ok(c.spec.template.spec.containers, 'should have this property');
  t.ok(Array.isArray(c.spec.template.spec.containers), 'should be an array');
  t.end();
});
