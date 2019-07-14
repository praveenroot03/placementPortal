const mongoose = require('mongoose');
var bcrypt = require('bcrypt');
SALT_WORK_FACTOR = 10;

var recruitSchema = new mongoose.Schema({
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

    description : {
        type : String,
        maxlength : 1000
    },

    jobid : {
        type : [String]
    }
});

recruitSchema.pre('save', function( next){
    var recruit = this;

    if (!recruit.isModified('password')) return next();

    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){
        if (err) return next(err);
        
        bcrypt.hash(recruit.password, salt, function(err, hash) {
            if (err) return next(err);
            recruit.password = hash;
            next();
        });
    });

});

recruitSchema.statics.authenticate = function (email, password, callback) {
    recruit.findOne({ email : email})
        .exec(function (err, recruit){
            if (err) {
                return callback(err);
            } else if (!recruit) {
                var err = new Error("User not found");
                return callback(err);
            }
            bcrypt.compare(password, recruit.password, function (err, isMatch) {
                if (isMatch === true) {
                    return callback(null, recruit);
                } else {
                    return callback(err); // check this
                }
            })
        })
};

recruitSchema.statics.getdata = function (recruitid, callback) {
    recruit.findById(recruitid)
        .exec(function (err, recruit){
            if (err) {
                return callback(err);
            } else if (!recruit) {
                var err = new Error("User id not found");
                return callback(err);
            }
            var data = {name: recruit.name, email: recruit.email, phoneno:recruit.phoneno};
            return callback(null, data);
        })
};

var recruit = mongoose.model('Recruit', recruitSchema);
module.exports = recruit;