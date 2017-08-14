'use strict';

const test = require('tape');

const secrets = require('../lib/secrets');

test('test getsecrets, already created', (t) => {
  const config = {
    openshiftRestClient: {
      secrets:
      {
        find: () => { return { code: 200, metadata: { name: 'my secret' } }; }
      }
    }
  };
  const resource = {};
  const p = secrets(config, resource).then((secret) => {
    t.equal(secret.code, 200, 'secret response code should be 200');
    t.end();
  });

  t.equal(p instanceof Promise, true, 'should return a Promise');
});

test('test getsecrets need to create', (t) => {
  const config = {
    projectName: 'test-project',
    context: {
      namespace: 'namespace'
    },
    projectVersion: '1.0.0',
    openshiftRestClient: {
      secrets:
      {
        find: () => { return { code: 404 }; },
        create: secret => secret
      }
    }
  };

  const resource = {
    apiVersion: 'v1',
    kind: 'Secret',
    metadata: {
      name: 'my-database-secret'
    },
    stringData: {
      user: 'luke',
      password: 'secret'
    }
  };

  secrets(config, resource).then((secret) => {
    console.log(secret);
    t.equal(secret.kind, 'Secret', 'is a secret Kind');
    t.equal(secret.metadata.name, 'my-database-secret', 'metadata.name should not be overriden');
    t.end();
  });
});
