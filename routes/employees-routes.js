const express = require('express');

const { check } = require('express-validator');

const router = express.Router();

const checkAuth = require('../middleware/check-auth');

const employeeControllers = require('../controllers/employees-controllers');

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
    check('mobile')
        .not().
        isEmpty(),
    check('city')
        .not().
        isEmpty()
]

//Protecting to authorized routes by applying chekAuth middleware
router.use(checkAuth);

/* GET api i.e /api/employees/ to get all the employees of manager */
router.get('/', employeeControllers.getEmployees);

/* POST api i.e /api/managers/ to create employee */
router.post(
    '/',
    reqValidators,
    employeeControllers.createEmployee);

/* PATCH api i.e /api/employees/employeeId to update employee */
router.patch('/:eid', reqValidators, employeeControllers.updateEmployee);

/* DELETE api i.e /api/employees/employeeId to delete employee */
router.delete('/:eid', employeeControllers.deleteEmployee);

module.exports = router;