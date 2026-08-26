const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Test server running on port ${port}`);
  console.log('Environment variables:');
  console.log('- PORT:', process.env.PORT);
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  console.log('- ENV:', process.env.ENV);
}); 