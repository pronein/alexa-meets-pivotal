const lib = require('lib');
const tracker = require('pivotaltracker');

/**
* Basic "Hello World" intent, can receive a `name` parameter
*   Call using $ lib . AlexaMeetsPivotal '{"slots":{"project":{"value":"<ProjectName>"},"iteration":{"value":<SprintNumber>}}}'
* @param {string} project Requested Deluxe project
* @param {number} iteration Requested iteration of project (optional)
* @returns {string}
*/
module.exports = (project='', iteration=0, callback) => {

  let apiToken = '';
  let client = new tracker.Client(apiToken);
  let projectId = 0;

  client.project(projectId).get(function(err, proj) {

    let currentIteration = proj.currentIterationNumber;

    client.project(projectId).iterations(currentIteration).get(function(err, iter) {

      return callback(null, `Project ${project} [${iteration}] - ${JSON.stringify(err ? err : iter)}`);
    });
  });
};
