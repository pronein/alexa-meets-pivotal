'use strict';

function Label(labelResponse) {
  const _label = this;

  _label.id = labelResponse.id;
  _label.name = labelResponse.name;

  return _label;
}

module.exports = Label;
