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
    projectName: 'project name'
  };

  const c = container(resource, config);
  t.ok(c.spec.template.spec.containers, 'should have this property');
  t.ok(Array.isArray(c.spec.template.spec.containers), 'should be an array');
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
