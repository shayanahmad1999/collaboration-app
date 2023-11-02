const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'please enter your name']
    },
    email: {
        type: String,
        required: [true, 'please enter an email'],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'please enter a password'],
        minlength: 8,
        select: false
    },
    confirmPassword: {
        type: String,
        required: [true, 'please confirm your password'],
        validate: {
            validator: function(val){
                return val == this.password;
            },
            message: 'password & confirm password does not match!'
        }
    },
    profileImage: {
        type: String,
        required: false
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpired: Date,
}, {timestamps: true});

userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, + '' + 12);
    this.confirmPassword = undefined;
    next();
});

userSchema.methods.comparePasswordInDb = async function(pas, pasdb) {
    return await bcrypt.compare(pas, pasdb);
}

userSchema.methods.isPasswordChanged = async function(jwtTimeStamp) {
    if(this.passwordChangedAt) {
        const passwordChangeTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        console.log(passwordChangeTimeStamp, jwtTimeStamp);
        return jwtTimeStamp < passwordChangeTimeStamp;
    }
    return false;
}

userSchema.methods.createResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetTokenExpired = Date.now() + 10 * 60 * 1000;
    return resetToken;
}

const User = mongoose.model('user', userSchema);
module.exports = User;