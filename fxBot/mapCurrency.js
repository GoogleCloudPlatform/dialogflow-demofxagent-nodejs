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

// Defines all configuration for the FX-Agent
const CONFIGURATION = require('../configuration').config;

// The order of the Instruments's is not transitive for the BQ call
exports.generateId = function generateId (instrument) {
  if (instrument.usd) {
    return '(\'' + instrument.first + getUSDid() + '\')';
  }
  return '(' + '"' + instrument.first + instrument.second + getUSDid() + '"' + ',' + '"' + instrument.second + instrument.first + getUSDid() + '"' + ')';
};

function getUSDid () {
  if (CONFIGURATION.USE_MOCK_DATA) {
    return 'USD';
  }
  return '=';
}
