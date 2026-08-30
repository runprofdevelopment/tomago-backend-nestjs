// Load environment variables from project root
require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });

// Debug environment variables at startup
console.log('\n=== Environment Variables ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('ENV:', process.env.ENV);
console.log('===========================\n');

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('Error stack:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// const App = require('./app'); // Temporarily disabled for debugging
const colors = require('colors');
colors.enable();

const port = process.env.PORT || 8080;

// Start with a basic Express app
const express = require('express');
const cors = require('cors');
const app = express();

// Basic middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Add GraphQL endpoint (without Firebase dependency for now)
const graphqlHTTP = require('express-graphql');

// Simple GraphQL schema for testing
const { buildSchema } = require('graphql');

const schema = buildSchema(`
  type Query {
    hello: String
    status: String
  }
  
  type Mutation {
    customerCreateAccount(data: String): String
  }
`);

const root = {
  hello: () => 'Hello World!',
  status: () => 'GraphQL is working',
  customerCreateAccount: ({ data }) => {
    console.log('customerCreateAccount called with:', data);
    throw new Error('Firebase initialization required. Please contact support.');
  }
};

// Mount GraphQL on /graphql path for POST requests only
app.use('/graphql', (req, res, next) => {
  if (req.method === 'POST') {
    // This is likely a GraphQL request
    graphqlHTTP({
      schema: schema,
      rootValue: root,
      graphiql: false, // Disable GraphiQL on POST
    })(req, res, next);
  } else if (req.method === 'GET' && req.url === '/') {
    // This is the basic test endpoint
    res.json({ message: 'Decoopa API is running', timestamp: new Date().toISOString() });
  } else {
    next();
  }
});

function replaceGraphQLSchema() {
  try {
    const express = require('express');
    const cors = require('cors');
    
    // Import the real application API
    const realApp = require('./src/api');
    
    // Replace the simplified GraphQL middleware with the real one
    const existingApp = app._router;
    
    // Clear existing routes
    app._router = express.Router();
    
    // Add basic middleware
    app.use(cors({ origin: true }));
    app.use(express.json());
    
    // Mount the real application API (includes health check)
    app.use('/', realApp);
    
    console.log('✅ GraphQL schema replaced with full application schema');
    
  } catch (error) {
    console.error('❌ Failed to replace GraphQL schema:', error.message);
    console.error('⚠️ Continuing with simplified schema');
  }
}

async function startServer() {
  try {
    console.log('Starting server initialization...');
    console.log('Environment variables:');
    console.log('- PORT:', process.env.PORT);
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    console.log('- ENV:', process.env.ENV);
    
    // Start the server immediately
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`✅ Server started successfully on port ${port}`);
      console.log(`🌐 Server URL: http://localhost:${port}`);
      console.log(`🏥 Health check: http://localhost:${port}/health`);
    });

    // Add error handling for the server
    server.on('error', (error) => {
      console.error('❌ Server error:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use`);
      }
      process.exit(1);
    });

    // Handle process termination gracefully
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('🛑 SIGINT signal received: closing HTTP server');
      server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
      });
    });

    // Firebase initialization step-by-step approach
    console.log('🔥 Preparing for Firebase Admin SDK initialization...');

    // Step 1: Initialize Firebase Admin SDK (includes named Firestore database binding)
    setTimeout(() => {
      console.log('🔥 Step 1: Initializing Firebase Admin via firebaseInit...');

      try {
        require('./src/infrastructure/firebaseInit');
        console.log('✅ Firebase Admin SDK initialized successfully');

        console.log('🔄 Replacing GraphQL schema with full application schema...');
        replaceGraphQLSchema();
      } catch (error) {
        console.error('❌ Firebase Admin initialization failed:');
        console.error('  - Message:', error.message);
        console.error('  - Code:', error.code || 'N/A');
        console.error('⚠️ Server continues with limited functionality');
      }
    }, 3000);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('Error stack:', error.stack);
    process.exit(1);
  }
}

startServer();

// To revert your CLI to the previously installed version, you may run:
// $ gcloud components update --version 464.0.0