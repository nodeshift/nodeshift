'use strict';

const baseLabel = {
  providers: 'nodeshift'
};

// Return a basic label object to use in our metadata
function createLabel (labels) {
  return Object.assign({}, baseLabel, labels);
}

module.exports = createLabel;
