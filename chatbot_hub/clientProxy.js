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

// Instantiate a DialogFlow client.
const DIALOGFLOW = require('dialogflow');

const SESSION_CLIENT = new DIALOGFLOW.SessionsClient();

const CONFIGURATION = require('../configuration').config;

const SESSION = require('./session');

/**
 * The client proxy serves as an abstraction layer in front of the Dialogflow service. This pattern is valuable in
 * scenarios where an application needs to be plugged into an existing environments eco system. For example when a custom
 * authentication and authorization system is in use.
 * *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */

exports.queryDialogflowWithUserUtterance = function (request, response) {
  console.log('Request to User Said was : ' + JSON.stringify(request.body));

  // Extract information from JSON request body
  let queryText = (request.body.query) ? request.body.query : '';
  let languageCode = (request.body.languageCode) ? request.body.languageCode : `${CONFIGURATION.languageCode}`;

  // Do nothing if nothing was sent
  if (!queryText || !queryText.length) {
    return;
  }

  // Construct the Dialogflow query request
  const query = {
    session: SESSION_CLIENT.sessionPath(CONFIGURATION.PROJECT_ID, SESSION.getSessionId()),
    queryInput: {
      text: {
        text: queryText,
        languageCode: languageCode
      }
    }
  };

    // Call the dialogflow service and return the response.
  let promise = SESSION_CLIENT.detectIntent(query);

  promise
    .then(responses => {
      const result = responses[0].queryResult;
      logQueryAndResponse(result);
      response.json(result);
    })
    .catch(err => {
      console.error('ERROR:', err);
      response.json = {Error: err};
    });
};

function logQueryAndResponse (result) {
  console.log(' Detected intent');
  console.log(`  Query: ${result.queryText}`);
  console.log(`  Response: ${result.fulfillmentText}`);
  if (result.intent) {
    console.log(`  Intent: ${result.intent.displayName}`);
  } else {
    console.log(`  No intent matched.`);
  }
}
