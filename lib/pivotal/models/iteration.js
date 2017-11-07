'use strict';

const Story = require('./story');

function Iteration(iterationResponse) {
  const _iteration = this;

  _iteration.id = iterationResponse.id;
  _iteration.sprint = iterationResponse.number;
  _iteration.velocity = iterationResponse.velocity;
  _iteration.stories = iterationResponse.stories
    .filter(storyResponse => /^\*{2}\s?\^/.exec(storyResponse.name.trim()) === null)
    .map(storyResponse => new Story(storyResponse));

  return _iteration;
}

function filterStories(completeOnly, includeTechDebt, includeBugBash) {
  return this.stories
    .filter(story => {
      return (!completeOnly || story.state === 'accepted') &&
        (includeTechDebt || !story.isTechDebt()) &&
        (includeBugBash || !story.isBugBash());
    });
}

Iteration.prototype.getTotalStories = function(completeOnly, includeTechDebt, includeBugBash) {
  return filterStories.bind(this)(completeOnly, includeTechDebt, includeBugBash)
    .length;
};

Iteration.prototype.getTotalPoints = function(completeOnly) {
  return filterStories.bind(this)(completeOnly)
    .reduce((agg, story) => agg + (story.points === '-' ? 0 : story.points), 0);
};

Iteration.prototype.getTotalHours = function(department, completeOnly, includeTechDebt, includeBugBash) {
  return this.stories
    .reduce((agg, story) => agg + story.getTotalHours(department, completeOnly, includeTechDebt, includeBugBash), 0);
};

module.exports = Iteration;
