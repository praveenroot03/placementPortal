const mongoose = require('mongoose');

var jobSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },

    role : {
        type : String,
        required : true
    },

    description : {
        type : String,
        required : true,
    },

    jobid : {
        type : String,
        required : true,
        unique : true
    },

    studentid : {
        type : [String]
    }
});

var job = mongoose.model('Jobs', jobSchema);
module.exports = job;