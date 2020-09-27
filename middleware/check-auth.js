const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');

//Middleware to validate authenticity of manager while requesting REST APIs
module.exports = (req, res, next) => {

    if(req.method === 'OPTIONS') {
        return next();
    }

    //Get the auth token and verify it with jwt secret
    try {
        const token = req.headers.authorization.split(' ')[1]; //Bearer Authorization
        if (!token) {
            throw new Error('Authorization failed!')
        }
        const decodedData = jwt.verify(token, process.env.JWT_SECRET);
        req.managerData = { managerId: decodedData.managerId }
        next()
    }
    catch (err) {
        return next(
            new HttpError('Authorization failed!', 403)
        )
    }
}