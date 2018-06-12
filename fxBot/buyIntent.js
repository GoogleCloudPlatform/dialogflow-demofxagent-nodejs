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
* Function to handle v2 webhook requests from Dialogflow
*/
exports.handle = {
  'input.Buy-WithContext': (request) => {
    // Parameters are any entites that Dialogflow has extracted from the request.
    let parameters = request.body.queryResult.parameters || {}; // https://dialogflow.com/docs/actions-and-parameters

    let amount = parameters.Amount;
    let currency = parameters.Currency;

    let responseToUser = {
      fulfillmentText: `The Spread for the amount ${amount} with currency ${currency} is XXX `
    };

    // This is the custom Graph
    return responseToUser; // Send simple response to user
  }
};
