'use strict';

const test = require('tape');

const healthCheckEnricher = require('../../lib/resource-enrichers/health-check-enricher');

test('health check enricher - no DeploymentConfig', (t) => {
  const resourceList = [
    {
      kind: 'Service'
    }
  ];

  t.ok(healthCheckEnricher.enrich, 'has an enrich property');
  t.equal(typeof healthCheckEnricher.enrich, 'function', 'is a function');
  t.ok(healthCheckEnricher.name, 'has an name property');
  t.equal(healthCheckEnricher.name, 'health-check', 'has an enrich property');

  const p = healthCheckEnricher.enrich({}, resourceList);
  t.ok(p instanceof Promise, 'enricher should return a promise');

  p.then((hce) => {
    t.equal(Array.isArray(hce), true, 'should return an array');
    t.end();
  });
});

test('health check enricher - no kube probe', async (t) => {
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

  const hce = await healthCheckEnricher.enrich(config, resourceList);

  t.equal(Array.isArray(hce), true, 'should return an array');
  t.equal(hce[0].spec.template.spec.containers[0].livenessProbe, undefined, 'should not have a liveness probe added');
  t.equal(hce[0].spec.template.spec.containers[0].readinessProbe, undefined, 'should not have a readiness probe added');
  t.end();
});

test('health check enricher - with kube probe', async (t) => {
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
    },
    port: 8080
  };

  const hce = await healthCheckEnricher.enrich(config, resourceList);

  t.equal(Array.isArray(hce), true, 'should return an array');
  t.ok(hce[0].spec.template.spec.containers[0].livenessProbe, 'should have a liveness probe added');
  t.equal(hce[0].spec.template.spec.containers[0].livenessProbe.httpGet.path, '/api/health/liveness', 'should have a liveness probe url');
  t.equal(hce[0].spec.template.spec.containers[0].livenessProbe.httpGet.port, 8080, 'port should be 8080');
  t.ok(hce[0].spec.template.spec.containers[0].readinessProbe, 'should have a readiness probe added');
  t.equal(hce[0].spec.template.spec.containers[0].readinessProbe.httpGet.path, '/api/health/readiness', 'should have a readiness probe url');
  t.equal(hce[0].spec.template.spec.containers[0].readinessProbe.httpGet.port, 8080, 'port should be 8080');
  t.end();
});

test('health check enricher - non default', async (t) => {
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
                    port: 3000,
                    scheme: 'HTTP'
                  }
                },
                livenessProbe: {
                  httpGet: {
                    path: '/api/greeting',
                    port: 3000,
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
    },
    port: 8080
  };

  const hce = await healthCheckEnricher.enrich(config, resourceList);

  t.equal(Array.isArray(hce), true, 'should return an array');
  t.ok(hce[0].spec.template.spec.containers[0].livenessProbe, 'should have a liveness probe added');
  t.equal(hce[0].spec.template.spec.containers[0].livenessProbe.httpGet.path, '/api/greeting', 'url should not be overwritten');
  t.equal(hce[0].spec.template.spec.containers[0].livenessProbe.httpGet.port, 3000, 'port should be 3000');
  t.ok(hce[0].spec.template.spec.containers[0].readinessProbe, 'should have a readiness probe added');
  t.equal(hce[0].spec.template.spec.containers[0].readinessProbe.httpGet.path, '/api/greeting', 'url should not be overwritten');
  t.equal(hce[0].spec.template.spec.containers[0].readinessProbe.httpGet.port, 3000, 'port should be 3000');
  t.end();
});
