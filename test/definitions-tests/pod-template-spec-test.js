'use strict';

const test = require('tape');
const proxyquire = require('proxyquire');

test('pod template spec test', (t) => {
  const podtemplateSpec = proxyquire('../../lib/definitions/pod-template-spec', {
    './pod-spec': (resource, config) => {
      return resource;
    }
  });

  const resource = {
    spec: {
      template: {}
    }
  };

  const config = {
    projectName: 'my project name',
    projectVersion: '1.0.1'
  };

  const pts = podtemplateSpec(resource, config);
  t.ok(pts.spec.template.metadata, 'should have a metadata prop');
  t.equal(resource, pts, 'should be the same'); // Not thrilled about this mutation
  t.end();
});

test('pod template spec test - template added', (t) => {
  const podtemplateSpec = proxyquire('../../lib/definitions/pod-template-spec', {
    './pod-spec': (resource, config) => {
      return resource;
    }
  });

  const resource = {
    spec: {
    }
  };

  const config = {
    projectName: 'my project name',
    projectVersion: '1.0.1'
  };

  const pts = podtemplateSpec(resource, config);
  t.ok(pts.spec.template, 'should have a template prop');
  t.end();
});

test('pod template spec test - has metadata', (t) => {
  const podtemplateSpec = proxyquire('../../lib/definitions/pod-template-spec', {
    './pod-spec': (resource, config) => {
      return resource;
    }
  });

  const resource = {
    spec: {
      template: {
        metadata: {
          name: 'already here'
        }
      }
    }
  };

  const config = {
    projectName: 'my project name',
    projectVersion: '1.0.1'
  };

  const pts = podtemplateSpec(resource, config);
  t.ok(pts.spec.template.metadata, 'should have a metadata prop');
  t.equal(pts.spec.template.metadata.name, 'already here', 'not overwritten');
  t.end();
});
