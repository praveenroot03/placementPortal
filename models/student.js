const mongoose = require('mongoose');
var bcrypt = require('bcrypt');
SALT_WORK_FACTOR = 10;

var studentSchema = new mongoose.Schema({
    datecreated : {
        type : Date,
        default : Date.now(),
        required : true
    },
    email : {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        minlength : 5,
        maxlength : 50,
        validate : function(isEmail) {
            emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
            return emailRegex.test(isEmail);
        }
    },

    name : {
        type : String,
        required : true,
        minlength : 2,
        maxlength : 50
    },

    password : {
        type : String,
        required : true,
        minlength : 8,
        maxlength : 25
    },

    phoneno : {
        type : String,
        required : true,
        maxlength : 10,
        unique : true,
        validate : function(isPhone) {
            phoneRegex = /\d{10}/;
            return phoneRegex.test(isPhone);
        }
    },

    address :{
        type : String,
        maxlength : 200,
        default : ""
    },
    
    skillset : {
        type : [String]
    },

    profilephoto : {
        type : String,
        default : ""
    },

    resume : {
        type : String,
        default : ""
    },

    appliedjob : {
        type : [String]
    }
});

studentSchema.pre('save', function( next){
    var student = this;

    if (!student.isModified('password')) return next();

    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){
        if (err) return next(err);
        
        bcrypt.hash(student.password, salt, function(err, hash) {
            if (err) return next(err);
            student.password = hash;
            next();
        });
    });

});

studentSchema.statics.authenticate = function (email, password, callback) {
    student.findOne({ email : email})
        .exec(function (err, student){
            if (err) {
                return callback(err);
            } else if (!student) {
                var err = new Error("User not found");
                return callback(err);
            }
            bcrypt.compare(password, student.password, function (err, isMatch) {
                if (isMatch === true) {
                    return callback(null, student);
                } else {
                    return callback(err); // check this
                }
            })
        })
};

studentSchema.statics.getdata = function (studentid, callback) {
    student.findById(studentid)
        .exec(function (err, student){
            if (err) {
                return callback(err);
            } else if (!student) {
                var err = new Error("User id not found");
                return callback(err);
            }
            var data = {name: student.name, email: student.email, phoneno:student.phoneno};
            return callback(null, data);
        })
};

studentSchema.statics.uploadphoto = function (studentid, filename, callback) {
    console.log(studentid,filename);
    student.findByIdAndUpdate(studentid, {$set:{profilephoto : filename}},{new:true})
        .then(function (err, student){
            if (err) {
                return callback(err);
            } else if (!student) {
                var err = new Error("User id not found");
                return callback(err);
            } 
        })
}

var student = mongoose.model('Students', studentSchema);
module.exports = student;