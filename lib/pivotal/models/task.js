'use strict';

function Task(taskResponse) {
  const _task = this;

  _task.id = taskResponse.id;
  _task.isComplete = taskResponse.complete;
  _task.description = taskResponse.description;
  _task.hours = _task.getHours();
  _task.department = _task.getDepartment();

  return _task;
}

Task.prototype.getDepartment = function() {
  const lowered = this.description.toLowerCase().trim();
  const deptRegex = /^(dev|qa)-?/;

  const match = deptRegex.exec(lowered);
  if (match) {
    return match[1].toUpperCase();
  }

  return 'NONE';
};

Task.prototype.getHours = function() {
  const lowered = this.description.toLowerCase().trim();
  const hoursRegex = /\((\d+\.?\d*?)hr?\)$/;

  const match = hoursRegex.exec(lowered);
  if (match) {
    return parseFloat(match[1]);
  }

  return 0;
};

module.exports = Task;
