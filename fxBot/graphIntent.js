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

const CONFIGURATION = require('../configuration').config;
const FINANCE_INSTRUMENT = require('./financeInstrument');
const TICKS = require('./ticks');
// Functions for updating the firebase database
const ADMIN = require('firebase-admin');

// Init the admin client with Firebase configuration
ADMIN.initializeApp({
  credential: ADMIN.credential.applicationDefault(),
  databaseURL: `https://${CONFIGURATION.FIREBASE_PROJECT_ID}.firebaseio.com`
});

console.log('Fireabase Link is ' + `https://${CONFIGURATION.FIREBASE_PROJECT_ID}.firebaseio.com`);
/*
* Function to handle v2 webhook requests from Dialogflow for the FXAgent
* The Graph intent here refers to the FX Timeseries graph shown on the users information screen
*/
exports.handle = {
  // The Foreign Exchange Graph intent has been matched,
  'input.graph': (request) => {
    // Parameters are any entites that Dialogflow has extracted from the request.
    let parameters = request.body.queryResult.parameters || {}; // https://dialogflow.com/docs/actions-and-parameters

    let mutation = exports.mutation;
    mutation.screen.columns = parameters.Column;
    mutation.screen.rows = parameters.Currency;

    let responseToUser = {
      fulfillmentText: exports.updateClientData(mutation) // displayed response
    };

    return (responseToUser); // Send simple response to user
  }
};

var db = ADMIN.database();

// Mutation object to hold the Graph parameters
exports.mutation = {
  screen:
    { columns: '', rows: '' }
};

/**
 * Take a mutation and built out instrument parameters and create tick data
 *
 * @param {graph.mutation} mutation object.
 */
exports.updateClientData = function updateClientData (mutation) {
  // Set the clients configuration
  db.ref(CONFIGURATION.FIREBASE_PATH + '/screen/config/').set(mutation);

  // Get RIC Information
  const INSTRUMENT = FINANCE_INSTRUMENT.createInstrumentId(mutation.screen.rows);

  if (INSTRUMENT.error === true) {
    return INSTRUMENT.errorMsg;
  }

  // Set the clients data
  TICKS.getRicTS(INSTRUMENT.key, db);

  return exports.generateSuccessMsg(INSTRUMENT);
};

/**
 * Generate success message to be sent back to the client, used as response to dialogflow webhook
 *
 * @param {graph.mutation} mutation object.
 */
exports.generateSuccessMsg = function generateSuccessMsg (instrument) {
  return 'Building a graph with Currencies ' + instrument.data + ' translating to id ' + instrument.key;
};
