const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Logger = require('../services/logger-service');
const logger = new Logger('managers');

const HttpError = require('../models/http-error');

const Manager = require('../models/manager');

//Controller handler to register manager in Manager Collection
const signup = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new HttpError('Invalid Inputs passed, please check your data', 403);
        return next(error);
    }

    const { firstname, lastname, address, dob, company, email, password } = req.body;

    let existingManager;

    //Check whether manager already exists
    try {
        existingManager = await Manager.findOne({
            email: email
        });
    }
    catch (err) {
        await logger.error(err.message);
        const error = new HttpError('Signing up failed, please try again later.', 500);
        return next(error);
    }

    //Throw an error if manager already exists
    if (existingManager) {
        const error = new HttpError('Manager already exists, please login instead', 403);
        return next(error);
    }

    //Create the hash password from managers password
    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    }
    catch (err) {
        await logger.error(err.message);
        const error = new HttpError('Could not create managers, please try again later', 500);
        return next(error);
    }

    //Create the manager document in Manager Collection
    const createdManager = new Manager({
        firstname,
        lastname,
        address,
        dob: new Date(dob),
        company,
        email,
        password: hashedPassword,
        employees: []
    });

    try {
        await createdManager.save();
    }
    catch (err) {
        await logger.error(err.message);
        const error = new HttpError('Signin up failed, please try again later', 500);
        return next(error);
    }

    //Generate the authentication token using JWT with payload
    let token;
    try {
        token = jwt.sign({
            managerId: createdManager.id,
            email: createdManager.email
        },
            process.env.JWT_SECRET,
            { expiresIn: '1h' });
    }
    catch (err) {
        await logger.error(err.message);
        const error = new HttpError('Signup failed, please try again later.', 500);
        return next(error);
    }

    //Send success response with data object in response
    res.status(200).json({ managerId: createdManager.id, email: createdManager.email, token: token });
}

//Controller handler to login manager
const login = async (req, res, next) => {
    const { email, password } = req.body;

    let existingManager;

    //Check whether manager exists with email
    try {
        existingManager = await Manager.findOne({
            email: email
        });
    }
    catch (err) {
        await logger.error(err.message);
        const error = new HttpError('Logged in failed, please try again later', 500)
        return next(error);
    }

    //Throw an error if manager didnt registered yet
    if (!existingManager) {
        const error = new HttpError('Invalid Credentials, please check your credentials', 422);
        return next(error);
    }

    //Compared the password gievn by manager with existing password
    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, existingManager.password);
    }
    catch (err) {
        await logger.error(err.message);
        const error = new HttpError('Could not log you, please try again later!');
        return next(error);
    }

    //If password doesnt match throw error
    if (!isValidPassword) {
        const error = new HttpError('Invalid Credentials, please check your credentials', 422);
        return next(error)
    }

    //Generate the authentication token after validating the manager
    let token;
    try {
        token = jwt.sign({
            managerId: existingManager.id,
            email: existingManager.email
        },
            process.env.JWT_SECRET,
            { expiresIn: '1h' });
    }
    catch (err) {
        await logger.error(err.message);
        const error = new HttpError('Logging failed, please try again later.', 500);
        return next(error);
    }

    //Send success response with data object in response
    res.status(200).json({ managerId: existingManager.id, email: existingManager.email, token: token });
}

exports.signup = signup;
exports.login = login;

