/*
 *
 *  Copyright 2016-2017 Red Hat, Inc, and individual contributors.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

'use strict';

const fs = require('fs');

// Returns an object with the enrichers
// The key property will be the name prop from the enricher
// The value will be the enrich function from the enricher
function loadEnrichers () {
  // find all the js files in the resource-enrichers directory
  const enrichers = fs.readdirSync(`${__dirname}/resource-enrichers`).reduce((loaded, file) => {
    const filesSplit = file.split('.');
    if (filesSplit[1] === 'js') {
      const mod = require(`./resource-enrichers/${file}`);
      loaded[mod.name] = mod.enrich;

      return loaded;
    }

    return loaded;
  }, {});

  return enrichers;
}

module.exports = loadEnrichers;
