const mongoose = require('mongoose');

const Schema = mongoose.Schema;

var CounterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
});

//Counter collection to generate Employees id in sequence 
var counter = mongoose.model('counter', CounterSchema);

//Schema of Employee document
const employeeSchema = new Schema({
    empId: {
        type: String
    },
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
    mobile: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    manager: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'Manager'
    }
});

//Generating sequence id for employee document before creating to collection
employeeSchema.pre('save', function (next) {
    var doc = this;
    if (doc.isNew) {
        counter.findByIdAndUpdate(
            { _id: 'entityId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true, useFindAndModify: false })
            .then(function (count) {
                doc.empId = count.seq;
                next();
            })
            .catch(function (error) {
                console.error("counter error-> : " + error);
                throw error;
            });
    }
    else {
        next();
    }
});

exports.Employee = mongoose.model('Employee', employeeSchema);
exports.counter = counter;