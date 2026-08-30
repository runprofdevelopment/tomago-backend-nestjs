const functions = require('firebase-functions');
const admin = require('firebase-admin');
const lodash = require('lodash');
const assert = require('assert');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const PushNotificationSender = require('../../infrastructure/notificationCenter/fcmService');
const NotificationCreator = require('./notificationCreator');
const NotificationUtils = require('./notificationUtils');

module.exports = class NotificationSender {
  constructor(context) {
    this.language = (context && context.language) || null;
    this.currentUser = context && context.currentUser || null;
    this.NotificationCreator = new NotificationCreator(context);
  }

  async sendNotificationToAllCustomers(notification) {
    try {
      const recipients = FirebaseHelper.filterSoftDeletedRecords(
        FirebaseHelper.mapCollection(
          await admin.firestore().collection('user').where('accountType', '==', 'customer').get()
        )
      );
      
      const recipients_ids = recipients.map(user => user.id);
      await Promise.all(
        recipients_ids.map(id => this.NotificationCreator.execute(id, notification))
      );
  
      const topics = ['all_customers_en', 'all_customers_ar'];
      const messages = NotificationUtils._prepareMessageTopics(notification, topics, 1);
      await Promise.all(
        messages.map((message) => PushNotificationSender.send(message)),
      );
      return { status: true, result: `Successfully sent message`, error: null };
    } catch (error) {
      return { status: false, result: null, error: { code: error.code, message: error.message } };
    }
  }

  /**
   * @param {String[]} recipients_ids 
   * @param {Object} notification 
   * @param {Object} notification.title
   * @param {String} notification.title.en
   * @param {String} notification.title.ar
   * @param {Object} notification.body
   * @param {String} notification.body.en
   * @param {String} notification.body.ar
   * @param {Url<String>} notification.imageUrl
   * @param {JSON} notification.payload 
   */
  async sendNotificationToRecipients(recipients_ids, notification) {
    try {
      if (!recipients_ids || !recipients_ids.length) return;

      // await Promise.all([
      //   this.sendNotification(notification, recipients, recipients_ids),
      //   ...recipients_ids.map(id => this.NotificationCreator.execute(id, notification)),
      // ]);

      // There are no recipients related to these ids
      // There are no recipients associated with these IDs
      // There are no relevant recipients for these IDs
      const recipients = await FirebaseHelper.findDocumentsByIds('user', recipients_ids);
      if (!recipients.length) throw new Error(`There are no recipients associated with these IDs [ ${recipients_ids} ]`);
  
      await Promise.all(
        recipients_ids.map(id => this.NotificationCreator.execute(id, notification))
      );
      await this.sendNotification(notification, recipients, recipients_ids);
      // return { status: true, result: `Successfully sent message`, error: null };
      return `Successfully sent message`;
    } catch (error) {
      throw error;
      // throw new Error(`Failed to send notification to recipient ${recipients_ids} ]`);
      // return { status: false, result: null, error: { code: error.code, message: error.message } };
    }
  }

  async sendNotification(notification, recipients, recipients_ids) {
    try {
      const usersIds = recipients_ids || recipients.map(user => user.id);
      const tokens = await NotificationUtils.findRegistrationTokens(recipients);
      if (!tokens) throw new Error(`There are no registrationTokens`);

      const messages = await NotificationUtils._prepareMessageTokens(notification, tokens, usersIds);
      await admin.messaging().sendEach(messages);
    } catch (error) {
      console.error('Sorry, the notification was not sent because of an error');
      console.error('Error is :', error);
      throw error;
    }
  }

  async testNotification(userId, sendTo, options) {
    const recipient = await FirebaseHelper.findDocument('user', userId)

    const notification = {
      title: {
        en: `Test Notification`, 
        ar: `تجربة الاشعارات`
      },
      body: {
        en: ``, 
        ar: ``
      },
      imageUrl: '',
      payload: { type: 'TEST_NOTIFICATION', value: 'Testing' }
    }
    switch (sendTo) {
      case 'topic':
        await this.createAndSendToTopic(tripId, clientIds, notification, options)
        break;
      case 'device':
        await this.createAndSendToRecipient(recipient, notification, options)
        break;
    }
  }

  async subscribeUsersToTopic(subscribers, topic) {
    try {
      const registrationTokens = await NotificationUtils.findRegistrationTokens(subscribers)
      const languages = Object.keys(registrationTokens);

      await Promise.all(
        languages.map(lang => PushNotificationSender.subscribeToTopic(
          registrationTokens[lang], 
          NotificationUtils.formateTopicName(topic, lang)
        )),
      )
    } catch (error) {
      console.log(`An error occurred while subscribing to the topic "${topic}".`);
    }
  }

  async unsubscribeUsersFromTopic(subscribers, topic) {
    try {
      const registrationTokens = await NotificationUtils.findRegistrationTokens(subscribers)
      const languages = Object.keys(registrationTokens)
      await Promise.all(
        languages.map(lang => PushNotificationSender.unsubscribeFromTopic(
          registrationTokens[lang], 
          NotificationUtils.formateTopicName(topic, lang)
        )),
      )
    } catch (error) {
      console.log(`An error occurred while unsubscribing from the topic "${topic}".`);
    }
  }

//#region [ FCM Handlers Functions ]
  _validateNotificationData(data) {
    try {
      const types = ['topic', 'device', 'multi-devices']
      assert(!lodash.isEmpty(data.sendType), `The field 'sendType' is required`)
      assert(types.includes(data.sendType), `Variable 'sendType' got invalid value ${data.sendType}; Expected value is one of this ${types}`);

      if (data.sendType == 'topic') {
        assert(!lodash.isEmpty(data.topicName), `The field 'topicName' is required`)
        assert(lodash.isString(data.topicName), `Variable 'topicName' got invalid value ${data.topicName}; Expected type String; String cannot represent a non string value: ${data.topicName}`);
      } else if (data.sendType == 'device') {
        assert(!lodash.isEmpty(data.user), `The field 'user' is required`)
        assert(lodash.isObject(data.user), `Variable 'user' got invalid value ${data.user}; Expected type Object; Object cannot represent a non Object value: ${data.user}`);
      } else if (data.sendType == 'multi-devices') {
        assert(!lodash.isEmpty(data.users), `The field 'users' is required`)
        assert(lodash.isArray(data.users), `Variable 'users' got invalid value ${data.users}; Expected type Array; Array cannot represent a non array value: ${data.users}`);
      }
      
      if (lodash.isEmpty(data.notification)) {
        throw new Error(`The field 'notification' is required`)
      } else {
        assert(!lodash.isEmpty(data.notification.title), `The field "notification.title" is required`)
        assert(lodash.isObject(data.notification.title), `Variable "notification.title" got invalid value ${data.notification.title}; Expected type Object; Object cannot represent a non Object value: ${data.notification.title}`);
        assert(!lodash.isEmpty(data.notification.body), `The field "notification.body" is required`)
        assert(lodash.isObject(data.notification.body), `Variable "notification.body" got invalid value ${data.notification.body}; Expected type Object; Object cannot represent a non Object value: ${data.notification.body}`);
      }

      if (!lodash.isEmpty(data.payload)) {
        assert(lodash.isObject(data.payload), `Variable 'payload' got invalid value ${data.payload}; Expected type JSON; JSON cannot represent a non JSON value: ${data.payload}`);
      }
    } catch (error) {
      throw { code: 'INVALID_ARGUMENT', message: error.message}      
    }
  }

  /**
   * The main function of sending FCM notifications
   * @param {Object} data 
   * @param {'topic'|'device'|'multi-devices'} data.sendType 
   * @param {Object} data.notification 
   * @param {Object} data.notification.title The title of the notification.
   * @param {String} data.notification.title.en 
   * @param {String} data.notification.title.ar 
   * @param {Object} data.notification.body The notification body
   * @param {String} data.notification.body.en 
   * @param {String} data.notification.body.ar 
   * @param {String} data.notification.imageUrl URL of an image to be displayed in the notification.
   * @param {JSON} data.payload A collection of payload fields to be included in the message. 
   * All values must be strings. When provided, overrides any data fields set on the top-level Message.
   * @param {String} data.topicName
   * @param {Object} data.user
   * @param {Map<String, Map<String, 'en'|'ar'|String>>} data.user.deviceTokens
   * @param {Object[]} data.users
   * @param {Map<String, Map<String, 'en'|'ar'|String>>} data.users.deviceTokens
   */
  async pushNotification({ sendType, notification, payload, topicName, user, users }) {
    try {
      this._validateNotificationData({ sendType, notification, payload, topicName, user, users })
  
      if (sendType == 'topic') {
        const messages = NotificationUtils.prepareMessage({
          sendType: 'topic', 
          topics: [
            NotificationUtils.formateTopicName(topicName, 'en'),
            NotificationUtils.formateTopicName(topicName, 'ar'),
          ], 
          notification: notification, 
          payload: payload,
        })
        return await Promise.all(
          messages.map((message) => PushNotificationSender.send(message)),
        );
      }
  
      if (sendType == 'device') {
        const registrationTokens = await NotificationUtils.findRegistrationTokens(user)
        const messages = NotificationUtils.prepareMessage({
          sendType: 'multi-devices', 
          registrationTokens: registrationTokens, 
          notification: notification, 
          payload: payload,
        }) 
        return await PushNotificationSender.sendAll(messages);
      }
  
      if (sendType == 'multi-devices') {
        const registrationTokens = await NotificationUtils.findRegistrationTokens(users)
        const messages = NotificationUtils.prepareMessage({
          sendType: 'multi-devices', 
          registrationTokens: registrationTokens, 
          notification: notification, 
          payload: payload,
        }) 
        return await PushNotificationSender.sendAllUnlimited(messages)
      }
    } catch (error) {
      console.log('Sorry, the notification was not sent because of an error');
      console.log('Error is :', error);
    }
  }
//#endregion

  async createAndSendToRecipient(recipient, data, options) {
    if (!recipient) {
      return
    }
    const userType = recipient.accountType
    const recipientID = userType == 'company' ? recipient.companyId : recipient.id
    const recipientType = userType == 'company' ? 'company' : 'user'

    // Create a notification for the user or company subCollection
    await this.create({
      title: data.title,
      body: data.body,
      imageUrl: data.imageUrl,
      payload: data.payload,
      type: 'general',
      sendTo: {
        id: recipientID,
        type: recipientType,
      }
    }, options);

    if (recipientType == 'user') {
      this.pushNotification({ 
        sendType: 'device',
        user: recipient,
        notification: {
          title: data.title,
          body: data.body,
          imageUrl: data.imageUrl,
        },
        payload: data.payload,
      })
    }
  }

  async createAndSendToTopic(topicName, recipientIds, data, options) {
    if (recipientIds.length) {
      await Promise.all( // Create a notification for the users as a subCollection
        recipientIds.map(id => this.create({
          title: data.title,
          body: data.body,
          imageUrl: data.imageUrl,
          payload: data.payload,
          type: 'general',
          sendTo: {
            id: id,
            type: 'user',
          }
        }, options))
      )
    }

    if (topicName) {
      this.pushNotification({ 
        sendType: 'topic',
        topicName: topicName,
        notification: {
          title: data.title,
          body: data.body,
          imageUrl: data.imageUrl,
        },
        payload: data.payload,
      })
    }
  }
}