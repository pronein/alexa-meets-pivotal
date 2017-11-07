'use strict';

const request = require('request');
const Iteration = require('./models/iteration');

const ITERATION_FIELDS = 'number,velocity,stories(name,labels(name),story_type,estimate,current_state,tasks(description,complete))';

function Api(token) {
  const _api = this;

  const _defaultOpts = {
    baseUrl: 'https://www.pivotaltracker.com/services/v5',
    method: 'GET',
    headers: {
      'X-TrackerToken': token,
      'Content-Type': 'application/json'
    }
  };

  _api.get = function(uri, queryStringObj, cb) {
    let opts = Object.assign({}, _defaultOpts, {uri: uri, qs: queryStringObj});

    request(opts, function(err, res, data) {
      if(err) {
        return cb(err);
      }

      if (res && res.statusCode !== 200) {
        return cb(null, false);
      }

      return cb(null, JSON.parse(data));
    });
  }
}

Api.prototype.getCurrentIterationId = function(projectId, cb) {
  this.get(`projects/${projectId}`, {fields: 'current_iteration_number'}, function(err, project) {
    if (err) {
      return cb(err);
    }

    if (!project) {
      return cb(null, false);
    }

    return cb(null, parseInt(project['current_iteration_number']));
  });
};

Api.prototype.getIteration = function(projectId, iterationId, cb) {
  this.get(`projects/${projectId}/iterations/${iterationId}`, {fields: ITERATION_FIELDS}, function(err, iteration) {
    if (err) {
      return cb(err);
    }

    if (!iteration) {
      return cb(null, false);
    }

    return cb(null, new Iteration(iteration));
  });
};

module.exports.Api = Api;
