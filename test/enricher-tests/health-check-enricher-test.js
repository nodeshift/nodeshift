'use strict';

const test = require('tape');

const healthCheckEnricher = require('../../lib/resource-enrichers/health-check-enricher');

test('health check enricher - no DeploymentConfig', (t) => {
  const resourceList = [
    {
      kind: 'Service'
    }
  ];

  const hce = healthCheckEnricher({}, resourceList);

  t.equal(typeof healthCheckEnricher, 'function', 'is a function');
  t.equal(Array.isArray(hce), true, 'should return an array');
  t.end();
});

test('health check enricher - no kube probe', (t) => {
  const resourceList = [
    {
      kind: 'DeploymentConfig',
      metadata: {
        name: 'deployment config meta'
      },
      spec: {
        template: {
          spec: {
            containers: [
              {
                ports: []
              }
            ]
          }
        }
      }
    }
  ];

  const config = {
    projectName: 'Project Name',
    projectPackage: {
      dependencies: {
        express: '4.1.1'
      }
    },
    version: '1.0.0',
    context: {
      namespace: 'namespace'
    }
  };

  const hce = healthCheckEnricher(config, resourceList);

  t.equal(typeof healthCheckEnricher, 'function', 'is a function');
  t.equal(Array.isArray(hce), true, 'should return an array');
  t.equal(hce[0].spec.template.spec.containers[0].livenessProbe, undefined, 'should not have a liveness probe added');
  t.equal(hce[0].spec.template.spec.containers[0].readinessProbe, undefined, 'should not have a readiness probe added');
  t.end();
});

test('health check enricher - with kube probe', (t) => {
  const resourceList = [
    {
      kind: 'DeploymentConfig',
      metadata: {
        name: 'deployment config meta'
      },
      spec: {
        template: {
          spec: {
            containers: [
              {
                ports: []
              }
            ]
          }
        }
      }
    }
  ];

  const config = {
    projectName: 'Project Name',
    projectPackage: {
      dependencies: {
        express: '4.1.1',
        'kube-probe': '0.2.0'
      }
    },
    version: '1.0.0',
    context: {
      namespace: 'namespace'
    }
  };

  const hce = healthCheckEnricher(config, resourceList);

  t.equal(typeof healthCheckEnricher, 'function', 'is a function');
  t.equal(Array.isArray(hce), true, 'should return an array');
  t.ok(hce[0].spec.template.spec.containers[0].livenessProbe, 'should have a liveness probe added');
  t.equal(hce[0].spec.template.spec.containers[0].livenessProbe.httpGet.path, '/api/health/liveness', 'should have a liveness probe url');
  t.ok(hce[0].spec.template.spec.containers[0].readinessProbe, 'should have a readiness probe added');
  t.equal(hce[0].spec.template.spec.containers[0].readinessProbe.httpGet.path, '/api/health/readiness', 'should have a readiness probe url');
  t.end();
});

test('health check enricher - non default', (t) => {
  const resourceList = [
    {
      kind: 'DeploymentConfig',
      metadata: {
        name: 'deployment config meta'
      },
      spec: {
        template: {
          spec: {
            containers: [
              {
                readinessProbe: {
                  httpGet: {
                    path: '/api/greeting',
                    port: 8080,
                    scheme: 'HTTP'
                  }
                },
                livenessProbe: {
                  httpGet: {
                    path: '/api/greeting',
                    port: 8080,
                    scheme: 'HTTP'
                  }
                }
              }
            ]
          }
        }
      }
    }
  ];

  const config = {
    projectName: 'Project Name',
    projectPackage: {
      dependencies: {
        express: '4.1.1',
        'kube-probe': '0.2.0'
      }
    },
    version: '1.0.0',
    context: {
      namespace: 'namespace'
    }
  };

  const hce = healthCheckEnricher(config, resourceList);

  t.equal(typeof healthCheckEnricher, 'function', 'is a function');
  t.equal(Array.isArray(hce), true, 'should return an array');
  t.ok(hce[0].spec.template.spec.containers[0].livenessProbe, 'should have a liveness probe added');
  t.equal(hce[0].spec.template.spec.containers[0].livenessProbe.httpGet.path, '/api/greeting', 'url should not be overwritten');
  t.ok(hce[0].spec.template.spec.containers[0].readinessProbe, 'should have a readiness probe added');
  t.equal(hce[0].spec.template.spec.containers[0].readinessProbe.httpGet.path, '/api/greeting', 'url should not be overwritten');
  t.end();
});
