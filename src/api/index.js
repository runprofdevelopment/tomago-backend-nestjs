require('../infrastructure/firebaseInit');

const express = require('express');
const cors = require('cors');
const app = express();
const graphqlHTTP = require('express-graphql');
const helmet = require('helmet');
const { schema } = require('./schema');
const config = require('../../config')();
const headerMiddleware = require('../middleware/headerMiddleware');
const passingGraphQLMiddleware = require('../middleware/passingGraphQLMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const uploadFileRoutes = require('./upload-file');
// const appCheckVerification = require('../middleware/appCheckMiddleware');
// const passingRestApiMiddleware = require('../middleware/passingRestApiMiddleware');
// const {
//   init: databaseInit,
//   middleware: databaseMiddleware,
// } = require('../../database/databaseInit');

app.use(cors({ origin: true })); // Enables CORS
app.use(helmet()); // Enables Helmet, a set of tools to increase security.
app.use(express.json()); // Ensure that the body can be parsed as JSON

// Health check endpoint for Cloud Run
app.use('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use(
  '/upload-file',
  // authMiddleware,
  // getContext,
  uploadFileRoutes,
);

const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '10mb' })); // Increase limit if needed

app.use('/env', (req, res) => {
  res.send({
    NODE_ENV: process.env.NODE_ENV,
    API_KEY: process.env.API_KEY,
  });
});

app.use(
  '/api/cancelOrderPendingPayment',
  async (req, res) => {
    console.log(
      `=============================== STARTED CANCEL ORDER PENDING PAYMENT ===============================`,
    );

    const moment = require('moment');

    console.log(
      `Task running at: [${moment().format(
        'YYYY-MM-DD HH:mm:ss',
      )}]`,
    );

    const body = req.body;
    const orderId = body?.orderId;
    const context = body?.context;
    console.log({ body });

    try {
      if (orderId && context) {
        const OrderCancel = require('../services/order/orderCancel');
        await new OrderCancel(
          context,
        ).cancelOrderPendingPayment(orderId);
      }

      console.log(
        `✅ Cancel Order Pending Payment Successful: ${orderId}`,
      );
      console.log(
        `=============================== FINISHED CANCEL ORDER PENDING PAYMENT ===============================`,
      );
      res
        .status(200)
        .send('Cancel Order Pending Payment Successful');
    } catch (error) {
      res.status(403).send(error.message);
      // res.status(403).send({ status: 'Forbidden', code: error.code, message: error.message });
    }
  },
);

// Add the routes to the /api endpoint
const routes = require('../api-rest');
app.use('/api', routes);

// Default route handler for root path
app.get('/', (req, res) => {
  res.json({ 
    message: 'Tomago API is running', 
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      graphql: '/graphql',
      upload: '/upload-file',
      api: '/api/*'
    }
  });
});

// Sets up the GraphQL endpoint
app.use(
  '/graphql',
  headerMiddleware,
  // appCheckVerification,
  passingGraphQLMiddleware,
  authMiddleware,
  graphqlHTTP((req, res) => ({
    schema,
    graphiql: config.graphiql,
    context: {
      currentUser: req.currentUser,
      url: req.url,
      referrer: req.headers,
      roro: req,
      appCheckToken:
        req.appCheckToken ||
        req.headers['x-firebase-appcheck'],
      ipAddress:
        req.ipAddress || req.headers['x-forwarded-for'],
      language:
        req.language ||
        req.headers['accept-language'] ||
        'en',
      body: req.body,
      operationNames: req.operationNames, // Passing operation names to the GraphQL context if needed
      // operationName: req.operationName,   // Passing operation names to the GraphQL context if needed
      operationType: req.operationType,
      selectedFields: req.selectedFields || [],
      platform: req.platform,
    },

    formatError(error) {
      if (process.env.NODE_ENV !== 'test') {
        console.error(error);
      }

      // const statusCode = [200, 400, 401, 404, 500]
      // error.originalError.statusCode = 200;
      res.status(200);

      // Check if the error is an array
      // const errors = error.originalError;
      // if (Array.isArray(error.originalError)) {
      //   return errors.map((err) => ({
      //     // code: err.originalError && err.originalError.code,
      //     message: err.message,
      //     locations: err.locations,
      //     path: err.path,
      //   }));
      // }

      // if (error.message.startsWith('[')) {
      //   // Parse and return the error as an array of error objects
      //   const errorsss = JSON.parse(error.message);
      //   return errorsss;
      // }
      // if (Array.isArray(error.originalError)) {
      //   // Parse and return the error as an array of error objects
      //   return {
      //     message: 'Multiple errors occurred',
      //     errors: JSON.parse(error.originalError.message)
      //   };
      // }
      // return error.originalError.errors;

      if (
        error.originalError &&
        error.originalError.message ===
          `This account doesn't exist.`
      ) {
        return {
          status: 'profile_not_found',
          code: error.originalError.code,
          message: error.message,
          locations: error.locations,
          path: error.path,
        };
      }

      if (
        error.originalError &&
        error.originalError.name === 'GraphQLError'
      ) {
        return {
          code: error.originalError.message,
          name: error.originalError.name,
          message: JSON.stringify(
            error.originalError.errors,
          ),
          // message: error.originalError.errors,
          // message: error.originalError.message,
          // errors: error.originalError.errors,
        };
      }

      return {
        code:
          error.originalError && error.originalError.code,
        message: error.message,
        locations: error.locations,
        path: error.path,
      };
    },
  })),
);

module.exports = app;
