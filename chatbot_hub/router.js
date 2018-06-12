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

// Allow Log of all interactions to BigQuery / PubSub
var LOGGER = require('./logger');

// Allow different handlers to be registered to the router
exports.handlers = [];

/**
 * Responds to the Web call backs from Dialogflow
 *
 * @param {Object} handlers The list of intents that the router will handle
 */

exports.processConversation = function processConversation (handlers) {
  return function processConversation (request, response) {
    console.log('Request was : ' + JSON.stringify(request.body));

    LOGGER.logToBigQuery(request);
    LOGGER.logToPubSub(request);

    // An action is a string used to identify what needs to be done in fulfillment
    let action = (request.body.queryResult.action) ? request.body.queryResult.action : 'default';

    const actionHandlers = handlers;

    // If undefined or unknown action use the default handler
    if (!actionHandlers[action]) {
      action = 'default';
    }
    // Run the proper handler function to handle the request from Dialogflow
    sendResponse(actionHandlers[action](request), response);
  };
};

// Function to send correctly formatted responses to Dialogflow which are then sent to the user
function sendResponse (responseToUser, response) {
  // if the response is a string send it as a response to the user
  if (typeof responseToUser === 'string') {
    let responseJson = {fulfillmentText: responseToUser}; // displayed response
    response.json(responseJson); // Send response to Dialogflow
  } else {
    // If the response to the user includes rich responses or contexts send them to Dialogflow
    let responseJson = {};
    // Define the text response
    responseJson.fulfillmentText = responseToUser.fulfillmentText;
    // Optional: add rich messages for integrations (https://dialogflow.com/docs/rich-messages)
    if (responseToUser.fulfillmentMessages) {
      responseJson.fulfillmentMessages = responseToUser.fulfillmentMessages;
    }
    // Optional: add contexts (https://dialogflow.com/docs/contexts)
    if (responseToUser.outputContexts) {
      responseJson.outputContexts = responseToUser.outputContexts;
    }
    // Send the response to Dialogflow
    console.log('Response to Dialogflow: ' + JSON.stringify(responseJson));
    response.json(responseJson);
  }
}
