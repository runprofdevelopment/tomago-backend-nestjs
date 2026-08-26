const axios = require('axios');

const SERVICE_URL = 'https://decoopa-335317890504.europe-west3.run.app'; // Replace with your actual Cloud Run service URL
const GRAPHQL_ENDPOINT = `${SERVICE_URL}/graphql`;

async function testApi() {
    console.log(`Testing API at: ${GRAPHQL_ENDPOINT}`);
    try {
        const response = await axios.post(GRAPHQL_ENDPOINT, {
            query: `
                query {
                    __typename
                }
            `
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
            // Disable SSL certificate validation for localhost or self-signed certs if needed for local testing,
            // but generally keep it enabled for production.
            // httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }) 
        });

        console.log('API Response:', JSON.stringify(response.data, null, 2));

        if (response.data && response.data.data && response.data.data.__typename) {
            console.log('\n✅ API test successful!');
        } else if (response.data && response.data.errors) {
            console.error('\n❌ API returned errors:', JSON.stringify(response.data.errors, null, 2));
        } else {
            console.error('\n⚠️ Unexpected API response format:', JSON.stringify(response.data, null, 2));
        }

    } catch (error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('\n❌ API Error Response Data:', JSON.stringify(error.response.data, null, 2));
            console.error('❌ API Error Status:', error.response.status);
            console.error('❌ API Error Headers:', error.response.headers);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('\n❌ No response received from API:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('\n🚨 Error setting up API request:', error.message);
        }
    }
}

testApi(); 