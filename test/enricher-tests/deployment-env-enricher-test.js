'use strict';

const test = require('tape');
const deploymentenEnvEnricher = require('../../lib/resource-enrichers/deployment-env-enricher');

test('deployment env enricher - no deployment config', (t) => {
  const resourceList = [
    {
      kind: 'Service',
      metadata: {
        name: 'service meta'
      }
    }
  ];

  const config = {
    projectName: 'Project Name',
    version: '1.0.0',
    context: {
      namespace: 'namespace'
    }
  };

  t.ok(deploymentenEnvEnricher.enrich, 'has an enrich property');
  t.equal(typeof deploymentenEnvEnricher.enrich, 'function', 'is a function');

  t.ok(deploymentenEnvEnricher.name, 'has an name property');
  t.equal(deploymentenEnvEnricher.name, 'deployment-env');

  const p = deploymentenEnvEnricher.enrich(config, resourceList);
  t.ok(p instanceof Promise, 'enricher should return a promise');

  p.then((dce) => {
    t.equal(Array.isArray(dce), true, 'should return an array');
    t.equal(dce.length, 1, 'array should have 1 thing');
    t.equal(dce[0].kind, 'Service', 'should have just the Service type');
    t.end();
  });
});

test('deployment env enricher - deployment config has no env', t => {
  const resourceList = [
    {
      kind: 'DeploymentConfig',
      spec: {
        template: {
          spec: {
            containers: [
              {
                name: 'project name'
              }
            ]
          }
        }
      }
    }
  ];

  const config = {
    projectName: 'Project Name',
    version: '1.0.0',
    context: {
      namespace: 'namespace'
    }
  };

  deploymentenEnvEnricher.enrich(config, resourceList).then(dce => {
    t.equal(Array.isArray(dce), true, 'should return an array');
    t.equal(dce.length, 1, 'array should have 1 thing');
    t.equal(dce[0].kind, 'DeploymentConfig', 'should have just the Service type');
    t.ok(dce[0].spec.template.spec.containers[0].env, 'env prop should be added');
    t.equal(Array.isArray(dce[0].spec.template.spec.containers[0].env), true, 'env prop is an array');
    t.end();
  });
});

test('deployment env enricher - deployment config has a env, but none passed in', t => {
  const resourceList = [
    {
      kind: 'DeploymentConfig',
      spec: {
        template: {
          spec: {
            containers: [
              {
                name: 'project name',
                env: [
                  {
                    name: 'NOT_PORT',
                    value: 'NOT_8080'
                  },
                  {
                    name: 'ENV2',
                    value: 'VALUE2'
                  }
                ]
              }
            ]
          }
        }
      }
    }
  ];

  const config = {
    projectName: 'Project Name',
    version: '1.0.0',
    context: {
      namespace: 'namespace'
    }
  };
  deploymentenEnvEnricher.enrich(config, resourceList).then(dce => {
    t.equal(Array.isArray(dce), true, 'should return an array');
    t.equal(dce.length, 1, 'array should have 1 thing');
    t.equal(dce[0].kind, 'DeploymentConfig', 'should have just the Service type');
    t.ok(dce[0].spec.template.spec.containers[0].env, 'env prop should be added');
    t.equal(Array.isArray(dce[0].spec.template.spec.containers[0].env), true, 'env prop is an array');
    t.equal(dce[0].spec.template.spec.containers[0].env.length, 2, 'should have 2 entries now');

    t.end();
  });
});

test('deployment env enricher - deployment config has a env, but none passed in', t => {
  const resourceList = [
    {
      kind: 'DeploymentConfig',
      spec: {
        template: {
          spec: {
            containers: [
              {
                name: 'project name'
              }
            ]
          }
        }
      }
    }
  ];

  const config = {
    projectName: 'Project Name',
    version: '1.0.0',
    context: {
      namespace: 'namespace'
    },
    deploy: {
      env: [
        { name: 'PORT', value: '4000' }
      ]
    }
  };
  deploymentenEnvEnricher.enrich(config, resourceList).then(dce => {
    t.equal(Array.isArray(dce), true, 'should return an array');
    t.equal(dce.length, 1, 'array should have 1 thing');
    t.equal(dce[0].kind, 'DeploymentConfig', 'should have just the Service type');
    t.ok(dce[0].spec.template.spec.containers[0].env, 'env prop should be added');
    t.end();
  });
});

test('deployment env enricher - deployment config has a env, passed in envs also, some overlapping', t => {
  const resourceList = [
    {
      kind: 'DeploymentConfig',
      spec: {
        template: {
          spec: {
            containers: [
              {
                name: 'project name',
                env: [
                  {
                    name: 'NOT_PORT',
                    value: 'NOT_8080'
                  },
                  {
                    name: 'ENV2',
                    value: 'VALUE2'
                  },
                  {
                    name: 'PORT',
                    value: '3000'
                  }
                ]
              }
            ]
          }
        }
      }
    }
  ];

  const config = {
    projectName: 'Project Name',
    version: '1.0.0',
    context: {
      namespace: 'namespace'
    },
    deploy: {
      env: [
        { name: 'PORT', value: '4000' }
      ]
    }
  };
  deploymentenEnvEnricher.enrich(config, resourceList).then(dce => {
    t.equal(Array.isArray(dce), true, 'should return an array');
    t.equal(dce.length, 1, 'array should have 1 thing');
    t.equal(dce[0].kind, 'DeploymentConfig', 'should have just the Service type');
    t.ok(dce[0].spec.template.spec.containers[0].env, 'env prop should be added');
    t.equal(Array.isArray(dce[0].spec.template.spec.containers[0].env), true, 'env prop is an array');
    t.equal(dce[0].spec.template.spec.containers[0].env.length, 3, 'should have 3 entries now');
    const envs = dce[0].spec.template.spec.containers[0].env.filter(e => e.name === 'PORT');
    t.equal(envs.length, 1, 'only has 1 env with name PORT');
    t.equal(envs[0].value, '4000', 'the value should be 4000');

    t.end();
  });
});
