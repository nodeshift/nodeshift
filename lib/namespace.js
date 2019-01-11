/*
 *
 *  Copyright Red Hat, Inc, and individual contributors.
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

const logger = require('./common-log')();

async function create (config) {
  // Check that the namespace exists first
  const projects = await config.openshiftRestClient.projects.findAll();
  let project = projects.items.find((item) => {
    return item.metadata.name === config.namespace.name;
  });

  const projectRequest = {
    displayName: config.namespace.displayName,
    metadata: {
      name: config.namespace.name
    }
  };

  if (!project) {
    console.log('Need to Create');
    project = await config.openshiftRestClient.projectrequests.create(projectRequest);
  } else {
    // The project exists,  but is it currently terminating.  TODO check then create?
    console.log('project exists, but is it terminating?');
    if (project.status.phase === 'Terminating') {
      console.log('Wait until done?');
    } else {
      logger.warning(`Namespace ${config.namespace.name} already exists, using it`);
      return project;
    }
  }

  return project;
}

async function remove (config) {
  return config.openshiftRestClient.projects.remove(config.namespace.name);
}

module.exports = {
  create,
  remove
};
// async function run() {

//   // Check that the project exists first
//   const projects = await client.projects.findAll();
//   let project = projects.items.find((item) => {
//     return item.metadata.name === projectRequest.metadata.name;
//   });

//   if (!project) {
//     console.log('need To Create');

// //    if (project.status.phase !== 'Terminating') {

//       project = await client.projectrequests.create(projectRequest);

//       console.log(project);
//   //  } else {
//   //    console.log('current Terminating');
//    // }
//   } else {
//     console.log('Exists', project);
//     if (project.status.phase === 'Terminating') {
//       // Project is delete so it still shows up, so wait until it is gone to create
//       console.log('need to create once done Terminating');
//     }
//   }

//   if (project.status.phase !== 'Terminating') {
//     console.log('delete the project');

//     const dProject = await client.projects.remove(projectRequest.metadata.name);

//     console.log(dProject);
//   } else {
//     console.log('already deleting');
//   }
//   //const projects = await client.projects.remove(projectRequest.metadata.name);

//   //console.log(projects);
// }

// run().then(() => {
//   console.log('all done');
// });
