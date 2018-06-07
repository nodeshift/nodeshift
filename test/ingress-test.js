'use strict';

const test = require('tape');

test('test ingress, already created', (t) => {
  const ingress = require('../lib/ingress');
  const resource = {
    apiVersion: 'v1',
    kind: 'Service',
    metadata: {
      name: 'my route'
    },
    spec: {
      host: '192.168.1.1'
    }
  };

  const config = {
    projectName: 'test-project',
    context: {
      namespace: 'namespace'
    },
    projectVersion: '1.0.0',
    openshiftRestClient: {
      ingress:
      {
        find: (name) => {
          if (name !== resource.metadata.name) {
            t.fail('name argument does not match the resource.metadata.name');
          }
          return { code: 200, metadata: { name: 'ingress' } };
        }
      }
    }
  };

  const p = ingress(config, resource).then((service) => {
    t.equal(service.code, 200, 'ingress response code should be 200');
    t.end();
  });

  t.equal(p instanceof Promise, true, 'should return a Promise');
});

test('test ingress, not created', (t) => {
  const ingress = require('../lib/ingress');
  const resource = {
    apiVersion: 'extensions/v1beta1',
    kind: 'Ingress',
    metadata: {
      name: 'nodejs-istio-circuit-breaker-gateway'
    }
  };

  const config = {
    projectName: 'test-project',
    context: {
      namespace: 'namespace'
    },
    projectVersion: '1.0.0',
    openshiftRestClient: {
      ingress:
      {
        find: (name) => {
          return { code: 404 };
        },
        create: ingress => ingress
      }
    }
  };

  const p = ingress(config, resource).then((ingress) => {
    t.equal(ingress.kind, 'Ingress', 'is a Ingress Kind');
    t.equal(ingress.metadata.name, 'nodejs-istio-circuit-breaker-gateway', 'metadata.name should be nodejs-istio-circuit-breaker-gateway');
    t.end();
  });

  t.equal(p instanceof Promise, true, 'should return a Promise');
});
