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

/**
* Generate the BigQuery Query using the input from the user.
* By separating the various statements we can ensure we only
* Query for the data that user will see on screen, rather than pulling everything and doing
* a post filter.
**/
'use strict';

var exports = module.exports = {};

const CONFIGURATION = require('../configuration').config;

// Options for the columns to be returned.
exports.SelectOption = {
  ASK: 1,
  BID: 2,
  MID: 3,
  SPREAD: 4,
  COUNT: 5
};

exports.queryConfig = function queryConfig () {
  return {selectOptions: [exports.SelectOption.ASK, exports.SelectOption.BID],
    table: CONFIGURATION.PROJECT_ID + '.' + CONFIGURATION.FX_TABLE_VIEW,
    instrument: ''
  };
};

exports.constructQuery = function constructQuery (queryConfig) {
  var query = [];
  query.push(exports.constructSELECT(queryConfig));
  query.push(exports.getFROM(queryConfig));
  query.push(exports.getWHERE(queryConfig));
  query.push(exports.getAND(queryConfig));
  query.push(exports.getGROUPBY(queryConfig));
  query.push(exports.getORDERBY(queryConfig));

  return query.join(' ');
};

exports.getFROM = function getFrom (queryConfig) {
  return `FROM \`${queryConfig.table}\``;
};

// Note this makes use of PARTITIONTIME rather than _PARTITIONTIME as it is working against a view
exports.getWHERE = function getWHERE (queryConfig) {
  return 'WHERE PARTITIONTIME Between DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY) AND CURRENT_DATE ';
};

exports.getAND = function getAND (queryConfig) {
  return 'AND ID in ' + queryConfig.instrument;
};

exports.getGROUPBY = function getGROUPBY (queryConfig) {
  return 'GROUP BY ID, downSample ';
};

exports.getORDERBY = function getORDERBY (queryConfig) {
  return 'ORDER BY downSample ';
};

exports.getSELECT = function getSELECT (queryConfig) {
  return exports.constructSELECT(queryConfig);
};

exports.selectASK = function selectASK () {
  return 'AVG(Ask_Price) ask ';
};

exports.selectBID = function selectBID () {
  return 'AVG(bid_price) bid ';
};

exports.selectMID = function selectMID () {
  return 'AVG(Ask_Price) - AVG(bid_price) spread ';
};

exports.selectSPREAD = function selectSPREAD () {
  return '(AVG(Ask_Price) + AVG(bid_price))/2  mid ';
};

exports.selectCOUNT = function selectCOUNT () {
  return 'COUNT(1) cnt ';
};

exports.constructSELECT = function constructSELECT (queryConfig) {
  let l = [];
  const options = queryConfig.selectOptions;

  l.push('ID, TIMESTAMP_TRUNC( time, Hour) downSample');

  for (let i = 0; i < options.length; i++) {
    console.log(options[i]);
    console.log(exports.lookUpSELECT(options[i]));
    l.push(exports.lookUpSELECT(options[i]));
  }
  return 'SELECT ' + l.join(',');
};

exports.lookUpSELECT = function lookUpSELECT (selectOption) {
  if (selectOption === exports.SelectOption.ASK) {
    return exports.selectASK();
  }

  if (selectOption === exports.SelectOption.BID) {
    return exports.selectBID();
  }

  if (selectOption === exports.SelectOption.MID) {
    return exports.selectMID();
  }

  if (selectOption === exports.SelectOption.SPREAD) {
    return exports.selectSPREAD();
  }

  if (selectOption === exports.SelectOption.COUNT) {
    return exports.selectCOUNT();
  }

  return '';
};
