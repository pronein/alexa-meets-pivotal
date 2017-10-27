const lib = require('lib');

/**
* @param {string} name Intent Name to trigger
* @param {object} slots Slot Information
* @param {object} request Request Object (required)
* @returns {any}
*/
module.exports = (name = '', slots = {}, request = {}, context, callback) => {

  console.log(`Name: ${name}`);
  console.log(`Slots: ${JSON.stringify(slots)}`);
  request.intent = request.intent || {
    name: name,
    slots: Object.keys(slots).reduce((obj, key) => {
      console.log(`Obj: ${JSON.stringify(obj)} - Key: ${JSON.stringify(key)}`);
      obj[key] = (slots[key] && typeof slots[key] === 'object') ?
        slots[key] : {name: key, value: slots[key]};
      return obj[key];
    }, {})
  };

  if (!request.intent.name) {
    return callback(new Error('Intent name is required'));
  }

  console.log(`Request.Intent.Slots: ${JSON.stringify(request.intent.slots)}`);
  let params = Object.keys(request.intent.slots || {}).reduce((params, key) => {
    params[key] = request.intent.slots[key].value;
    return params;
  }, {});

  console.log(`params: ${JSON.stringify(params)}`);

  lib[`${context.service.identifier}.intents.${request.intent.name}`](params, (err, result) => {

    return callback(null, {
      version: context.service.environment,
      sessionAttributes: {},
      response: {
        outputSpeech: {
          type: 'PlainText',
          text: err ? `Error: ${err.message}` : result
        },
        shouldEndSession: true
      }
    });

  });

};
