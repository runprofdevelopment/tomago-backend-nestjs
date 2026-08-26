const config = require('../../../../config')();
const serviceAccount = require(`../../../../service-accounts/${config.env}.json`);
const projectId = serviceAccount.project_id;
const { isString } = require('lodash');
const { PubSub } = require('@google-cloud/pubsub');  // Imports the Google Cloud client library
const PubSubClient = new PubSub({ projectId });
console.log('project_id =', projectId);

module.exports = class PubSub {
  /**
   * @param {String} topicNameOrId 
   * @param {String|JSON} message 
   * @returns {Promise<String>} messageId
   */
  static async publishMessage(topicNameOrId, message) {
    try {
      // const data = JSON.stringify({ Your message data here });
      const data = isString(message) ? message : JSON.stringify(message);
      const dataBuffer = Buffer.from(data);
      const messageId = await PubSubClient.topic(topicNameOrId).publishMessage({ data: dataBuffer });
      console.log(`Message ${messageId} published.`);
      return messageId;
    } catch (error) {
      console.error(`Received error while publishing: ${error.message}`);
      // process.exitCode = 1;
    }
  }

  static async createTopic(topicNameOrId) {
    // Creates a new topic
    const [ topic ] = await PubSubClient.createTopic(topicNameOrId);
    console.log(`Topic ${topicNameOrId} created.`);
    return topic;
  }
};