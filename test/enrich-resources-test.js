'use strict';

const test = require('tape');
const proxyquire = require('proxyquire');

test('enrich-resource', (t) => {
  const resourceList = [
    { kind: 'Service' },
    { kind: 'Route' },
    { kind: 'Deployment' },
    { kind: 'Secret' },
    { kind: 'other' }
  ];

  const enrichResource = proxyquire('../lib/enrich-resources', {
    './load-enrichers': () => { return {}; }
  });

  enrichResource({}, resourceList);

  t.pass('success');
  t.end();
});

test('enrich-resource - enricher is not a function', (t) => {
  let i = 0;
  const enrichResource = proxyquire('../lib/enrich-resources', {
    './load-enrichers': () => {
      return {
        deployment: () => {
          i++;
          t.pass('deployment should get called by default');
        },
        'deployment-config': () => {
          t.fail('deployment-config should not get called by default');
        },
        route: () => {
          i++;
          t.pass('route should get called by default');
        },
        service: () => {
          i++;
          t.pass('service should get called by default');
        },
        labels: () => {
          i++;
          t.pass('labels should get called by default');
        },
        'git-info': () => {
          i++;
          t.pass('git-info should get called by default');
        },
        'health-check': () => {
          i++;
          t.pass('health-check should get called by default');
        }
      };
    }
  });

  const p = enrichResource({}, []);
  t.ok(p instanceof Promise, 'should return a promise');

  p.then(() => {
    t.equal(i, 6, 'should have 6 default enrichers');
    t.pass('success');
    t.end();
  });
});

test('enrich-resource - knative enrichers', (t) => {
  let i = 0;
  const enrichResource = proxyquire('../lib/enrich-resources', {
    './load-enrichers': () => {
      return {
        'knative-serving-service': () => {
          i++;
          t.pass('should get called');
        },
        'deployment-config': () => {
          t.fail('should not get called');
        },
        route: () => {
          t.fail('should not get called');
        },
        service: () => {
          t.fail('should not get called');
        },
        labels: () => {
          t.fail('should not get called');
        },
        'git-info': () => {
          t.fail('should not get called');
        },
        'health-check': () => {
          t.fail('should not get called');
        }
      };
    }
  });

  const p = enrichResource({ knative: true }, []);
  t.ok(p instanceof Promise, 'should return a promise');

  p.then(() => {
    t.equal(i, 1, 'should have 1 knative enricher');
    t.pass('success');
    t.end();
  });
});

test('enrich-resource - deployment enrichers', (t) => {
  let i = 0;
  const enrichResource = proxyquire('../lib/enrich-resources', {
    './load-enrichers': () => {
      return {
        'deployment-config': () => {
          i++;
          t.pass('deployment-config should get called');
        },
        deployment: () => {
          t.fail('deployment should not get called');
        },
        route: () => {
          i++;
          t.pass('route should get called');
        },
        service: () => {
          i++;
          t.pass('service should get called');
        },
        labels: () => {
          i++;
          t.pass('labels should get called');
        },
        'git-info': () => {
          i++;
          t.pass('git-info should get called');
        },
        'health-check': () => {
          i++;
          t.pass('health-check should get called');
        }
      };
    }
  });

  const p = enrichResource({ useDeploymentConfig: true }, []);
  t.ok(p instanceof Promise, 'should return a promise');

  p.then(() => {
    t.equal(i, 6, 'should have 6 enrichers');
    t.pass('success');
    t.end();
  });
});
