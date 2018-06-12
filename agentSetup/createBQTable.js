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

// Defines all configuration for the FX-Agent
const CONFIGURATION = require('../configuration').config;

const BIGQUERY = require('@google-cloud/bigquery');

const BIGQUERY_CLIENT = new BIGQUERY({
  projectId: CONFIGURATION.PROJECT_ID
});

exports.createTable = function createTable () {
  runQuery(createTableQuery());
};

exports.createTableView = function () {
  runQuery(createTableView());
};

exports.createData = function addData () {
  runQuery(loadDummyData());
};

function runQuery (sqlQuery) {
  console.log('Running SQL ' + sqlQuery);
  const OPTIONS = {
    query: sqlQuery,
    timeoutMs: 10000,
    useLegacySql: false,
    queryParameters: {}
  };

  // Runs the query
  BIGQUERY_CLIENT
    .query(OPTIONS)
    .then(results => {
      const ROWS = results[0];
      console.log('SQL Completed ' + ROWS);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
}

function createTableQuery () {
  return `CREATE TABLE ${CONFIGURATION.FX_TABLE} (id STRING, ask_price FLOAT64, bid_price FLOAT64, time TIMESTAMP) PARTITION BY DATE(_PARTITIONTIME) OPTIONS(description="Sample table for Dialogflow demo")`;
}

function createTableView () {
  return `CREATE OR REPLACE VIEW \`${CONFIGURATION.PROJECT_ID}.${CONFIGURATION.FX_TABLE_VIEW}\` AS (SELECT ID, Bid_Price, Ask_Price, Time ,  EXTRACT(DATE FROM _PARTITIONTIME) AS PARTITIONTIME FROM \`${CONFIGURATION.PROJECT_ID}.${CONFIGURATION.FX_TABLE}\`)`;
}

function loadDummyData () {
  return `INSERT ${CONFIGURATION.FX_TABLE} (ID, ask_price,bid_price,time) VALUES ${data().join(',')}`;
}

function data () {
  let data = [];
  data.push("('CHFAUD', 1.0332, 1.0337, \"2018-04-01 01:00:00\")");
  data.push("('CHFAUD', 1.0331, 1.0336, \"2018-04-01 02:00:00\")");
  data.push("('CHFAUD', 1.0331, 1.0336, \"2018-04-01 03:00:00\")");
  data.push("('CHFAUD', 1.0332, 1.0337, \"2018-04-01 04:00:00\")");
  data.push("('CHFAUD', 1.0334, 1.0338, \"2018-04-01 05:00:00\")");
  data.push("('CHFAUD', 1.0334, 1.0337, \"2018-04-01 06:00:00\")");
  data.push("('CHFAUD', 1.0335, 1.0338, \"2018-04-01 07:00:00\")");
  data.push("('CHFAUD', 1.0334, 1.0337, \"2018-04-01 08:00:00\")");

  data.push("('EURAUD', 120.67, 120.82, \"2018-04-01 01:00:00\")");
  data.push("('EURAUD', 120.65, 120.80, \"2018-04-01 02:00:00\")");
  data.push("('EURAUD', 120.67, 120.82, \"2018-04-01 03:00:00\")");
  data.push("('EURAUD', 120.65, 120.80, \"2018-04-01 04:00:00\")");
  data.push("('EURAUD', 120.67, 120.82, \"2018-04-01 05:00:00\")");
  data.push("('EURAUD', 120.69, 120.85, \"2018-04-01 06:00:00\")");
  data.push("('EURAUD', 120.65, 120.80, \"2018-04-01 07:00:00\")");
  data.push("('EURAUD', 120.67, 120.82, \"2018-04-01 08:00:00\")");

  data.push("('EURGBP', 0.7136, 0.7138, \"2018-04-01 01:00:00\")");
  data.push("('EURGBP', 0.7136, 0.7138, \"2018-04-01 02:00:00\")");
  data.push("('EURGBP', 0.7136, 0.7138, \"2018-04-01 03:00:00\")");
  data.push("('EURGBP', 0.7136, 0.7138, \"2018-04-01 04:00:00\")");
  data.push("('EURGBP', 0.7136, 0.7138, \"2018-04-01 05:00:00\")");
  data.push("('EURGBP', 0.7136, 0.7138, \"2018-04-01 06:00:00\")");
  data.push("('EURGBP', 0.7136, 0.7138, \"2018-04-01 07:00:00\")");
  data.push("('EURGBP', 0.7136, 0.7138, \"2018-04-01 07:00:00\")");

  data.push("('GBPUSD', 1.0332, 1.0337, \"2018-04-01 01:00:00\")");
  data.push("('GBPUSD', 1.0332, 1.0337, \"2018-04-01 02:00:00\")");
  data.push("('GBPUSD', 1.0332, 1.0337, \"2018-04-01 03:00:00\")");
  data.push("('GBPUSD', 1.0332, 1.0337, \"2018-04-01 04:00:00\")");
  data.push("('GBPUSD', 1.0332, 1.0337, \"2018-04-01 05:00:00\")");
  data.push("('GBPUSD', 1.0332, 1.0337, \"2018-04-01 06:00:00\")");
  data.push("('GBPUSD', 1.0332, 1.0337, \"2018-04-01 07:00:00\")");
  data.push("('GBPUSD', 1.0332, 1.0337, \"2018-04-01 08:00:00\")");

  return data;
}
