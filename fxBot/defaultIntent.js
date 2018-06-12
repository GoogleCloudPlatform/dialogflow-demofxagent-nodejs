/**
  Copyright 2018 Google LLC.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  https://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
**/
'use strict';

var exports = module.exports = {};

/*
* Some default events that are useful for any Agent. Please refer to documentation at:
* https://dialogflow.com/docs/intents#fallback_intents
*/
exports.handle = {
  // The default welcome intent has been matched, welcome the user (https://dialogflow.com/docs/events#default_welcome_intent)
  'input.welcome': (request) => {
    return ('Hello, Welcome to this example Dialogflow agent!');
  },
  // The default fallback intent has been matched, try to recover (https://dialogflow.com/docs/intents#fallback_intents)
  'input.unknown': (request) => {
    // Use the Actions on Google lib to respond to Google requests; for other requests use JSON
    return ('I\'m having trouble understanding, can you try again please?');
  },
  // Fall back position if nothing else is matched
  'default': (request) => {
    let responseToUser = {
      fulfillmentText: 'Default Response ! Hello there user.... Ask again?'
    };
    return responseToUser;
  }
};
