// let bucket = admin.storage().bucket();
const admin = require('firebase-admin');
const functions = require('firebase-functions');
const lodash = require('lodash');
const moment = require('moment');
const assert = require('assert');
const loadingSpinner = require('loading-spinner');
const ErrorHandler = require('../errors/errorHandler');

/** Auxiliary functions */
module.exports = class HelperFunctions {
  
  static isDate(date) {
    const DATE = new Date(date);
    return (DATE !== "Invalid Date") && !isNaN(DATE);
  }
  
  static getTypeOfVariable(letiable) {
    if (letiable === null) return 'null';
    else if (letiable === undefined) return 'undefined';
    else if (Array.isArray(letiable)) return 'array';
    else if (typeof letiable == 'boolean') return 'boolean';
    else if (typeof letiable == 'number') return 'number';
    else if (typeof letiable == 'string') return 'string';
    else if (typeof letiable == 'object') return 'object';
    else return 'other';
  }

  /**
   * Generate Unique Random String
   * @param {Number} length 
   * @returns Unique String
   */
  static generateUniqueRandomString(length) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  static generateUniqueRandomDigits(numOfDigits) {
    const timestamp = Date.now().toString(); // Get the current timestamp
    const randomDigits = Math.floor(Math.random() * 100000000); // Generate a random 8-digit number
    const length = numOfDigits > 0 ? numOfDigits : 0;

    const uniqueDigits = (timestamp + randomDigits).slice(-length); // Combine and take the last 8 digits
    return uniqueDigits;
  }

  static getLocalTimeZoneHours() {
    const ZONE = new Date().toLocaleTimeString('en-us', { timeZoneName: 'short' }).split(' ')[2]
    const TIME_ZONE_HOURS = parseInt(ZONE.replace('GMT', ''))
    return TIME_ZONE_HOURS ? TIME_ZONE_HOURS : 0
  }

  static getCientSideTimezone() {
    // console.log('Date Now =', new Date());
    return -1 * new Date().getTimezoneOffset() / 60
  }
  
  static getDateNowDetails() {
    const dateNow = new Date();
    const day = dateNow.getDate();
    const month = dateNow.getMonth() + 1; // months from 1-12
    const year = dateNow.getFullYear(); 
    
    // The day of the week (0 to 6).
    const weekday = [
      "Sunday",    // = 0
      "Monday",    // = 1
      "Tuesday",   // = 2
      "Wednesday", // = 3
      "Thursday",  // = 4
      "Friday",    // = 5
      "Saturday"   // = 6
    ];
    const dayOfWeek = dateNow.getDay();
    const weekOfMonth = Math.ceil((day + 6 - dayOfWeek)/7);
  
    console.log('Date Now Details =', {
      day: day,
      weekday: weekday[dayOfWeek],
      weekOfMonth: weekOfMonth,
      month: month,
      year: year,
    })
  
    return {
      day,
      weekOfMonth,
      month,
      year,
    }
  } 

  static getDateDetails(date) {
    const prepareDate = (dateVal) => {
      if (dateVal && dateVal instanceof admin.firestore.Timestamp) {
        return new Date(dateVal.toDate());
      }
      return new Date(dateVal)
    }

    const DATE = prepareDate(date);
    const day = DATE.getDate();
    const month = DATE.getMonth() + 1; // months from 1-12
    const year = DATE.getFullYear(); 
    
    // The day of the week (0 to 6).
    const weekday = [
      "Sunday",    // = 0
      "Monday",    // = 1
      "Tuesday",   // = 2
      "Wednesday", // = 3
      "Thursday",  // = 4
      "Friday",    // = 5
      "Saturday"   // = 6
    ];
    const dayOfWeek = DATE.getDay();
    const weekOfMonth = Math.ceil((day + 6 - dayOfWeek)/7);
  
    console.log('Date Now Details =', {
      day: day,
      weekday: weekday[dayOfWeek],
      weekOfMonth: weekOfMonth,
      month: month,
      year: year,
    })
  
    return {
      day,
      weekOfMonth,
      month,
      year,
    }
  } 

  static stringify(value) {
    switch (typeof value) {
      case 'string': case 'object': return JSON.stringify(value);
      default: return String(value);
    }
  }
  
  /**
   * 
   * @param {String} value 
   * @param {'en'|'ar|String} language 
   * @returns {String|null}
   */
  static stringNormalization(value, language) {
    const str = language && lodash.isPlainObject(value) ? value[language] : value
    return str
      ? str.toLowerCase().replace(/[-._!"`'#%&,:;<>=@{}~\s*\$\(\)\*\+\/\\\?\[\]\^\|]+/g, '').replace(/[أإآآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
      : null
  }

  /**
   * Round to a Certain Number of Decimal  
   * @param {Float} number 
   * @param {Int} scale 
   * @returns {Number}
   */
  static roundNumber(number, scale) {
    const SCALE = parseInt('1'.padEnd(scale + 1, '0'))
    // const NUMBER = parseFloat(number) + Number.EPSILON
    // return Math.round(NUMBER * SCALE) / SCALE
    return Math.round((number + Number.EPSILON) * SCALE) / SCALE
  }

  /**
   * Convert RGB color to hex color
   * @param {Number} red 
   * @param {Number} green 
   * @param {Number} blue 
   * @param {Number} alpha 
   * @returns 
   */
  static rgbToHex(red, green, blue, alpha) {
    const isPercent = (red + (alpha || '')).toString().includes('%');

    if (typeof red === 'string') {
      [red, green, blue, alpha] = red.match(/(0?\.?\d{1,3})%?\b/g).map(component => Number(component));
    } else if (alpha !== undefined) {
      alpha = Number.parseFloat(alpha);
    }

    if (
      typeof red !== 'number' || 
      typeof green !== 'number' || 
      typeof blue !== 'number' ||
      red > 255 || green > 255 || blue > 255 
    ) {
      throw new TypeError('Expected three numbers below 256');
    }

    if (typeof alpha === 'number') {
      if (!isPercent && alpha >= 0 && alpha <= 1) {
        alpha = Math.round(255 * alpha);
      } else if (isPercent && alpha >= 0 && alpha <= 100) {
        alpha = Math.round(255 * alpha / 100);
      } else {
        throw new TypeError(`Expected alpha value (${alpha}) as a fraction or percentage`);
      }

      alpha = (alpha | 1 << 8).toString(16).slice(1); // eslint-disable-line no-mixed-operators
    } else {
      alpha = '';
    }

    return '#' + ((blue | green << 8 | red << 16) | 1 << 24).toString(16).slice(1) + alpha;
    // return {
    //   color: '#' + ((blue | green << 8 | red << 16) | 1 << 24).toString(16).slice(1),
    //   opacity: alpha 
    // } 
  }

  static hexToRGB(hex, alpha) {
    let r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);

    if (alpha) {
      return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
    } else {
      return "rgb(" + r + ", " + g + ", " + b + ")";
    }
  }

  /**
   * Calculate Time Difference between two dates
   * @param {DateTime} dateFuture 
   * @param {DateTime} dateNow Current Date
   * @returns - { days, hours, minutes }
   */
  static timeDiffCalc(dateFuture, dateNow) {
    let diffInMilliSeconds = Math.abs(dateFuture - dateNow) / 1000;

    // Calculate The Number of Days Between Two Dates
    const days = Math.floor(diffInMilliSeconds / 86400);
    diffInMilliSeconds -= days * 86400;
    console.log('calculated days', days);

    // Calculate Hours Difference between Two Dates
    const hours = Math.floor(diffInMilliSeconds / 3600) % 24;
    diffInMilliSeconds -= hours * 3600;
    console.log('calculated hours', hours);

    // Calculate Minutes Difference between Two Date
    const minutes = Math.floor(diffInMilliSeconds / 60) % 60;
    diffInMilliSeconds -= minutes * 60;
    console.log('minutes', minutes);

    let difference = '';
    if (days > 0) {
      difference += (days === 1) ? `${days} day, ` : `${days} days, `;
    }

    difference += (hours === 0 || hours === 1) ? `${hours} hour, ` : `${hours} hours, `;
    difference += (minutes === 0 || hours === 1) ? `${minutes} minutes` : `${minutes} minutes`;
    console.log('difference =', difference);

    return {
      days: days,
      hours: hours,
      minutes: minutes,
    };
  }

  static isValidURL(url) {
    const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator

    return !!pattern.test(url)
  }

  /**
   * Validate the current user
   * @param {JSON} currentUser 
   * @param {Enumerator} accountType Enum with [ client - vendor - constructor - designer - !client - !vendor - !designer - !constructor ] 
   */
  static isValidCurrentUser(currentUser, accountType) {
    try {
      const ACCOUNT_TYPES = [ 'client', 'vendor', 'constructor', 'designer', 'admin' ]
      assert(currentUser, `The authorized user is missing`)
      assert(lodash.isObject(currentUser), `Variable "currentUser" got invalid value ${currentUser}; Expected type JSON; JSON cannot represent a non object value: ${currentUser}`);
      assert(lodash.isString(currentUser.id), `Variable "id" in the "user" collection got invalid value ${currentUser.id}; Expected type String; String cannot represent a non string value: ${currentUser.id}`);
      assert(!lodash.isEmpty(currentUser.id), `"id" field  is required in the "user" collection`);
      assert(lodash.isString(currentUser.accountType), `Variable "accountType" in the "user" collection got invalid value "${currentUser.accountType}"; Expected type String; String cannot represent a non string value: [${currentUser.accountType}]`);
  
      if (accountType && accountType.startsWith('!')) {
        const type = accountType.substring(1)
        const index = ACCOUNT_TYPES.findIndex(accountType => accountType === type)
        ACCOUNT_TYPES.splice(index, 1)
      }
  
      accountType && !accountType.startsWith('!')
        ? assert(currentUser.accountType === accountType, `Variable "user.accountType" got invalid value "${currentUser.accountType}"; Expected value is ${accountType}`)
        : assert(ACCOUNT_TYPES.includes(currentUser.accountType), `Variable "user.accountType" got invalid value "${currentUser.accountType}"; Expected value is one of this [${ACCOUNT_TYPES}]`);
  
      // if (currentUser.accountType == 'company' && lodash.isEmpty(currentUser.companyId)) {
      //   assert(false, `"companyId" field  is required in the "user" collection`);
      // }
    } catch (error) {
      throw new ErrorHandler({ errorCode: 'AUTHORIZATION_ERROR', message: error.message })
    }
  }

  static validateParameter(params = [{
    name: '',
    value: null, 
    dataType: '', 
    required: false
  }]) {
    const isRequiredErrors = []
    const errors = []

    params.forEach(param => {
      const FIELD_NAME = param.name
      const FIELD_VALUE = param.value
      const DATA_TYPE = param.dataType.toLowerCase()
      if (param.required) {
        // if (lodash.isEmpty(FIELD_VALUE)) errors.push(`This input "${FIELD_NAME}" is required`)
        if (lodash.isEmpty(FIELD_VALUE) && !lodash.isNumber(FIELD_VALUE)) isRequiredErrors.push(`'${FIELD_NAME}'`)
      }

      if (FIELD_VALUE) {
        switch (DATA_TYPE) {
          case 'string':
            if (!lodash.isString(FIELD_VALUE)) errors.push(`Variable '${FIELD_NAME}' got invalid value ${FIELD_VALUE}; Expected type String; String cannot represent a non string value: ${FIELD_VALUE}`)
            break;
          case 'boolean':
            if (!lodash.isBoolean(FIELD_VALUE)) errors.push(`Variable '${FIELD_NAME}' got invalid value ${FIELD_VALUE}; Expected type Boolean; Boolean cannot represent a non boolean value: ${FIELD_VALUE}`);
            break;
          case 'number':
            if (!lodash.isNumber(FIELD_VALUE)) errors.push(`Variable '${FIELD_NAME}' got invalid value ${FIELD_VALUE}; Expected type Number; Number cannot represent a non number value: ${FIELD_VALUE}`);
            break;
          case 'object':
            if (!lodash.isObject(FIELD_VALUE)) errors.push(`Variable '${FIELD_NAME}' got invalid value ${FIELD_VALUE}; Expected type JSON; JSON cannot represent a non json value: ${FIELD_VALUE}`);
            break; 
          case 'array':
            if (!lodash.isArray(FIELD_VALUE)) errors.push(`Variable '${FIELD_NAME}' got invalid value ${FIELD_VALUE}; Expected type Array; Array cannot represent a non array value: ${FIELD_VALUE}`);
            break;
          case 'date':
            if (!lodash.isString(FIELD_VALUE)) errors.push(`Variable '${FIELD_NAME}' got invalid value ${FIELD_VALUE}; Expected type String; String cannot represent a non string value: ${FIELD_VALUE}`);
            if (moment(FIELD_VALUE, 'YYYY-MM-DD').isValid()) errors.push(`Invalid date for '${FIELD_NAME}'`);
            break;
          case 'datetime':
            if(!lodash.isDate(FIELD_VALUE)) errors.push(`Variable '${FIELD_NAME}' got invalid value ${FIELD_VALUE}; Expected type Date; Date cannot represent a non date value: ${FIELD_VALUE}`);
            break;
          case 'url':
            if(!this.isValidURL(FIELD_VALUE)) errors.push(`Variable '${FIELD_NAME}' got invalid value ${FIELD_VALUE}; Expected URL value not: ${FIELD_VALUE}`);
            break;
        }
      }
    });

    
    if (isRequiredErrors.length || errors.length) {
      let isRequiredMsg = null
      if (isRequiredErrors.length) {
        isRequiredMsg = isRequiredErrors.length == 1 
          ? `This input '${isRequiredErrors[0]}' is required`
          : `This inputs [${isRequiredErrors.join(', ')}] are required`
      }

      throw {
        code: 'INVALID_INPUTS',
        message: `${isRequiredMsg ? isRequiredMsg + ' and \n'  : ''} ${errors.join(' and \n')}`
      }
    }
  }

  static getDistance(p1, p2) {
    const R = 6378137; // Earth’s mean radius in meter
    let dLat = this.rad(p2.lat - p1.lat);
    let dLong = this.rad(p2.lng - p1.lng);
    let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.rad(p1.lat)) * Math.cos(this.rad(p2.lat)) *
      Math.sin(dLong / 2) * Math.sin(dLong / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let d = R * c;
    return d; // returns the distance in meter
  }

  static rad(x) {
    return x * Math.PI / 180;
  }

  static round(num, places) {
    num = parseFloat(num);
    places = (places ? parseInt(places, 10) : 0)
    if (places > 0) {
      let length = places;
      places = "1";
      for (let i = 0; i < length; i++) {
        places += "0";
        places = parseInt(places, 10);
      }
    } else {
      places = 1;
    }
    return Math.round((num + Number.EPSILON) * (1 * places)) / (1 * places)
  }

  static binarySearch(sortedArray, key) {
    let start = 0;
    let end = sortedArray.length - 1;

    while (start <= end) {
      let middle = Math.floor((start + end) / 2);

      if (sortedArray[middle] === key) {
        // found the key
        return middle;
      } else if (sortedArray[middle] < key) {
        // continue searching to the right
        start = middle + 1;
      } else {
        // search searching to the left
        end = middle - 1;
      }
    }
    // key wasn't found
    return -1;
  }

  static async delay(delayInms) {
    return new Promise(resolve  => {
      setTimeout(() => {
        resolve(2);
      }, delayInms);
    });
  }

  /**
   * Returns a true if the text is arabic.
   * @param {*} text 
   * @returns 
   */
  static isArabic(text) {
    const pattern = /[\u0600-\u06FF\u0750-\u077F]/;
    const result = pattern.test(text);
    return result
  }

//#region [ Firestore Database]  
  static async createDocument(data, options) {
    const FirebaseHelper = require('./firebaseHelper')
    const record = {
      id: data.id ? data.id : FirebaseHelper.newId(),
      ...data,
      createdBy: FirebaseHelper.getCurrentUser(options).id,
      createdAt: FirebaseHelper.serverTimestamp(),
      updatedBy: FirebaseHelper.getCurrentUser(options).id,
      updatedAt: FirebaseHelper.serverTimestamp(),
    };

    await FirebaseHelper.executeOrAddToBatch(
      'set',
      admin.firestore().doc(`helper/${record.id}`),
      record,
      options,
    );

    return record;
  }

  static async updateDocument(id, data, options) {
    const FirebaseHelper = require('./firebaseHelper')
    const record = {
      id,
      ...data,
      updatedBy: FirebaseHelper.getCurrentUser(options).id,
      updatedAt: FirebaseHelper.serverTimestamp(),
    };

    await FirebaseHelper.executeOrAddToBatch(
      'update',
      admin.firestore().doc(`helper/${record.id}`),
      record,
      options,
    );

    return record;
  }

  static async destroyDocument(id, options) {
    functions.logger.log(`Start Delete document`)
    const FirebaseHelper = require('./firebaseHelper')
    await FirebaseHelper.executeOrAddToBatch(
      'delete',
      admin.firestore().doc(`helper/${id}`),
      null,
      options,
    );
  }

  static async findDocumentById(id) {
    const FirebaseHelper = require('./firebaseHelper')
    const record = await FirebaseHelper.findDocument(`helper`, id);
    return record
  }
//#endregion

//#region [ Console Loader ]
  static startLoader() {
    return (function() {
      // let h = ['|', '/', '-', '\\'];
      // let i = 0;
      // const symbol = '%'
      // let progressBar = symbol
      // return setInterval(() => {
      //   i = (i > 3) ? 0 : i;
      //   progressBar = (progressBar.length > 100) ? symbol : progressBar;
      //   // console.clear();
      //   console.log('loading', progressBar, h[i]);
      //   i++;
      //   progressBar += symbol
      // }, 200);

      const P = ['\\', '|', '/', '-'];
      let x = 0;
      const symbol = '-'
      let progressBar = symbol
      return setInterval(() => {
        progressBar = (progressBar.length > 100) ? symbol : progressBar;
        process.stdout.write(`\rloading ${progressBar} ${P[x++]}`);
        x %= P.length;
        progressBar += symbol
      }, 250);
    })();
  }
  static stopLaoder(loader) {
    clearInterval(loader)
  }
  static startSpinner(message, callback = null) {
    process.stdout.write(message);
    loadingSpinner.start(100, {
      clearChar: true, // Clear the spinner when stop() is called
      // clearLine: true, // Clear the entire line when stop() is called
      // doNotBlock: true, // Does not prevent the process from exiting
      hideCursor: true  // Hide the cursor until stop() is called
    });

    if (callback) {
      setTimeout(callback, 1000 * 10);
    }
  };
  static stopSpinner(message) {
    loadingSpinner.stop();
    process.stdout.write(message);
  };
//#endregion
};
