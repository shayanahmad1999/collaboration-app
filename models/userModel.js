const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcryptjs');

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

const User = mongoose.model('user', userSchema);
module.exports = User;