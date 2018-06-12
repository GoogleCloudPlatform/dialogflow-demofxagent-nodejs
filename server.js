/**
 * Copyright 2018, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';
/**
* Setup endpoints for dealing with
*   - Dialogflow webhook requests
*   - User requests from the client
**/

// Defines all configuration for the FX-Agent
const configuration = require('./configuration').config;

// Defines the intents for the FX-Agent
const fxAgent = require('./fxBot/FXAgent');

// Deals with all client communication
const clientProxy = require('./chatbot_hub/clientProxy');

// Routes intents to their own handlers
const router = require('./chatbot_hub/router');

// Configuration data for graph client
const fxDisplayClient = require('./fxBot/fxDisplayClient');

const express = require('express');
const bodyParser = require('body-parser');

// App
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const basicAuth = require('express-basic-auth');

app.use(basicAuth({
  users: { 'hub': configuration.SECRET }
}));

app.get('/resources/config.js', (req, res) => { fxDisplayClient.firebaseUrl(req, res); });

// Service for dealing with text dialog from the client
app.post('/queryDialogflowWithUserUtterance', (request, response) => {
  clientProxy.queryDialogflowWithUserUtterance(request, response);
});

// Service for dealing with Webhook calls from Dialogflow
const handlers = fxAgent.setupFXAgent();
const processCallBacks = router.processConversation(handlers);

app.post('/conversationCallBack', processCallBacks);

const host = configuration.HOST;
const port = configuration.PORT;

app.listen(port, host);
console.log(`Running on http://${host}:${port}`);

// Client Pages
app.use(express.static('public'));
