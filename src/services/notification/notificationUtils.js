const lodash = require('lodash');
// const AppProfile = require('../../database/data/app-profile');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const NotificationViewer = require('./notificationViewer');

module.exports = class NotificationUtils {
  static get MESSAGE() {
    return {
      // to: "YOUR_FCM_TOKEN_WILL_BE_HERE",
      notification: {
        body: "",
        title: "",
        // badge: "1"
      },
      android: {
        notification: {
          body: "",
          title: "",
          // badge: "1"
        },
      },
      apns: {
        payload: {
          aps: {
            // sound: 'RahalNotification.mp3',
            badge: 1
          }
        }
      },
      data: {},
      // priority: "high",
      // content_available: true,
    }
  }

  static prepareMessage({ sendType, topics, registrationTokens, notification, payload, languages, badgeCount }) {

    if (sendType == 'topic' && topics.length) {
      return this._prepareMessageTopics();
    }

    if ((sendType == 'device' || sendType == 'multi-devices') && lodash.isObject(registrationTokens)) {
      
    }
  }

  static _prepareMessageTopics(notification, topics, badgeCount) {
    const message = this.MESSAGE;
    notification && notification.payload 
      ? message.data = notification.payload 
      : delete message.data;

    const messages = [];
    for (const topic of topics) {
      const lang = this.findTopicLanguage(topic);
      const NOTIFICATION = {
        title: notification.title[lang],
        body: notification.body[lang],
      }
      message.notification = NOTIFICATION;
      message.android.notification = NOTIFICATION;
      message['topic'] = topic;

      if(badgeCount) {
        // message.notification.badge = badgeCount+"";
        // message.android.notification.badge = badgeCount+"";
        message.apns.payload.aps.badge = parseInt(badgeCount);
      }
      messages.push(message);
    }
    return messages;
  }

  static async _prepareMessageTokens(notification, registrationTokens, users_ids) {
    const message = this.MESSAGE;
    notification && notification.payload 
      ? message.data = notification.payload 
      : delete message.data;

    const messages = [];
    const languages = registrationTokens ? Object.keys(registrationTokens) : [];
    for (const lang of languages) {
      const tokens = registrationTokens[lang];
  
      let index = 0;
      for (const token of tokens) {
        const NOTIFICATION = {
          title: notification.title[lang],
          body: notification.body[lang],
        }
        message.notification = NOTIFICATION;
        message.android.notification = NOTIFICATION;
        message['token'] = token;
  
        const userId = users_ids && users_ids.length > index ? users_ids[index] : null;
        const badgeCount = await NotificationViewer.findUnreadNotificationsCount(userId);
        if(badgeCount) {
          // message.notification.badge = badgeCount+"";
          // message.android.notification.badge = badgeCount+"";
          message.apns.payload.aps.badge = parseInt(badgeCount);
        }
        messages.push(message);
        index++;
      }
    }

    return messages
  }

  // static prepareMessage({ sendType, topics, registrationTokens, notification, payload, languages, badgeCount }) {
  //   const message = {
  //     notification: {},
  //     android: {
  //       notification: {},
  //     },
  //     apns: {
  //       payload: {
  //         aps: { sound: 'notification.mp3' },
  //       },
  //     },
  //     data: payload,
  //   }

  //   if(badgeCount){
  //     message.notification.badge = badgeCount+"";
  //   }

  //   if (sendType == 'topic' && topics.length) {
  //     const messages = []
  //     topics.forEach(topic => {
  //       const lang = this.findTopicLanguage(topic)
  //       const NOTIFICATION = {
  //         title: notification.title[lang],
  //         body: notification.body[lang]
  //       }
  //       message.notification = NOTIFICATION
  //       message.android.notification = NOTIFICATION
  //       message['topic'] = topic
  //       messages.push(message)
  //     });
  //     return messages
  //   }

  //   if ((sendType == 'device' || sendType == 'multi-devices') && lodash.isObject(registrationTokens)) {
  //     const messages = []
  //     Object.keys(registrationTokens).forEach(lang => {
  //       const tokens = registrationTokens[lang]
  //       tokens.forEach(token => {
  //         const NOTIFICATION = {
  //           title: notification.title[lang],
  //           body: notification.body[lang]
  //         }
  //         message.notification = NOTIFICATION
  //         message.android.notification = NOTIFICATION
  //         message['token'] = token
  //         messages.push(message)
  //       });
  //     });
  //     return messages
  //   }
  // }

  static formateTopicName(topic, language) {
    return `${topic}_${language}`
  }
  static findTopicLanguage(topic) {
    const langQuery = topic.substring(topic.lastIndexOf("_") + 1);
    console.log('Language =', langQuery);
    return langQuery.includes("ar") ? 'ar' : 'en' 
  }

  /**
   * @param {*} users 
   * @returns {Promise<{ 
   *    en: tokens<String[]>, 
   *    ar: tokens<String[]>
   * }>}
   */
  static async findRegistrationTokens(users) {
    let allTokens = {};
    let results;

    if (Array.isArray(users)) {
      results = await Promise.all(
        users.map((user) => this.findRegistrationTokensForUser(user)),
      );
    } else {
      results = await this.findRegistrationTokensForUser(users);
    }
    
    const deviceTokens = results.flat(Infinity);
    deviceTokens.forEach(device => {
      const lang = device.lang;
      const token = device.token;
      if (!lodash.isArray(allTokens[lang])) {
        allTokens[lang] = [];
      }
      allTokens[lang].push(token);
    });

    console.log('allTokens =', allTokens);
    return !lodash.isEmpty(allTokens) ? allTokens : null;
    // return allTokens
  }

  /**
   * Find a list of all the user's device tokens
   * @param {Object} user 
   * @param {Map<String, Map<String, 'en'|'ar'|String>>} user.deviceTokens 
   * @return {Promise<{ token: String, lang: 'en'|'ar' }[]>} tokens
   */
  static async findRegistrationTokensForUser(user) {
    const DEVICES = user.deviceTokens || {};
    const tokens = []

    Object.keys(DEVICES).forEach(deviceId => {
      const lang = DEVICES[deviceId];
      tokens.push({
        token: deviceId,
        lang: lang,
      })
      // Object.keys(device).forEach(key => {
      //   tokens.push({
      //     token: deviceId,
      //     lang: device[key],
      //   })
      // });
    });

    return tokens
  }

  /**
   * Populates the records with all its relations.
   * @param {JSON[]} records
   * @param {['payee', 'payer', 'order']} [withRelation]
   */
  static async populateAll(records, withRelation) {
    return await Promise.all(
      records.map((record) => this.populate(record, withRelation))
    );
  }

  /**
   * Populates the record with all its relations.
   * @param {JSON} record
   * @param {['payee'|'payer'|'order']} [withRelation]
   */
  static async populate(record) {
    if (!record) {
      return record;
    }

    record['sender'] = await FirebaseHelper.findDocument('user', record.createdBy);
    return record;
  }
};
