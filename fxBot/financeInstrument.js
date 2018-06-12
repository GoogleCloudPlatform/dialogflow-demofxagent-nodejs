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

// Dependent on your insturment id storage format you can degine your own id file
const MAP_CURRENCY = require('./mapCurrency');

var exports = module.exports = {};

exports.createInstrumentId = function (data) {
  let result = exports.extractInstrument(data);
  let key = MAP_CURRENCY.generateId(result);

  const instrument = {
    data: data,
    key: key,
    errorMsg: result.errorMsg,
    usd: result.usd,
    first: result.first,
    second: result.second
  };
  console.log(instrument);
  return instrument;
};

/**
* Dialogflow will return a list of currency codes for example [USD,GBP] (matching ISO 4217)
* Today we do not have guaranteed order in the list coming back, so we construct two pairs from this pair.
* When dealing with fx it is common for a single currency to be uttered, for example 'Swissy' or 'euro'. In this
* situation the intention is that the currency as compared with USD.
*
* TODO: Next version of the sample we will deal with items like "cable" which is abbreviation for GBP:USD pair
**/
exports.extractInstrument = function extractInstrument (data) {
  console.log(data);
  const size = data.length;

  let result = {
    errorMsg: null,
    error: false
  };

  // More than 1 currency pair is not supported in v0.1 of the sample
  if (size > 2) {
    // Do not yet support RIC lists with more than one currency pair, return as ERROR
    result.errorMsg = 'Only one currency pair is supported at the current time. Could you please repeat.';
    result.error = true;
    return result;
  }

  // If only one currency then assume its against USD.
  if (size === 1) {
    // If there is only one item and that is USD, this is a error
    if (data[0] === 'USD') {
      result.errorMsg = 'I only recognised USD from your list, was the other currency missed?';
      result.error = true;
      return result;
    }
    // Create RIC in curr / dollar format for example EUR=
    result.first = data[0];
    result.usd = true;
    return result;
  }

  // If the user did use USD, for example Dollar Euro then set the first currency as Euro
  // Having the non-dollar currency as the first currency is desirable here as it makes the
  // instrument id creation simpler in the mapCurrency function.
  if (data[0] === 'USD') {
    result.usd = true;
    result.first = data[1];
    return result;
  }
  if (data[1] === 'USD') {
    result.usd = true;
    result.first = data[0];
    return result;
  }

  // If USD was not said by the user then pass in the first and second currencies
  result.usd = false;
  result.first = data[0];
  result.second = data[1];

  return result;
};
