'use strict';

const test = require('tape');
const proxyquire = require('proxyquire');

const config = {
  projectName: 'Project Name',
  version: '1.0.0'
};

test('git-info-enricher', (t) => {
  const gie = require('../../lib/resource-enrichers/git-info-enricher');

  t.ok(gie.enrich, 'has an enrich property');
  t.equal(typeof gie.enrich, 'function', 'enrich property is a function');
  t.ok(gie.name, 'has an name property');
  t.equal(gie.name, 'git-info', 'name property is git-info');
  t.end();
});

test('git-info-enricher - no git', (t) => {
  const resourceList = [
    {
      kind: 'Service',
      metadata: {
        name: 'service name'
      }
    }
  ];

  const gie = proxyquire('../../lib/resource-enrichers/git-info-enricher', {
    'git-repo-info': () => {
      return {
        branch: null
      };
    }
  });

  const list = gie.enrich(config, resourceList);

  t.equal(Array.isArray(list), true, 'should return an array');
  t.equal(list, resourceList, 'arrays should be equal');
  t.equal(list[0].metadata.annotations, undefined, 'no annotations');
  t.end();
});

test('git-info-enricher - no service or deployment', (t) => {
  const resourceList = [
    {
      kind: 'Route',
      metadata: {
        name: 'route name'
      }
    }
  ];

  const gie = proxyquire('../../lib/resource-enrichers/git-info-enricher', {
    'git-repo-info': () => {
      return {
        branch: 'master'
      };
    }
  });

  const list = gie.enrich(config, resourceList);

  t.equal(Array.isArray(list), true, 'should return an array');
  t.notEqual(list, resourceList, 'arrays should not be equal');
  t.equal(list[0].metadata.annotations, undefined, 'no annotations');
  t.end();
});

test('git-info-enricher - service', (t) => {
  const resourceList = [
    {
      kind: 'Service',
      metadata: {
        name: 'service name'
      }
    }
  ];

  const gie = proxyquire('../../lib/resource-enrichers/git-info-enricher', {
    'git-repo-info': () => {
      return {
        branch: 'master',
        sha: 'abcd1234'
      };
    }
  });

  const list = gie.enrich(config, resourceList);

  t.equal(Array.isArray(list), true, 'should return an array');
  t.notEqual(list, resourceList, 'arrays should not be equal');
  t.ok(list[0].metadata.annotations, 'annotations');
  t.equal(list[0].metadata.annotations['nodeshift/git-branch'], 'master', 'branch prop is master');
  t.equal(list[0].metadata.annotations['nodeshift/git-commit'], 'abcd1234', 'commit prop is abcd1234');
  t.end();
});

test('git-info-enricher - deploymentConfig', (t) => {
  const resourceList = [
    {
      kind: 'DeploymentConfig',
      metadata: {
        name: 'deployment config name'
      },
      spec: {
        template: {
          metadata: {
            name: 'spec template metadata name'
          }
        }
      }
    }
  ];

  const gie = proxyquire('../../lib/resource-enrichers/git-info-enricher', {
    'git-repo-info': () => {
      return {
        branch: 'master',
        sha: 'abcd1234'
      };
    }
  });

  const list = gie.enrich(config, resourceList);

  t.equal(Array.isArray(list), true, 'should return an array');
  t.notEqual(list, resourceList, 'arrays should not be equal');
  t.ok(list[0].metadata.annotations, 'annotations');
  t.equal(list[0].metadata.annotations['nodeshift/git-branch'], 'master', 'branch prop is master');
  t.equal(list[0].metadata.annotations['nodeshift/git-commit'], 'abcd1234', 'commit prop is abcd1234');
  t.ok(list[0].spec.template.metadata.annotations, 'annotations');
  t.equal(list[0].spec.template.metadata.annotations['nodeshift/git-branch'], 'master', 'branch prop is master');
  t.equal(list[0].spec.template.metadata.annotations['nodeshift/git-commit'], 'abcd1234', 'commit prop is abcd1234');
  t.end();
});

test('git-info-enricher - deploymentConfig - merge test', (t) => {
  const resourceList = [
    {
      kind: 'DeploymentConfig',
      metadata: {
        name: 'deployment config name',
        annotations: {
          key: 'value'
        }
      },
      spec: {
        template: {
          metadata: {
            name: 'spec template metadata name',
            annotations: {
              key: 'value'
            }
          }
        }
      }
    }
  ];

  const gie = proxyquire('../../lib/resource-enrichers/git-info-enricher', {
    'git-repo-info': () => {
      return {
        branch: 'master',
        sha: 'abcd1234'
      };
    }
  });

  const list = gie.enrich(config, resourceList);

  t.equal(Array.isArray(list), true, 'should return an array');
  t.notEqual(list, resourceList, 'arrays should not be equal');
  t.ok(list[0].metadata.annotations, 'annotations');
  t.equal(list[0].metadata.annotations['nodeshift/git-branch'], 'master', 'branch prop is master');
  t.equal(list[0].metadata.annotations['nodeshift/git-commit'], 'abcd1234', 'commit prop is abcd1234');
  t.equal(list[0].metadata.annotations['key'], 'value', 'commit prop is abcd1234');
  t.ok(list[0].spec.template.metadata.annotations, 'annotations');
  t.equal(list[0].spec.template.metadata.annotations['nodeshift/git-branch'], 'master', 'branch prop is master');
  t.equal(list[0].spec.template.metadata.annotations['nodeshift/git-commit'], 'abcd1234', 'commit prop is abcd1234');
  t.equal(list[0].spec.template.metadata.annotations['key'], 'value', 'commit prop is abcd1234');
  t.end();
});
