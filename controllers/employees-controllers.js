
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const Logger = require('../services/logger-service');
const logger = new Logger('employees');

const HttpError = require('../models/http-error');

const { Employee } = require('../models/employee');

const Manager = require('../models/manager');

//Controller handler to get all employees from Employees collection
const getEmployees = async (req, res, next) => {
    const managerId = req.managerData.managerId;

    let managerWithEmployees;

    /* Retrieve all employees of specific manager by joining all the employees id of 
        employees array in Manager collection with all the employees id in Employee collection 
        using populate method */
    try {
        managerWithEmployees = await Manager.findById(managerId).populate('employees');
    }
    catch (err) {
        await logger.error(err.message);
        const error = new HttpError('Failed to retrieve employees, please try again', 500);
        return next(error);
    }

    if (!managerWithEmployees || managerWithEmployees.employees.length === 0) {
        return res.json({ message: 'No employees found. Please try to add some employee' });
    }

    //Send response with all employees data
    res.json({ employees: managerWithEmployees.employees.map(p => p.toObject({ getters: true })) });
};

//Controller handler to create employee in Employee collection
const createEmployee = async (req, res, next) => {

    //Validate the result of request validator object while checking req body in routes model
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid Inputs passed, please check your data', 422));
    }

    const { firstname, lastname, address, dob, city, mobile } = req.body;

    const createdEmployee = new Employee({
        firstname,
        lastname,
        address,
        dob: new Date(dob),
        city,
        mobile,
        manager: req.managerData.managerId
    });

    let manager;

    //Check whether manager is exists while creating employees
    try {
        manager = await Manager.findById(req.managerData.managerId);
    }
    catch (err) {
        await logger.error(err.message);
        const error = new HttpError('Could not created employee, please try again later', 500);
        return next(error);
    }

    if (!manager) {
        const error = new HttpError('You are not allowed to create employee', 422);
        return next(error);
    }

    /*Performing DB transaction to create employee document 
        and pushing created employee id in Manager employees field array */
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdEmployee.save({ session: sess });
        manager.employees.push(createdEmployee);
        await manager.save({ session: sess });
        await sess.commitTransaction();
    }
    catch (err) {
        await logger.error(err.message);
        const error = new HttpError('Something went wrong, Could not add employee', 500);
        return next(error);
    }

    //Send success response
    res.status(201).json({ employee: createdEmployee });
}

//Controller hanlder to update employee document
const updateEmployee = async (req, res, next) => {
    const { firstname, lastname, address, dob, city, mobile } = req.body;

    const employeeId = req.params.eid;

    let employee;

    //Check employee document exists
    try {
        employee = await Employee.findById(employeeId);
    }
    catch (err) {
        await logger.error(err.message);
        const error = new HttpError('Something went wrong, could not update employee');
        return next(error);
    }

    //Check whether valid manager can edit employee
    if (employee.manager.toString() !== req.managerData.managerId) {
        const error = new HttpError('You are not allowed to edit this employee', 401);
        return next(error);
    }

    employee.firstname = firstname;
    employee.lastname = lastname;
    employee.address = address;
    employee.dob = dob;
    employee.city = city;
    employee.mobile = mobile;

    //Update the employee document
    try {
        await employee.save();
    }
    catch (err) {
        await logger.error(err.message);
        const error = new HttpError('Something went wrong, could not update employee');
        return next(error);
    }

    //Send an response with update employee document
    res.status(200).json({ employee: employee.toObject({ getters: true }) });
}

//Controller handler to delete employee document
const deleteEmployee = async (req, res, next) => {
    const employeeId = req.params.eid;

    let employee;

    //Get the employee document with associated manager document
    try {
        employee = await Employee.findById(employeeId).populate('manager');
    }
    catch (err) {
        await logger.error(err.message);
        const error = new HttpError('Something went wrong, could not delete employee');
        return next(error);
    }

    if (!employee) {
        const error = new HttpError('Could not find employee for given id', 404);
        return next(error);
    }

    if (employee.manager.id !== req.managerData.managerId) {
        const error = new HttpError('You are not allowed to delete this employee', 401);
        return next(error);
    }

    /* Performing transaction to remove employee doc from Employee collection 
        and also pull employee id from associate Manager doc employees array */
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await employee.remove({ session: sess });
        employee.manager.employees.pull(employee);
        await employee.manager.save({ session: sess });
        await sess.commitTransaction();
    }
    catch (err) {
        await logger.error(err.message);
        const error = new HttpError('Something went wrong, could not delete employee');
        return next(error);
    }

    //Send an success response
    res.status(200).json({ message: 'Employee Deleted.' });
}

exports.getEmployees = getEmployees;
exports.createEmployee = createEmployee;
exports.updateEmployee = updateEmployee;
exports.deleteEmployee = deleteEmployee;