const axios  = require('axios');

const { PAYTABS_API_KEY, PAYTABS_CLIENT_KEY, PAYTABS_PROFILE_ID, PAYTABS_BASE_URL } = process.env;
const Headers = {
  'Authorization': `${PAYTABS_API_KEY}`,
  // 'Authorization': `Bearer SMJN6HHDJG-JGGG2ZBZBR-ZHNGWDDJ9Z`,
  'Content-Type': 'application/json',
};
const BaseUrl = PAYTABS_BASE_URL;

module.exports = class Paytabs {
  // constructor() {
  //   this.Headers = {
  //     'Authorization': `Bearer ${PAYTABS_API_KEY}`,
  //     'Content-Type': 'application/json',
  //   };
  //   this.BaseUrl = PAYTABS_BASE_URL;
  // }

  /**
   * Lookup of a transaction based on the transaction ref. Returns indication is transaction has been completed or not, and what the result was if it has been completed.
   * @param {*} tran_ref 
   * @returns 
   */
  static async lookupTransaction(tran_ref) {
    try {
      const END_POINT = `/query`;
      const URL = BaseUrl + END_POINT;
      const payload = {
        profile_id: parseFloat(PAYTABS_PROFILE_ID),
        tran_ref: tran_ref,
      }

      const response = await axios.post(URL, payload, { headers: Headers });

      const responseData = response && response.data;
      return responseData;
    } catch (error) {
      throw error
    }
  }
};