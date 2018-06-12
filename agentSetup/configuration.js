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
var exports = module.exports = {};

var config = {

  // General Settings
  LANGUAGE_CODE: 'en-US',

  // This is the basic auth password for the application, do not use this for a production env.
  SECRET: '',

  PROJECT_ID: '',
  FIREBASE_PROJECT_ID: '',

  // Server Config
  PORT: '8080',
  HOST: '0.0.0.0',

  // BQ Parameters
  DATASET: 'TickData',

  FX_TABLE: 'TickData.tickdb',
  FX_TABLE_VIEW: 'TickData.tickdb_view',

  BQ_TIMEOUT_MS: 10000, // Time out after 10 seconds.
  BQ_USE_LEGACY_SQL: false, // Use standard SQL syntax for queries.

  // FireBase Path
  FIREBASE_PATH: '',

  // Setup logging of all user requests to BigQuery
  LOG_REQUESTS_TO_BQ: false,
  LOGGING_TABLE: 'FX_AGENT_LOGGING',

  // Setup logging of all pubsub requests to PubSub
  LOG_REQUESTS_TO_PUBSUB: false,
  LOGGING_TOPIC: 'FX_AGENT_LOGGING',

  USE_MOCK_DATA: true
};

exports.config = config;
