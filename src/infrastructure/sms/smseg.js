const axios  = require('axios');

module.exports = class SMSEG {

  static async sendSMS(message, mobiles) {
    try {
      const USER_NAME = 'info@decoopa.com';
      const PASSWORD = 'Decoopa@2020';
      const SENDER_NAME = 'decoopa';

      const BASE_URL = 'https://smssmartegypt.com/sms/api';
      const queryString = `?username=${USER_NAME}&password=${PASSWORD}&sendername=${SENDER_NAME}&message=${message}&mobiles=${mobiles}`;
      const URL = `${BASE_URL}/${queryString}`;

      const config = {
        method: 'post',
        url: URL,
        headers: { 
          'Content-Type': 'application/json', 
          'Accept': 'application/json', 
          'Accept-Language': 'en-US'
        }
      };
      
      const response = await axios(config);
      const data = response.data;
      console.log(data);
      
      if (data.type  === 'success') {
        console.log(JSON.stringify(data.data));
      }

      if (data.type === 'error') {
        const ERROR = JSON.stringify(data.error);
        console.log(ERROR);
        throw new Error(ERROR);
      }

      return data.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
};