'use strict';

const Task = require('./task');
const Label = require('./label');

function Story(storyResponse) {
  const _story = this;

  _story.id = storyResponse.id;
  _story.name = storyResponse.name;
  _story.type = storyResponse['story_type'];
  _story.state = storyResponse['current_state'];
  _story.points = storyResponse.estimate === undefined ? '-' : storyResponse.estimate;
  _story.labels = storyResponse.labels.map(labelResponse => new Label(labelResponse));
  _story.tasks = storyResponse.tasks.map(taskResponse => new Task(taskResponse));

  return _story;
}

Story.prototype.getTotalHours = function(department, completeOnly, includeTechDebt, includeBugBash) {
  return this.tasks.reduce((agg, task) => {
    const validDepartment = !department || department.toUpperCase() === task.department;
    const validState = !completeOnly || task.isComplete;

    const validTechDebt = includeTechDebt || !this.isTechDebt();
    const validBugBash = includeBugBash || !this.isBugBash();
    const validLabels = validTechDebt && validBugBash;

    return agg + (validDepartment && validState && validLabels ? task.hours : 0);
  }, 0);
};

Story.prototype.isTechDebt = function() {
  return this.labels.some(label => label.name === 'tech-debt') && !this.isBugBash();
};

Story.prototype.isBugBash = function() {
  return this.labels.some(label => label.name === 'bug-bash');
};

module.exports = Story;
