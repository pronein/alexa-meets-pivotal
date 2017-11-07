const lib = require('lib');
//const pivotal = require('../pivotalapi');
const request = require('request');

const common = {
  apiToken: '',
  apiVersion: '5',
  apiTokenHeader: 'X-TrackerToken'
};

const rootUri = 'https://www.pivotaltracker.com/services/v' + common.apiVersion;

function Api() {
  this.getCurrentIterationId = function (projectId, cb) {

    const uri = [
      rootUri,
      Api.prototype.uris.projects,
      projectId
    ].join('/');

    const opts = {
      headers: {
        'Content-Type': 'application/json'
      },
      url: uri,
      method: 'GET'
    };

    opts.headers[common.apiTokenHeader] = common.apiToken;

    request(opts, function (err, res, data) {
      if (err) {
        return cb(err);
      }

      const parsed = JSON.parse(data);

      return cb(null, {
        currentIteration: parsed['current_iteration_number'],
        currentVelocity: parsed['velocity_averaged_over']
      });
    });
  };

  this.getIteration = function (projectId, iterationId, cb) {
    console.log(`Project Id: ${projectId}`);
    console.log(`Iteration Id: ${iterationId}`);

    const uri = [
      rootUri,
      Api.prototype.uris.projects,
      projectId,
      Api.prototype.uris.iterations,
      iterationId
    ].join('/');

    const opts = {
      headers: {
        'Content-Type': 'application/json'
      },
      url: uri + '?fields=',
      method: 'GET',
      qs: {
        fields: 'number,velocity,stories(id,name,story_type,estimate,current_state,tasks(description,complete))'
      }
    };

    opts.headers[common.apiTokenHeader] = common.apiToken;

    console.log(`Uri: ${uri}`);
    console.log(`Opts: ${JSON.stringify(opts)}`);

    request(opts, function (err, res, data) {
      if (err) {
        return cb(err);
      }

      const parsed = JSON.parse(data);
      const mapped = parsed.stories
        .filter(function (story) {
          return /^\*{2}\s?\^/.exec(story.name.trim()) === null;
        })
        .map(function (story) {
          return {
            id: story.id,
            type: story['story_type'],
            state: story['current_state'],
            points: story.estimate === undefined ? '-' : story.estimate,
            tasks: story.tasks.map(function (task) {
              return {
                id: task.id,
                isComplete: task.complete,
                department: getTaskDepartment(task.description),
                hours: getTaskHours(task.description)
              };
            })
          };
        });

      const completeStories = mapped.filter(function (m) {
        return m.state === 'accepted';
      });
      const totalPoints = mapped.reduce(function (agg, m) {
        return agg + (m.points !== '-' ? parseInt(m.points) : 0);
      }, 0);
      const completePoints = completeStories.reduce(function (agg, m) {
        return agg + (m.points !== '-' ? parseInt(m.points) : 0);
      }, 0);
      const totalHoursDev = mapped.reduce(function (agg, m) {
        return agg + m.tasks.reduce(function (tagg, t) {
            return tagg + (t.department === 'DEV' ? t.hours : 0);
          }, 0);
      }, 0);
      const totalHoursDevComplete = mapped.reduce(function (agg, m) {
        return agg + m.tasks.reduce(function (tagg, t) {
            return tagg + (t.department === 'DEV' && t.isComplete ? t.hours : 0);
          }, 0);
      }, 0);
      const totalHoursQa = mapped.reduce(function (agg, m) {
        return agg + m.tasks.reduce(function (tagg, t) {
            return tagg + (t.department === 'QA' ? t.hours : 0);
          }, 0);
      }, 0);
      const totalHoursQaComplete = mapped.reduce(function (agg, m) {
        return agg + m.tasks.reduce(function (tagg, t) {
            return tagg + (t.department === 'QA' && t.isComplete ? t.hours : 0);
          }, 0);
      }, 0);

      return cb(null, {
        velocity: parsed.velocity,
        totalStories: mapped.length,
        completeStories: completeStories.length,
        totalPoints: totalPoints,
        completePoints: completePoints,
        totalHours: totalHoursDev + totalHoursQa,
        totalHoursDev: totalHoursDev,
        totalHoursQa: totalHoursQa,
        completeHours: totalHoursDevComplete + totalHoursQaComplete,
        completeHoursDev: totalHoursDevComplete,
        completeHoursQa: totalHoursQaComplete,
        stories: mapped
      });
    });
  };

  function getTaskDepartment(description) {
    const lowered = description.toLowerCase().trim();
    const deptRegex = /^(dev|qa)-?/;

    const match = deptRegex.exec(lowered);
    if (match) {
      return match[1].toUpperCase();
    }

    return 'NONE';
  }

  function getTaskHours(description) {
    const lowered = description.toLowerCase().trim();
    const hoursRegex = /\((\d+\.?\d*?)h\)$/;

    const match = hoursRegex.exec(lowered);
    if (match) {
      return parseFloat(match[1]);
    }

    return 0;
  }
}


Api.prototype.uris = {
  projects: 'projects',
  iterations: 'iterations'
};

Api.prototype.projects = {
  'Bankers Dashboard': 0
};

/**
 * Basic "Hello World" intent, can receive a `name` parameter
 *   Call using $ lib . AlexaMeetsPivotal '{"slots":{"project":{"value":"<ProjectName>"},"iteration":{"value":<SprintNumber>}}}'
 * @param {string} project Requested Deluxe project
 * @param {number} iteration Requested iteration of project (optional)
 * @returns {string}
 */
module.exports = (project = '', iteration = 0, callback) => {

  //let apiToken = '';
  //let client = new tracker.Client(apiToken);
  let api = new Api();
  let projectId = api.projects[project];

  api.getCurrentIterationId(projectId, function (err, proj) {
    console.log(`${JSON.stringify(err ? err : proj, null, 2)}`);
    console.log(`Current Iteration #${proj.currentIteration}`);

    api.getIteration(projectId, iteration || proj.currentIteration, function (err, iter) {
      if (iter) delete iter.stories;

      console.log('Iteration Data:');
      console.log(JSON.stringify(err ? err : iter, null, 2));
      return callback(null, `Project ${project} [${iteration}]`);
    });
  });
};
