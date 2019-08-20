const mongoose = require('mongoose');
var recruits = require('../models/recruit');
var students = require('../models/student');

var today = new Date();
var date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();

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

    studentid : {
        type : [[String]]
    },

    salary : {
        type : String,
        required : true
    },

    datecreated : {
        type : String,
        default : date,
        required : true
    }
});

jobSchema.index({"name":"text","role":"text","description":"text"});

jobSchema.statics.addjob = function (name,role,description,recruitid,salary, callback) {
    //var jobid = uuidv4();
    var jobData = {
        name : name,
        role : role,
        description : description,
        salary : salary
      };
      console.log(jobData);
      
      job.create(jobData, function (err, job) {
        if (err) {
          console.log(err);
          return callback(err);
        }
        else {
       // console.log("Job data added",recruits);
        recruits.addjobid(recruitid,job._id);
        return callback(null,job)
        }
      });

};

jobSchema.statics.getjobs = function (query,callback) {
    job.find({$text: {$search: query}}, {score: {$meta: "textScore"}}).sort({score:{$meta:"textScore"}})    
        .exec(function (err, job){
            if(err)
                return callback(err);
            return callback(null,job);
        })
};

jobSchema.statics.getalljobs = function (callback) {
    job.find()
        .exec(function (err, job){
            if(err)
                return callback(err);
            return callback(null,job);
        })
};

jobSchema.statics.getjob = function (jobid, callback) {
    job.findById(jobid)
        .exec(function (err, job){
            if(err)
                return callback(err);
            return callback(null,job);
        })    
};

jobSchema.statics.applyjob = function (studentid, jobid,callback) {
    console.log(studentid,jobid);
    students.update({_id:studentid},{ $push: { appliedjob: jobid}})
        .exec(function (err, student) {
            if(err)
                return callback(err);
            else{
                job.updateOne({_id:jobid},{ $push: {studentid : [studentid, "0"]}})
                    .exec(function (error, job){
                        if(err)
                            return callback(err);
                        else
                            console.log("Applied");
                            
                    })
            }
                            
        })
}



var job = mongoose.model('Jobs', jobSchema);
module.exports = job;