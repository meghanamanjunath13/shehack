'use strict';
var express = require('express'),
    bodyParser = require('body-parser'),
    http = require('http'),
    server = express();
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
var routes = require('./API/Routes/Routes'); //importing route

// Configuring the database
// const dbConfig = require('./config/database.config.js');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

// Connecting to the database
mongoose.connect('mongodb://localhost/gojek', {
    useNewUrlParser: true
}).then(() => {
    console.log("Successfully connected to the database");
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...');
    process.exit();
});

routes(server); //register the route
server.listen((process.env.PORT || 8000), function () {
    console.log("Server is up and listening on port " + (process.env.PORT ? process.env.PORT : 8000))
});