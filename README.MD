# Dialogflow integration demo agent (V0.1)

__Please note this is not an official Google product.__

__These samples are designed to be used as demonstrators with demo data only.__

The FX Agent is an example of building an application using Dialogflow as a service endpoint, with no direct communication between the client and the Dialogflow APIs.
This pattern can be useful when Dialogflow needs to be embedded into existing applications which have their own authentication and authorization ecosystem. The application makes server-to-server calls between it and the Dialgoflow service.

A Node.js application is used to deploy a hub, which has two endpoints:

* /queryDialogflowWithUserUtterance: This endpoint receives the messages the user types into a UI and relays them to the Dialogflow service.
* /conversationWebHook: This endpoint deals with all fulfillment webhook calls from Dialogflow.

Although this demo makes use of an application running in a container for the fulfillment service, the majority of use cases can be easily served via Cloud Functions for Firebase, which will be easier to set up and maintain. Please see the following link for an example:

https://dialogflow.com/docs/how-tos/getting-started-fulfillment

BigQuery is used as a store of the data, in this case some demo tick data, but the calls can be easily adapted to any type of structured or semi-structured data held in BigQuery.

## An example call flow
1. The user connects to a client. After the user authenticates a session is initialized for the user.
2. The user makes a request for data around a currency pair, for example "Swissy Aussie," which is trader speak for CHF-AUD. The user may say "Please show me a graph of GBP vs dollar." This text is passed through to Dialogflow by the hub service. Here it it will also be possible to build authorization hooks, so the request and user ID could be passed onto another service to check if this user has permission for this data. For v0.1, this was not implemented.
3. Dialogflow extracts the Intent and the Currency parameter "CHF:AUD" from the dialog. It passes this back to the hub, which in turn passes the information back to the user as well as moving to the next step. 
4. The hub runs a query on BigQuery with the predicate CHF:AUD as the ID of the tick data that it wants to pull back. The program defaults to a downsample size of 1 hour and 3 days of BigQuery partitions. The tick data is sent as a JSON object back to the hub. If you wanted to return very large datasets, then some basic paging in the API calls should be used rather than creating a single JSON object.
5. The hub sends a Write request to Firebase database. This includes the JSON object that we want the client to display to the user.

### Primary JavaScript files
The following lists includes the key JavaScript files in the application:
* server.js sets up the endpoint to be started and also calls FXAgent.js.
* FXAgent.js sets up the different intent handlers needed by the FXAgent.
* router.js deals with sending requests to the correct intent handlers for the Dialogflow web hooks.
* session.js is a place holder; this demo example makes use of a hardcoded single session ID. In a real agent you will want different sessions for the different users.
* clientProxy.js deals with all incoming requests from the client.

## Knowledge prerequisites
* Working knowledge of Dialogflow and its fulfillment webhook
* Working knowledge of Docker and containers
* Working knowledge of Kubernetes Engine
* Working knowledge of Firebase Realtime Database

## Dev environment prerequisites

* Docker
* Node.js with npm
* Google Cloud SDK installed on your machine

### Code setup

Set up a service account that has IAM access to:

* Firestore Realtime Database
* BigQuery dataset
* Dialogflow API client

This application is a demo only. When building a non-demo application, please follow guidance @ https://cloud.google.com/docs/authentication/production.

* Clone GitHub repo
* Use npm to install all needed packages defined in package.json
  
  `cd finance-examples/fx-agent`
  
  `npm install`

If you wish to deploy the application on Kubernetes, you will also need to set up the secret as explained in this tutorial:

https://cloud.google.com/kubernetes-engine/docs/tutorials/authenticating-to-cloud-platform

#### Implement stubs
Some of the files are just stubs ready for your shiny new code to fill them! The stubs will work with the simple mock data, however. 

File:
fxBot/mapCurrency.js
Action:
This needs to match the format of the currency pair symbols used in BigQuery. Modify if your currency codes are different.

File:
chatbot_hub/session.js
Action:
Dialogflow can work with contexts (https://dialogflow.com/docs/contexts). If different users will use the demo, add code to session.js to read a unique session ID for each user session.

#### Setting up authorization for the setup scripts
Please follow the authorization guide to let you run the scripts in a local environment: 

https://cloud.google.com/sdk/docs/authorizing 

For local testing you can also make use of a local service account by setting the GOOGLE_APPLICATION_CREDENTIALS variable. Please see the following for more details:

https://cloud.google.com/docs/authentication/production

#### Set up configuration.js
You can find a template of the configuration.js file in the AgentSetup/ folder. Create a copy of this file in the fx-agent root and update the file with your information.

#### BigQuery setup

__Note: If your dataset is in Asia, you will need to modify the create script options.__
__Note: This script makes use of DDL within BigQuery. You can find more information here:__
 
https://cloud.google.com/bigquery/docs/data-definition-language

1. In the BigQuery console create a dataset called TickData.
2. At the command line, change to the "FX-Agent" folder and then run the following commands:

node -e 'require("./agentSetup/createBQTable").createTable()'

node -e 'require("./agentSetup/createBQTable").createTableView()'

node -e 'require("./agentSetup/createBQTable").createData()'

#### Firestore setup
In Firestore console create a path which matches your base path in the configuration.js file. The code will push data to this point.

#### Test before setting up agent
Before you set up the agent and the webhooks, run this test:
1. Start the server
    node server.js
    
2. Make a call to the server testing the non-Dialogflow setup
    Make sure you set the password in the call below to match the `SECRET` setting in the configuration file.
    curl -X POST http://localhost:8080/conversationCallBack  -H "Content-Type: application/json" -u hub:<password> --data @test/graphIntentTest.json

__Results__

After running the command you will see logging output on your console for the values queried from BigQuery. Log into Firebase and make sure that you can also see new data structures in the Firebase Realtime Database.

### Agent setup
For the next version of this example you will create the agent using API calls. For v0.1 this will be a manual process.

#### Create entities and intents
1. Create a new agent following the guide at: https://dialogflow.com/docs/agents#creating. Select Dialogflow V2 API.
2. Import the Currency entity https://dialogflow.com/docs/entities#upload using the file agentSetup/Currency.json
3. Import the Column entity https://dialogflow.com/docs/entities#upload using the file agentSetup/Column.json
4. Import the graph intent https://dialogflow.com/docs/intents#upload_intents using the file agentSetup/Graph.json

#### Create the WebHook
Deploy your application to Google Cloud Platform Container engine.

1. Set up the secret for your service account as described in https://cloud.google.com/kubernetes-engine/docs/tutorials/authenticating-to-cloud-platform.

2. Deploy your application using the instructions in the following procedure (up through step 6--"Expose your application to the Internet"):

https://cloud.google.com/kubernetes-engine/docs/tutorials/hello-app

The building of the container image will of course be done against your repository rather than hello-app.

Also make sure that you change the app name to `fxhub`, as in the following example:

gcr.io/${PROJECT_ID}/fxhub:v1

This value will also need to be changed in the hub.yaml file in the containers section.

__Note: Testing locally will fail unless you set up the local GOOGLE_APPLICATION_CREDENTIALS value as defined in the hub.yaml__

The IP of your Kubernetes service will be used to set the webhook in the fulfillment section of DialogFlow (https://dialogflow.com/docs/fulfillment#authentication)

Use the following parameters:

URL: http://<Kubernetes service IP>/conversationCallBack
Basic AUTH: username/password is 'hub'/<password in configuration.js>

You can now open http://<Kubernetes service IP> in your browser and start asking questions to the DialogFlow bot.

#### Running sample on the cloud

curl -X POST http://localhost:8080/queryDialogflowWithUserUtterance  -H "Content-Type: application/json" -u hub:<password> -d '{\"query\":\"Graph me euro dollar\"}'

## Known limitations

This sample does not deal with identity propagation; everything is done as one demo user.

