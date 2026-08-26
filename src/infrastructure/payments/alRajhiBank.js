const FirebaseRepository = require('../../../database/utils/firebaseRepository');
const axios =  require('axios');
const lodash = require('lodash');
const assert = require('assert');
const Payment = new (require('../../../database/models/payment'));

//#region [ Data generated for the rajhi bank api ]
  const ALGORITHM = "aes-256-cbc";
  const INIT_VECTOR = 'PGKEYENCDECIVSPC'
  const SECURITY_KEY = '20793600399920793600399920793600'
  const TRANPORTAL_ID = "g2y1SIp67m4IyYP"                 // Your Tranportal ID
  const TRANPORTAL_PASSWORD = "2#Y70xhY$pW$N5u"           // Your Tranportal Password
  const CURRENCY_CODE = "682"
  const RAJHI_UDF5 = "udf5"
  const UDF5 = "TRANID"
//#endregion

module.exports = class AlRajhiBankGateway {
  constructor() {
    // Data generated for the rajhi bank api
    this.algorithm = "aes-256-cbc";
    this.initVector = 'PGKEYENCDECIVSPC'
    this.securitykey = '20793600399920793600399920793600'
    this.Tranportal_ID = "g2y1SIp67m4IyYP"        // Your Tranportal ID
    this.Tranportal_Password = "2#Y70xhY$pW$N5u"  // Your Tranportal Password
    this.Currency_Code = "682"
    this.RajhiUdf5 = "udf5"
    this.Udf5 = "TRANID"
  }

//#region [ Bank Requists ]  
  /**
   * 
   * @param {Object} data 
   * @param {Float|String} data.amount Total amount of payment
   * @param {String} data.trackId Unique transaction identifier
   * @param {String} data.action 1 - Purchase , 4 - Pre-Authorization
   * @param {String} data.language Response url language
   * @param {Url<String>} data.responseURL Your End Point That The Result Will Be Sent To If The Payment Is Successful 
   * @param {Url<String>} data.errorURL Your End Point That The Result Will Be Sent To If The Payment Is Fail 
   * @param {Object} data.payoutAccounts Conditional if Merchant Opted for Split Payment or Payout.
   * @param {String} data.payoutAccounts.bankIdCode
   * @param {String} data.payoutAccounts.iBanNum
   * @param {String} data.payoutAccounts.benificiaryName
   * @param {String} data.payoutAccounts.serviceAmount
   * @param {String} data.payoutAccounts.valueDate
   * @returns trackId, paymentId, paymentPageUrl, currencyCode
   */
  async purchase({
    amount, 
    trackId = FirebaseRepository.newId(), 
    action,
    language,
    responseURL,
    errorURL,
    payoutAccounts,
    udf1 = "",
    udf2 = "",
    udf3 = "",
    udf4 = ""
  }) {
    try {
      let data = { amount, trackId, action, language, responseURL, errorURL, payoutAccounts }
      const record = Payment.cast(data)
      Payment.validate(record)

      // const OPTION = option ? this.encryptData(JSON.stringify(option)) : ""
      // const OPTION = JSON.stringify(option)
      const ACCOUNTS_DETAILS = record.payoutAccounts && record.payoutAccounts.length ? record.payoutAccounts : null
      const TRAN_DATA = `[
        {
          'amt': '${record.amount}',
          'action': '${record.action}',
          'password': '${this.Tranportal_Password}',
          'id': '${this.Tranportal_ID}',
          'currencyCode': '${this.Currency_Code}',
          'trackId': '${record.trackId}',
          'responseURL': '${record.responseURL}',
          'errorURL': '${record.errorURL}',
          'udf1': '${udf1}',
          'udf2': '${udf2}',
          'udf3': '${udf3}',
          'udf4': '${udf4}',
          'udf5': 'TRANID',
          'langid': '${language}',
          ${ACCOUNTS_DETAILS ? `'accountsDetails': ${ACCOUNTS_DETAILS}` : ''}
        }
      ]`

      const ENCRYPTED_TRAN_DATA = this.encryptData(TRAN_DATA)
      console.log(ENCRYPTED_TRAN_DATA);
      const TRANSACTION_DATA = [{
        "id": this.Tranportal_ID,
        "trandata": ENCRYPTED_TRAN_DATA,
        "responseURL": record.responseURL,
        "errorURL": record.errorURL,
      }]
      console.log(TRANSACTION_DATA);
    
      let response
      try {
        response = await axios({
          method: 'post',
          url: 'https://securepayments.alrajhibank.com.sa/pg/payment/hosted.htm',
          data: TRANSACTION_DATA,
        })
      } catch (error) {
        console.log(`Original Error :`, { code: error.code, message: error.message });
        throw { code: 'CREDIT_UNAVAILABLE', message: `Banking service provider unavailable` }
      }

      if (response.data && response.data.length && response.data[0].status === '1') {
        const paymentId = response.data[0].result.split(":")[0]
        const url = response.data[0].result.split(/:(.+)/)[1]
        const paymentPageUrl = url + '?PaymentID=' + paymentId

        return {
          trackId,
          paymentId: paymentId,
          paymentPageUrl: paymentPageUrl,
          currencyCode: this.Currency_Code,
        }
      } else {
        throw { code: response.data[0].error, message: response.data[0].errorText} 
      }
    } catch (error) {
      console.log('ERROR IN PURCHASE: ==>', error);
      throw error
    }
  }

  /**
   * 
   * @param {*} amount 
   * @param {String} trackId 
   * @param {String} transId 
   * @param {String} refundBy Value from one of this: "transId" / "trackId"
   * @returns 
   */
  async refund(amount, transId, refundBy = 'transId') {
    try {
      const TRACK_ID = FirebaseRepository.newId();
      const UDF5 = refundBy && refundBy === 'trackId' 
        ? 'TrackID'    // Refund by trackId
        : 'TRANID'     // Refund by transId
      
      const TRAN_DATA = `[
        {
          "amt": "${amount}",
          "action": "2",
          "password": "${this.Tranportal_Password}",
          "id": "${this.Tranportal_ID}",
          "currencyCode": "${this.Currency_Code}",
          "trackId": "${TRACK_ID}",
          "udf5": "${UDF5}",
          "transId": "${transId}"
        }
      ]`

      const ENCRYPTED_TRAN_DATA = this.encryptData(TRAN_DATA)
      const TRANSACTION_DATA = [{
        "id": this.Tranportal_ID,
        "trandata": ENCRYPTED_TRAN_DATA,
      }]
    
      // const response = await axios({
      //   method: 'post',
      //   url: 'https://securepayments.alrajhibank.com.sa/pg/payment/tranportal.htm',
      //   data: TRANSACTION_DATA,
      // })
      let response
      try {
        response = await axios({
          method: 'post',
          url: 'https://securepayments.alrajhibank.com.sa/pg/payment/tranportal.htm',
          data: TRANSACTION_DATA,
        })
      } catch (error) {
        throw { code: 'CREDIT_UNAVAILABLE', message: `Banking service provider unavailable` }
      }

      if (response.data && response.data.length && response.data[0].status === '1') {
        const transaction = response.data[0]
        const decryptedTrandata = decodeURIComponent(this.decryptData(transaction.trandata))
        const BANK_TRANSACTION = JSON.parse(decryptedTrandata.substring(1, decryptedTrandata.length - 1))

        return {
          trackId: TRACK_ID,
          transId: transaction.tranid,
          paymentId: BANK_TRANSACTION.paymentId,
          trandata: BANK_TRANSACTION,
          // trandata: transaction.trandata,
        }
      } else {
        // return response.data 
        throw { code: response.data[0].error, message: response.data[0].errorText} 
      }
    } catch (error) {
      console.log('ERROR IN REFUND');
      throw error 
    }
  }
//#endregion

  /**
   * Encrypt data
   * @param {String} message 
   * @returns Encrypted data as string
   */
  encryptData(message) {
    try {
      console.log('Encrypted_Message =', message);
      assert(lodash.isString(message), `Variable "message" got invalid value ${message}; Expected type String; String cannot represent a non string value: ${message}`)
      const crypto = require("crypto");
      const cipher = crypto.createCipheriv(this.algorithm, this.securitykey, this.initVector);
      const DATA = message
      let encryptedData = cipher.update(DATA, "utf-8", "hex");
      // console.log('encryptedData-1 =', encryptedData);
      encryptedData += cipher.final("hex");
      // console.log('encryptedData-2 =', encryptedData);
      return encryptedData
    } catch (error) {
      console.error('Encrypt Error ==>', error);  
      throw error    
    }
  }

  /**
   * Decrypt data
   * @param {String} message 
   * @returns Decrypted data as string
   */
  decryptData(message) {
    try {
      console.log('Decrypted_Message =', message);
      assert(lodash.isString(message), `Variable "message" got invalid value ${message}; Expected type String; String cannot represent a non string value: ${message}`)
      const crypto = require("crypto");
      const encryptedText = message
      const decipher = crypto.createDecipheriv(this.algorithm, this.securitykey, this.initVector);
      let decryptedData = decipher.update(encryptedText, "hex", "utf-8");
      decryptedData += decipher.final("utf8");
      return decryptedData  // .replace(/[\n ]/g, '')
    } catch (error) {
      console.error('Decrypt Error ==>', error);    
      throw error    
    }
  }

  parseTranData(trandata) {
    const decryptedText = this.decryptData(trandata)
    const decryptedTrandata = decodeURIComponent(decryptedText)
    const result = decryptedTrandata.substring(1, decryptedTrandata.length - 1);
    const BANK_TRANSACTION = JSON.parse(result)

    return {
      amt: BANK_TRANSACTION.amt,
      trackId: BANK_TRANSACTION.trackId,
      transId: BANK_TRANSACTION.transId,
      paymentId: BANK_TRANSACTION.paymentId,
      paymentTimestamp: BANK_TRANSACTION.paymentTimestamp,
      // cardType: BANK_TRANSACTION.cardType,
      // authRespCode: BANK_TRANSACTION.authRespCode,
      // result: BANK_TRANSACTION.result,
      // authCode: BANK_TRANSACTION.authCode,
      // actionCode: BANK_TRANSACTION.actionCode,
      // fcCustId: BANK_TRANSACTION.fcCustId,
      // ref: BANK_TRANSACTION.ref,
      // date: BANK_TRANSACTION.date,
      // udf1: BANK_TRANSACTION.udf1,
      // udf2: BANK_TRANSACTION.udf2,
      // udf3: BANK_TRANSACTION.udf3,
      // udf4: BANK_TRANSACTION.udf4,
      // udf5: BANK_TRANSACTION.udf5,
      // udf6: BANK_TRANSACTION.udf6,
      // udf7: BANK_TRANSACTION.udf7,
      // udf8: BANK_TRANSACTION.udf8,
      // udf9: BANK_TRANSACTION.udf9,
      // udf10: BANK_TRANSACTION.udf10,
    }
  }

//#region [ STATIC FUNCTIONS ]  
  static get currencyCode() {
    return CURRENCY_CODE
  }

  /**
   * Encrypt data
   * @param {String} message 
   * @returns Encrypted data as string
   */
  static encryptData(message) {
    try {
      console.log('Encrypted_Message =', message);
      assert(lodash.isString(message), `Variable "message" got invalid value ${message}; Expected type String; String cannot represent a non string value: ${message}`)
      const crypto = require("crypto");
      const cipher = crypto.createCipheriv(ALGORITHM, SECURITY_KEY, INIT_VECTOR);
      const DATA = message
      let encryptedData = cipher.update(DATA, "utf-8", "hex");
      // console.log('encryptedData-1 =', encryptedData);
      encryptedData += cipher.final("hex");
      // console.log('encryptedData-2 =', encryptedData);
      return encryptedData
    } catch (error) {
      console.error('ENCRYPT ERROR ==>', error);  
      throw error    
    }
  }

  /**
   * Decrypt data
   * @param {String} message 
   * @returns Decrypted data as string
   */
  static decryptData(message) {
    try {
      console.log('Decrypted_Message =', message);
      assert(lodash.isString(message), `Variable "message" got invalid value ${message}; Expected type String; String cannot represent a non string value: ${message}`)
      const crypto = require("crypto");
      const encryptedText = message
      const decipher = crypto.createDecipheriv(ALGORITHM, SECURITY_KEY, INIT_VECTOR);
      let decryptedData = decipher.update(encryptedText, "hex", "utf-8");
      decryptedData += decipher.final("utf8");
      return decryptedData  // .replace(/[\n ]/g, '')
    } catch (error) {
      console.error('DECRYPT ERROR ==>', error);    
      throw error    
    }
  }

  static parseTranData(trandata) {
    const decryptedText = this.decryptData(trandata)
    const decryptedTrandata = decodeURIComponent(decryptedText)
    const result = decryptedTrandata.substring(1, decryptedTrandata.length - 1);
    const BANK_TRANSACTION = JSON.parse(result)

    return {
      amt: BANK_TRANSACTION.amt,
      trackId: BANK_TRANSACTION.trackId,
      transId: BANK_TRANSACTION.transId,
      paymentId: BANK_TRANSACTION.paymentId,
      paymentTimestamp: BANK_TRANSACTION.paymentTimestamp,
      // cardType: BANK_TRANSACTION.cardType,
      // authRespCode: BANK_TRANSACTION.authRespCode,
      // result: BANK_TRANSACTION.result,
      // authCode: BANK_TRANSACTION.authCode,
      // actionCode: BANK_TRANSACTION.actionCode,
      // fcCustId: BANK_TRANSACTION.fcCustId,
      // ref: BANK_TRANSACTION.ref,
      // date: BANK_TRANSACTION.date,
      // udf1: BANK_TRANSACTION.udf1,
      // udf2: BANK_TRANSACTION.udf2,
      // udf3: BANK_TRANSACTION.udf3,
      // udf4: BANK_TRANSACTION.udf4,
      // udf5: BANK_TRANSACTION.udf5,
      // udf6: BANK_TRANSACTION.udf6,
      // udf7: BANK_TRANSACTION.udf7,
      // udf8: BANK_TRANSACTION.udf8,
      // udf9: BANK_TRANSACTION.udf9,
      // udf10: BANK_TRANSACTION.udf10,
    }
  }
//#endregion
  
}