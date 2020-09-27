const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const employeeRoutes = require('./routes/employees-routes');
const managerRoutes = require('./routes/managers-routes');

const HttpError = require('./models/http-error');

const app = express();

//Import and create instance of logger service
const Logger = require('./services/logger-service');
const logger = new Logger('app');

app.use(bodyParser.json());

//Allow clients running on different server or port to access the resources by setting headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH ,DELETE');
    next();
})

app.use('/api/employees', employeeRoutes);
app.use('/api/managers', managerRoutes);

//Throw an error if client tries to access the routes excepts above routes
app.use((req, res, next) => {
    const error = new HttpError('Could not found this route!', 404);
    throw error;
});

//Throw an error if client fails to make request
app.use((error, req, res, next) => {
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500);
    res.json({ message: error.message || 'An internal error occured!' });
});

//Connect to MongoDB atlas
mongoose
    .connect(
        `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@devconnector.swz5a.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
    .then(() => {
        logger.info("Connected to DB!");
        app.listen( process.env.PORT || 5001);
    })
    .catch(error => {
        console.log(error);
    })