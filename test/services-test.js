'use strict';

const test = require('tape');

test('test services, already created', (t) => {
  const services = require('../lib/services');
  const resource = {
    apiVersion: 'v1',
    kind: 'Service',
    metadata: {
      name: 'my service'
    }
  };

  const config = {
    projectName: 'test-project',
    context: {
      namespace: 'namespace'
    },
    projectVersion: '1.0.0',
    openshiftRestClient: {
      api: {
        v1: {
          ns: (namespace) => {
            return {
              service: (name) => {
                console.log(name);
                if (name !== resource.metadata.name) {
                  t.fail('name argument does not match the resource.metadata.name');
                }
                return {
                  get: () => {
                    return { code: 200, metadata: { name: 'service' } };
                  }
                };
              }
            };
          }
        }
      }
    }
  };

  const p = services(config, resource).then((service) => {
    t.equal(service.code, 200, 'secret response code should be 200');
    t.end();
  });

  t.equal(p instanceof Promise, true, 'should return a Promise');
});

test('test services, not created', (t) => {
  const services = require('../lib/services');
  const resource = {
    apiVersion: 'v1',
    kind: 'Service',
    metadata: {
      name: 'my service'
    }
  };

  const config = {
    projectName: 'test-project',
    context: {
      namespace: 'namespace'
    },
    projectVersion: '1.0.0',
    openshiftRestClient: {
      services:
      {
        find: (name) => {
          return { code: 404 };
        },
        create: service => service
      }
    }
  };

  const p = services(config, resource).then((service) => {
    t.equal(service.kind, 'Service', 'is a Service Kind');
    t.equal(service.metadata.name, 'my service', 'metadata.name should be my service');
    t.end();
  });

  t.equal(p instanceof Promise, true, 'should return a Promise');
});
