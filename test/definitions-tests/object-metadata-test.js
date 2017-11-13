'use strict';

const test = require('tape');
const proxyquire = require('proxyquire');

test('object-metadata - no labels', (t) => {
  const objectMetadata = proxyquire('../../lib/definitions/object-metadata', {
    './labels': () => {
      t.fail('should not be here');
    }
  });

  const obj = objectMetadata();
  t.equal(typeof obj, 'object', 'should return an object');
  t.end();
});

test('object-metadata - labels', (t) => {
  const objectMetadata = proxyquire('../../lib/definitions/object-metadata', {
    './labels': (labels) => {
      return labels;
    }
  });

  const options = {
    name: 'name',
    labels: {
      label1: 'label 1'
    }
  };

  const obj = objectMetadata(options);
  t.ok(obj.labels, 'shold have a labels prop');
  t.equal(obj.labels.label1, 'label 1', 'label should be equal');
  t.equal(obj.name, 'name', 'name property should be equal');
  t.end();
});
