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

module.exports = async function namespace (config) {
  console.log(config);
};
// async function run() {
//   const client = await restClient(options);
//   const namespace = 'Fun Project';
//   const projectRequest = {
//     displayName: namespace,
//     metadata: {
//       name: namespace.replace(/\s+/g, '').toLowerCase()
//     }
//   };

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
