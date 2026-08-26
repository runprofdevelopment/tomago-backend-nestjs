// const config = require('../../../../config')();
const admin = require('firebase-admin');
const lodash = require('lodash');
const assert = require('assert');

/**
 * Handles FCM sending
 */
module.exports = class FCMService {
  /**
   * Subscribes a device to an FCM topic.
   * Or Subscribe the devices corresponding to the registration tokens to the topic.
   * 
   * @param {String|String[]} registrationTokens A token or array of registration tokens for the devices to subscribe to the topic.
   * @param {String} topic The topic to which to subscribe.
   * @returns {Promise<admin.messaging.MessagingTopicManagementResponse>} 
   * A promise fulfilled with the server's response after the device has been subscribed to the topic.
   */
  static async subscribeToTopic(registrationTokens, topic) {
    assert(topic, 'topic is required');
    assert(registrationTokens && registrationTokens.length, 'registrationTokens is required');
    registrationTokens.forEach((token, index) => {
      assert(lodash.isString(token), `'registrationTokens[${index}]' got invalid value ${token}; Expected type String; String cannot represent a non string value: ${token}`)
    });

    // Subscribe the devices corresponding to the registration tokens to the topic.
    return admin.messaging().subscribeToTopic(registrationTokens, topic)
    .then((response) => {
      // See the MessagingTopicManagementResponse reference documentation for the contents of response.
      console.log('Successfully subscribed to topic:', response);
      return response
    })
    .catch((error) => {
      console.log('Error subscribing to topic:', error);
    });
  }

  /**
   * Unsubscribes a device from an FCM topic.
   * Or Unsubscribe the devices corresponding to the registration tokens from the topic.
   * 
   * @param {String|String[]} registrationTokens A device registration token or an array of device registration tokens to unsubscribe from the topic.
   * @param {String} topic The topic from which to unsubscribe.
   * @returns {Promise<admin.messaging.MessagingTopicManagementResponse>} 
   * A promise fulfilled with the server's response after the device has been unsubscribed from the topic.
   */
  static async unsubscribeFromTopic(registrationTokens, topic) {
    assert(topic, 'topic is required');
    assert(registrationTokens && registrationTokens.length, 'registrationTokens is required');
    registrationTokens.forEach((token, index) => {
      assert(lodash.isString(token), `'registrationTokens[${index}]' got invalid value ${token}; Expected type String; String cannot represent a non string value: ${token}`)
    });

    // Unsubscribe the devices corresponding to the registration tokens from the topic.
    return admin.messaging().unsubscribeFromTopic(registrationTokens, topic)
    .then((response) => {
      // See the MessagingTopicManagementResponse reference documentation for the contents of response.
      console.log('Successfully unsubscribed from topic:', response);
      return response
    })
    .catch((error) => {
      console.log('Error unsubscribing from topic:', error);
    });
  }

  /**
   * Sends the given message via FCM.
   * 
   * @param {admin.messaging.Message} message The message payload.
   * @param {Boolean} dryRun Whether to send the message in the dry-run (validation only) mode.
   * @return {Promise<string>} 
   * A promise fulfilled with a unique message ID string after the message has been successfully handed off to the FCM service for delivery.
   */
  static async send(message, dryRun = false) {
    return admin.messaging().send(message, dryRun)
    .then((response) => {
      // Response is a message ID string.
      console.log('Successfully sent message:', response);
      return response
    })
    .catch((error) => {
      console.log('Error sending message:', error);
      throw error
    });
  }

  /**
   * Sends all the messages in the given array via Firebase Cloud Messaging. 
   * Employs batching to send the entire list as a single RPC call. 
   * Compared to the send() method, this method is a significantly more efficient way to send multiple messages.
   * 
   * The responses list obtained from the return value corresponds to the order of tokens in the MulticastMessage. 
   * An error from this method indicates a total failure -- i.e. none of the messages in the list could be sent. 
   * Partial failures are indicated by a BatchResponse return value.
   * 
   * @param {admin.messaging.Message[]} messages A non-empty array containing up to 500 messages.
   * @param {Boolean} dryRun Whether to send the messages in the dry-run (validation only) mode.
   * @returns {Promise<admin.messaging.BatchResponse>} A Promise fulfilled with an object representing the result of the send operation.
   */
  static async sendAll(messages, dryRun = false) {
    return admin.messaging().sendAll(messages, dryRun)
    .then((response) => {
      const failedTokens = [];
      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(messages[idx].token);
            resp['token'] = messages[idx].token 
          }
        });
        console.log('List of tokens that caused failures: ');
        console.log(failedTokens.join('\n\n'));
      }
      const res = {
        responses: response.responses,
        failedTokens: failedTokens,
        successCount: response.successCount,
        failureCount: response.failureCount
      }
      return res
    })
    .catch((error) => {
      console.log('[sendAll] Error sending message:', error);
      throw error
    });
  }

  /**
   * Sends all the messages in the given array via Firebase Cloud Messaging. 
   * Employs batching to send the entire list as a single RPC call. 
   * Compared to the send() method, this method is a significantly more efficient way to send multiple messages.
   * 
   * This method uses the sendAll() API under the hood to send unlimited messages to all the target recipients.
   * The responses list obtained from the return value corresponds to the order of tokens in the MulticastMessage. 
   * An error from this method indicates a total failure -- i.e. none of the messages in the list could be sent. 
   * Partial failures are indicated by a BatchResponse return value.
   *
   * @param {admin.messaging.Message[]} messages A non-empty array containing unlimited messages.
   * @param {Boolean} dryRun Whether to send the messages in the dry-run (validation only) mode.
   * @returns {Promise<admin.messaging.BatchResponse|admin.messaging.BatchResponse[]>} A Promise fulfilled with an object representing the result of the send operation.
   */
  static async sendAllUnlimited(messages, dryRun = false) {
    const totalCount = messages.length
    const maximum = 500
    const chains = []
    
    if (totalCount > maximum) {
      const numberOfChains = Math.ceil(totalCount / maximum)
      for (let index = 0; index < numberOfChains; index++) {
        const start = maximum * index 
        const end = maximum * (index +1)
        const packet = messages.slice(start, end)
        chains.push(packet)
      }

      return Promise.all(
        chains.map((packet) => this.sendAll(packet)),
      );
    } else {
      return this.sendAll(messages)
    }
  }

  /**
   * Allow you to multicast a message to a list of device registration tokens.  
   * You can specify up to 500 device registration tokens per invocation.
   * 
   * This method uses the sendAll() API under the hood to send the given message to all the target recipients. 
   * The responses list obtained from the return value corresponds to the order of tokens in the MulticastMessage. 
   * An error from this method indicates a total failure -- i.e. the message was not sent to any of the tokens in the list. 
   * Partial failures are indicated by a BatchResponse return value.
   * 
   * @param {String[]} registrationTokens An array of device registration tokens containing up to 500 tokens to which the message should be sent.
   * @param {admin.messaging.MessagingPayload} payload The message payload.
   * @returns {Promise<admin.messaging.BatchResponse>} A Promise fulfilled with an object representing the result of the send operation.
   */
  static async sendMulticast(registrationTokens, payload) {
    const message = {
      ...payload,
      tokens: registrationTokens,
    }

    return admin.messaging().sendMulticast(message)
    .then((response) => {
      const failedTokens = [];
      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(registrationTokens[idx]);
            resp['token'] = registrationTokens[idx] 
          }
        });
        console.log('List of tokens that caused failures: ' + failedTokens);
      }
      const res = {
        responses: response.responses,
        failedTokens: failedTokens,
        "successCount": response.successCount,
        "failureCount": response.failureCount
      }
      return res
    })
    .catch((error) => {
      console.log('[sendMulticast] Error sending message:', error);
      throw error
    });
  }
  
  /**
   * Sends an FCM message to a single device corresponding to the provided registration token.
   * 
   * See Send to individual devices for code samples and detailed documentation. 
   * Takes either a registrationToken to send to a 
   * single device or a registrationTokens parameter containing an 
   * array of tokens to send to multiple devices.
   * 
   * @param {String|String[]} registrationToken A device registration token or an array of device registration tokens to which the message should be sent.
   * @param {admin.messaging.MessagingPayload} payload The message payload.
   * @param {admin.messaging.MessagingOptions} options Optional options to alter the message.
   * 
   * @return {Promise<admin.messaging.MessagingDevicesResponse>} A promise fulfilled with the server's response after the message has been sent.
   */
  static async sendToDevice(registrationToken, payload, options = {}) {
    return admin.messaging().sendToDevice(registrationToken, payload, options)
    .then((response) => {
      // Response is a message ID string.
      console.log('Successfully sent message:', response);
      return response
    })
    .catch((error) => {
      console.log('[sendToDevice] Error sending message:', error);
      throw error
    });
  }

  /**
   * Sends an FCM message to a device group corresponding to the provided notification key.
   * See Send to a device group for code samples and detailed documentation.
   * 
   * @param {String} notificationKey The notification key for the device group to which to send the message.
   * The maximum number of members allowed for a notification key is 20.
   * @param {admin.messaging.MessagingPayload} payload The message payload.
   * @param {admin.messaging.MessagingOptions} options Optional options to alter the message.
   * @returns {Promise<admin.messaging.MessagingDeviceGroupResponse>} A promise fulfilled with the server's response after the message has been sent.
   */
  static async sendToDeviceGroup(notificationKey, payload, options = {}) {
    return admin.messaging().sendToDeviceGroup(notificationKey, payload, options)
    .then((response) => {
      // Response is a message ID string.
      console.log('Successfully sent message:', response);
      return response
    })
    .catch((error) => {
      console.log('[sendToDeviceGroup] Error sending message:', error);
      throw error
    });
  }

  /**
   * Sends an FCM message to a topic.
   * See Send to a topic for code samples and detailed documentation.
   * 
   * @param {String} topic The topic to which to send the message.
   * @param {admin.messaging.MessagingPayload} payload The message payload.
   * @param {admin.messaging.MessagingOptions} options Optional options to alter the message.
   * @returns {Promise<admin.messaging.MessagingTopicResponse>}
   * A promise fulfilled with the server's response after the message has been sent.
   */
  static async sendToTopic(topic, payload, options = {}) {
    return admin.messaging().sendToTopic(topic, payload, options).then((response) => {
      // Response is a message ID string.
      console.log('Successfully sent message:', response);
      return response
    })
    .catch((error) => {
      console.log('Error sending message:', error);
      throw error
    });
  }

  static async sendToCondition() {
    throw new Error('Not implemented');
  }
};