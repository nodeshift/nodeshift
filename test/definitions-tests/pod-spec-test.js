'use strict';

const test = require('tape');
const proxyquire = require('proxyquire');

test('pod-spec - with no template.spec', (t) => {
  const ps = proxyquire('../../lib/definitions/pod-spec', {
    './container': (resource, config) => {
      return resource;
    }
  });

  const resource = {
    spec: {
      template: {}
    }
  };

  const podSpec = ps(resource, {});

  t.ok(podSpec.spec.template.spec, 'should have this prop');
  t.equal(resource, podSpec, 'should be equal'); // Not thrilled about this mutation
  t.end();
});

test('pod-spec - with template.spec', (t) => {
  const ps = proxyquire('../../lib/definitions/pod-spec', {
    './container': (resource, config) => {
      return resource;
    }
  });

  const resource = {
    spec: {
      template: {
        spec: {}
      }
    }
  };

  const podSpec = ps(resource, {});

  t.ok(podSpec.spec.template.spec, 'should have this prop');
  t.equal(resource, podSpec, 'should be equal'); // Not thrilled about this mutation
  t.end();
});
