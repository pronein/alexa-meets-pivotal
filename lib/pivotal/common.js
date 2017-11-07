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

  const totalHours = iteration.getTotalHours(null, false, true);
  const completeHours = iteration.getTotalHours(null, true, true);
  const remainingHours = totalHours - completeHours;

  const awardedPoints = iteration.getTotalPoints(true);

  console.log(JSON.stringify({
    velocity: iteration.velocity,
    sprintStories: sprintStoryCount,
    completeStories: iteration.getTotalStories(true, true),
    sprintProdStories: prodStoryCount,
    sprintTechDebtStories: techDebtStoryCount,
    sprintBugBashStories: bugBashStoryCount,
    totalPoints: iteration.getTotalPoints(),
    completePoints: awardedPoints,
    totalHours: totalHours,
    totalHoursDev: iteration.getTotalHours('DEV', false, true),
    totalHoursQa: iteration.getTotalHours('QA', false, true),
    completeHours: completeHours,
    completeHoursDev: iteration.getTotalHours('DEV', true, true),
    completeHoursQa: iteration.getTotalHours('QA', true, true)
  }, null, 2));

  let velocityMessage = `We are currently even with our averaged velocity of ${iteration.velocity}. `;
  if (iteration.velocity > awardedPoints) {
    velocityMessage = `We are currently under our averaged velocity of ${iteration.velocity}. `;
  } else if (iteration.velocity < awardedPoints) {
    velocityMessage = `We have surpassed our averaged velocity of ${iteration.velocity}. `;
  }

  return `The statistics for sprint ${iteration.sprint} of ${projectName} are as follows: ` +
    `There are ${sprintStoryCount} stories in this sprint, split ${prodStoryCount} and ${techDebtStoryCount} between product and tech debt ` +
    `of which ${iteration.getTotalStories(true, true)} are complete. ` +
    `This results in a total of ${iteration.getTotalPoints(true)} points having been thus far awarded out of ${iteration.getTotalPoints()}. ` +
    velocityMessage +
    `${completeHours} hours have been ticked off leaving ${remainingHours} hours to go. ` +
    `Also to note, ${bugBashStoryCount} bugs were bashed so far this sprint.`;
};

module.exports = Common;