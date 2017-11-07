'use strict';

const lib = require('lib');
const pivotal = require('../../lib/pivotal');

const common = new pivotal.Common();
const api = new pivotal.Api(common.apiToken);

/**
 * Call using $ lib . AlexaMeetsPivotal '{"slots":{"project":{"value":"<ProjectName>"},"iteration":{"value":<SprintNumber>}}}'
 * @param {string} project Requested Deluxe project
 * @param {number} iterationId Requested iteration of project (optional)
 * @returns {string}
 */
module.exports = (project = '', iterationId = 0, callback) => {

  const projectId = common.getProjectId(project);

  if (!projectId) {
    return callback(null, 'Sorry, but I could not find that project.');
  }

  if (!iterationId) {
    api.getCurrentIterationId(projectId, function (err, iterationId) {
      if (err){
        return callback(err);
      }

      api.getIteration(projectId, iterationId, function (err, iteration) {
        if (err) {
          return callback(err);
        }

        return callback(null, common.buildAlexaResponseFromIteration(project, iteration));
      });
    });
  } else {
    api.getIteration(projectId, iterationId, function (err, iteration) {
      if(err) {
        return callback(err);
      }

      return callback(null, common.buildAlexaResponseFromIteration(project, iteration));
    });
  }
};
