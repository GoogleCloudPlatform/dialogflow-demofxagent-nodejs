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

// Deal with creating the Instrument Name to query against BigQuery
'use strict';

var exports = module.exports = {};

const CONFIGURATION = require('../configuration').config;
const QUERIES = require('./queries');

exports.getRicTS = function getRicTS (instrumentKey, db) {
  return exports.syncQuery(exports.fxTimeseriesQuery(instrumentKey), db);
};

exports.fxTimeseriesQuery = function fxTimeseriesQuery (instrument) {
  console.log('Instruments are :' + JSON.stringify(instrument));

  let queryConfig = QUERIES.queryConfig();
  queryConfig.selectOptions.push(QUERIES.SelectOption.MID);
  queryConfig.selectOptions.push(QUERIES.SelectOption.SPREAD);
  queryConfig.instrument = instrument;
  let query = QUERIES.constructQuery(queryConfig);

  console.log('Query = ' + query);

  return query;
};

exports.syncQuery = function syncQuery (sqlQuery, db) {
  // Imports the Google Cloud client library
  const BigQuery = require('@google-cloud/bigquery');

  // Creates a client
  const bigquery = new BigQuery({
    projectId: CONFIGURATION.PROJECT_ID
  });

  // Query options list: https://cloud.google.com/bigquery/docs/reference/v2/jobs/query
  const options = {
    query: sqlQuery,
    timeoutMs: 10000, // Time out after 10 seconds.
    useLegacySql: false, // Use standard SQL syntax for queries.
    queryParameters: {}
  };

  // Runs the query
  bigquery
    .query(options)
    .then(results => {
      const rows = results[0];
      console.log('Rows:');
      console.log(exports.tickToJson(rows));
      db.ref(CONFIGURATION.FIREBASE_PATH + '/data').set(JSON.stringify(exports.tickToJson(rows)));
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
};

exports.tickToJson = function tickToJson (rows) {
  var results = [];
  var i = 0;
  rows.map(function (row) {
    var data = {
      id: i,
      flag: row.RIC,
      currencyCode: row.RIC,
      ask: row.ask,
      bid: row.bid,
      mid: row.mid,
      spread: row.spread,
      count: row.cnt,
      asOf: row.downSample.value
    };
    results.push(data);
    i++;
  });
  return results;
};
