const cors = require('cors');
const express = require('express');
const app = express();
const helmet = require('helmet');

global.__basedir = __dirname;

app.use(cors({ origin: true })); // Enables CORS
app.use(helmet()); // Enables Helmet, a set of tools to increase security.
app.use(express.json()) // Ensure that the body can be parsed as JSON

app.use(express.urlencoded({ extended: true }));
// need to parse HTTP request body 
app.use(express.json()); // Parses JSON-formatted text for bodies with a Content-Type of application/json.
// app.use(express.raw()); // Parses HTTP body in to a Buffer for specified custom Content-Types, although the default accepted Content-Type is application/octet-stream.
// app.use(express.text()); // Parses HTTP bodies with a Content-Type of text/plain, which returns it as a plain string.


// Routes which should handle requests
app.use('/upload', express.static('upload'))
const initRoutes = require('./routes/routes-test');
initRoutes(app);

module.exports = app;
