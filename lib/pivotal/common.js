'use strict';

const API_TOKEN = '';

const projects = {
  'bankers dashboard': 0,
  'bankers': 0,
  'b d': 0
};

function Common() {
  return this;
}

Common.prototype.apiToken = API_TOKEN;

Common.prototype.getProjectId = function(projectName) {
  return projects.hasOwnProperty(projectName.toLowerCase()) ? projects[projectName.toLowerCase()] : 0;
};

Common.prototype.buildAlexaResponseFromIteration = function(projectName, iteration) {
  const sprintStoryCount = iteration.getTotalStories(false, true);
  const prodStoryCount = iteration.getTotalStories();
  const techDebtStoryCount = sprintStoryCount - prodStoryCount;
  const bugBashStoryCount = iteration.getTotalStories(false, true, true) - sprintStoryCount;

  console.log(JSON.stringify({
    velocity: iteration.velocity,
    sprintStories: sprintStoryCount,
    completeStories: iteration.getTotalStories(true, true),
    sprintProdStories: prodStoryCount,
    sprintTechDebtStories: techDebtStoryCount,
    sprintBugBashStories: bugBashStoryCount,
    totalPoints: iteration.getTotalPoints(),
    completePoints: iteration.getTotalPoints(true),
    totalHours: iteration.getTotalHours(null, false, true),
    totalHoursDev: iteration.getTotalHours('DEV', false, true),
    totalHoursQa: iteration.getTotalHours('QA', false, true),
    completeHours: iteration.getTotalHours(null, true, true),
    completeHoursDev: iteration.getTotalHours('DEV', true, true),
    completeHoursQa: iteration.getTotalHours('QA', true, true)
  }, null, 2));

  return `${projectName} sprint ${iteration.sprint}`;
};

module.exports = Common;