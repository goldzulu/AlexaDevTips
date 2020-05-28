const Alexa = require("ask-sdk-core");
const airtable = require("./airtable");
var helper = require("./helper.js");
const handlers = require("./handler");

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "LaunchRequest"
    );
  },
  async handle(handlerInput) {
    return await handlers.launchRequest(handlerInput);
  },
};

const SpeechconIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "SpeechconIntent"
    );
  },
  async handle(handlerInput) {
    return await handlers.speechconIntent(handlerInput);
  },
};

const ChangeVoiceIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "ChangeVoiceIntent"
    );
  },
  async handle(handlerInput) {
    return handlers.changeVoiceIntent(handlerInput);
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.HelpIntent"
    );
  },
  async handle(handlerInput) {
    return handlers.helpIntent(handlerInput);
  },
};

const RepeatIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "AMAZON.RepeatIntent"
    );
  },
  async handle(handlerInput) {
    return handlers.repeatIntent(handlerInput);
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      (Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "AMAZON.CancelIntent" ||
        Alexa.getIntentName(handlerInput.requestEnvelope) ===
          "AMAZON.StopIntent")
    );
  },
  async handle(handlerInput) {
    return handlers.stopIntent(handlerInput);
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) ===
      "SessionEndedRequest"
    );
  },
  async handle(handlerInput) {
    console.log("<=== SESSIONENDED HANDLER ===>");
    // Any cleanup logic goes here.
    return handlerInput.responseBuilder.getResponse();
  },
};

const IntentReflectorHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest"
    );
  },
  async handle(handlerInput) {
    return await handlers.intentReflector(handlerInput);
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  async handle(handlerInput, error) {
    return handlers.error(handlerInput, error);
  },
};

const RequestLog = {
  async process(handlerInput) {
    console.log(`REQ ENV ${JSON.stringify(handlerInput.requestEnvelope)}`);
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const userRecord = await airtable.getUserRecord(handlerInput);
    sessionAttributes.user = userRecord.fields;
    sessionAttributes.isError = false;
    console.log("USER RECORD = " + JSON.stringify(userRecord.fields));
  },
};

const ResponseLog = {
  process(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const response = handlerInput.responseBuilder.getResponse();
    console.log("RESPONSE BUILDER = " + JSON.stringify(response));
    sessionAttributes.previousSpeak = response.outputSpeech.ssml
      .replace("<speak>", "")
      .replace("</speak>", "");
    sessionAttributes.previousReprompt = response.reprompt.outputSpeech.ssml
      .replace("<speak>", "")
      .replace("</speak>", "");
  },
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    SpeechconIntentHandler,
    HelpIntentHandler,
    RepeatIntentHandler,
    ChangeVoiceIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    IntentReflectorHandler // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
  )
  .addErrorHandlers(ErrorHandler)
  .addRequestInterceptors(RequestLog)
  .addResponseInterceptors(ResponseLog)
  .withApiClient(new Alexa.DefaultApiClient())
  .lambda();
