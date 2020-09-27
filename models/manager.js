const mongoose = require('mongoose');

const mongooseValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

//Schema of Manager document
const managerSchema = new Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    dob: {
        type: Date,
        required: true
    },
    company: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    employees: [{
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'Employee'
    }]
});

//Validation for unique fields within a Manager schema while pre-save the document.
managerSchema.plugin(mongooseValidator);

module.exports = mongoose.model('Manager', managerSchema);