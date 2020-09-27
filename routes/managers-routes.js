const express = require('express');

const { check } = require('express-validator');

const managerControllers = require('../controllers/managers-controllers');

const router = express.Router();

//Request validator array to check req body contains valid data
const reqValidators = [
    check('firstname')
        .not().
        isEmpty(),
    check('lastname')
        .not().
        isEmpty(),
    check('address')
        .not().
        isEmpty(),
    check('dob')
        .not().
        isEmpty(),
    check('company')
        .not().
        isEmpty(),
    check('email')
        .normalizeEmail()
        .isEmail(),
    check('password').isLength({ min: 6 })
]

/* POST api i.e /api/managers/signup with req validator object as middleware 
    and calling controller signup method to create manager */
router.post(
    '/signup',
    reqValidators,
    managerControllers.signup);

/* POST api i.e /api/managers/login and calling controller signup method */
router.post('/login', managerControllers.login);

module.exports = router;