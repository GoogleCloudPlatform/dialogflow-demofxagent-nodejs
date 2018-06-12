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

const BIGQUERY = require('@google-cloud/bigquery');
const PUBSUB = require('@google-cloud/pubsub');

const projectId = CONFIGURATION.PROJECT_ID;

// Log data into BigQuery
exports.logToBigQuery = function logToBigQuery (request) {
  if (!CONFIGURATION.LOG_REQUESTS_TO_BQ) {
    return;
  }

  const datasetId = CONFIGURATION.DATASET;
  const tableId = CONFIGURATION.LOGGING_TABLE;

  // TODO Check if the client should be moved to Global scope
  const bigquery = new BIGQUERY({
    projectId: projectId
  });

  let body = (request.body) ? request.body : 'error';

  if (body === 'error') {
    console.log('Request had no body.');
    return;
  }

  const rows = [{responseId: JSON.stringify(body.responseId), queryResult: JSON.stringify(body.queryResult)}];

  // Inserts logging data into a table
  bigquery
    .dataset(datasetId)
    .table(tableId)
    .insert(rows)
    .then(() => {
      console.log(`Inserted ${rows.length} rows`);
    })
    .catch(err => {
      if (err && err.name === 'PartialFailureError') {
        if (err.errors && err.errors.length > 0) {
          console.log('Insert errors:');
          err.errors.forEach(err => console.error(err));
        }
      } else {
        console.error('ERROR:', err);
      }
    });
};

// Send data into PubSub
exports.logToPubSub = function logToPubSub (request) {
  if (!CONFIGURATION.LOG_REQUESTS_TO_PUBSUB) {
    return;
  }

  // TODO Check if the client should be moved to Global scope
  const pubsubClient = new PUBSUB({
    projectId: projectId
  });

  let body = (request.body) ? request.body : 'error';

  // TODO Gather more data and record error
  if (body === 'error') {
    console.log('Request had no body.');
    return;
  }

  const dataBuffer = Buffer.from(JSON.stringify(body));

  pubsubClient
    .topic(CONFIGURATION.config.LOGGING_TOPIC)
    .publisher()
    .publish(dataBuffer)
    .then(messageId => {
      console.log(`Message ${messageId} published.`);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
};
