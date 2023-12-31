const User = require('./../models/userModel');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const jwt = require('jsonwebtoken');
const customeError = require('../utils/customeError');
const util = require('util');
const sendEmail = require('../utils/email');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');

const signToken = id => {
    return jwt.sign({id}, process.env.SECRET_JWT_STR, {
        expiresIn: process.env.LOGIN_EXPIRES
    });
}

exports.users = async (req, res) => {
    const users = await User.find();
    res.status(200).json({
        status: "success",
        total: users.length,
        data: {
            users: users
        }
    });
}

exports.signupView = async (req, res) => {
    // for web page
    res.render('users/signup', { title: 'Signup', user: req.user });
}


exports.signup = asyncErrorHandler(async(req, res, next) =>{
    const newUser = await User.create(req.body);

    const token = signToken(newUser._id);
    // if we use cookie-parser
    res.cookie('jwt', token, {httpOnly: true});
    if(!req.body)
    {
        return next(new CustomError('Error creating a new user', 500));
    }

    res.status(200).json({
        status: 'success',
        token,
        data:{
            user: newUser
        } 
    });

}); 



exports.loginView = async (req, res) => {
    // for web page
    res.render('users/index', { title: 'Login', user: req.user });
}

exports.login = asyncErrorHandler(async(req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    if(!email || !password) {
        const error = new customeError('please provide email & password for login!', 404);
        return next(error);
    }

    const user = await User.findOne({email}).select('+password');

    if(!user || !(await user.comparePasswordInDb(password, user.password))) {
        const error = new customeError('incorrect email or password!', 400);
        return next(error);
    }

    const token = signToken(user._id);
    // if we use cookie-parser
    res.cookie('jwt', token, {httpOnly: true});

    res.status(200).json({
        status: 'success',
        token
    });
});

exports.logout = (req, res) => {
    res.cookie('jwt', '');
    res.locals.user = null;
    res.redirect('/users/login');
}

exports.protect = asyncErrorHandler(async (req, res, next) => {
    // read the token and check if it exit

    // const testToken = req.headers.authorization;
    // let token;
    // if(testToken && testToken.startsWith('bearer')){
    //     token = testToken.split(' ')[1];
    // }
    // console.log(token);

    // if we use cookie-parser then the about code which i comment no need
    const token = req.cookies.jwt;
    if(!token){
        // for web page
        res.status(404).render('404-page', {title: '404-page', user: req.user});

        next(new customeError('you are not logged in!', 401))
    }

    // validate the token
    const decodeToken = await util.promisify(jwt.verify)(token, process.env.SECRET_JWT_STR)

    // if the user exist
    const user = await User.findById(decodeToken.id);

    // ::::::::::::::::::::::: //
    // this code work like session 
    res.locals.user = user;
    // ::::::::::::::::::::::: //

    if(!user) {
        const error = new customeError('the user with given token does not exist!', 401);
        next(error);
    }

    // if the user changed password after the token was issued
    const isPasswordChanged = await user.isPasswordChanged(decodeToken.iat);
    if(isPasswordChanged) {
        const error = new customeError('the password has been changed recently please login again!', 401);
        return next(error);
    }

    // allow user to access route
    req.user = user;
    next()
});

            // OR

// exports.protect = async (req, res, next) => {
//     try {
//       const token = req.headers.authorization;
  
//       if (!token) {
//         return res.status(401).json({ message: 'No token provided' });
//       }
  
//       // Verify the token
//       const decoded = jwt.verify(token, process.env.SECRET_JWT_STR);
  
//       // Add the user information to the request
//       req.user = decoded;
  
//       next();
//     } catch (error) {
//       return res.status(401).json({ message: 'Invalid token' });
//     }
//   };

exports.forgotPasswordView = async (req, res, next) => {
    res.render('users/forgotPassword', {user: req.user, title: 'Forgot Password'})
}

exports.forgotPassword = asyncErrorHandler(async (req, res, next) => {
    const user = await User.findOne({email: req.body.email});
    if(!user) {
        const error = new customeError('we could not find the user with that email address', 404);
        next(error);
    }
    const resetToken = user.createResetPasswordToken();
    await user.save({validateBeforeSave: false});

    const resetUrl = `${req.protocol}://${req.get('host')}/users/resetPassword/${resetToken}`;
    const message = `please use the below link to reset your password \n\n${resetUrl}\n\n this reset password only valid for 10 minutes`;
    try {
        await sendEmail({
            email: user.email,
            subject: 'password change request received',
            message: message
        });
        res.status(200).json({
            status: 'success',
            message: 'reset link send to your email'
        });
    } catch (error){
        user.passwordResetToken = undefined,
        user.passwordResetTokenExpired = undefined,
        user.save({validateBeforeSave: false})

        return next(new customeError('there was an error please try again later', 500));
    }
})

exports.resetPasswordView = async (req, res, next) => {
    res.render('users/resetPassword', {user: req.user, title: 'Reset Password'})
}

exports.resetPassword = asyncErrorHandler(async(req, res, next) => {
  const token = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({passwordResetToken: token, passwordResetTokenExpired: {$gt: Date.now()}});
  if(!user) {
    const error = new customeError('token are invalid or expired!', 404);
    next(error);
  }  
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpired = undefined;
  user.passwordChangedAt = Date.now();
  user.save();

  const logintoken = signToken(user._id);

  res.status(200).json({
      status: 'success',
      token: logintoken
  });
})

exports.profile = (req, res, next) => {
    const id = req.params.id;
    User.findById(id)
    .then((result) => {
        // for web page
        res.render('users/profile', {user: result, title: 'Profile'});
    })
    .catch((err) => {
        // for web page
        res.status(404).render('404-page', {title: 'Profile not found'});
    });
};

const storage = multer.diskStorage({
    destination: 'public/images/',
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}${path.extname(file.originalname)}`)
    },
});
const upload = multer({
    storage: storage,
}).single('file');

exports.profileUpdate = asyncErrorHandler(async (req, res) => {
    upload(req, res, async function(err) {

        if (err) {
            return res.status(400).json({ error: err.message });
        }
            const userId = req.body.userId;
            const user = await User.findById(userId, {new: true, runValidators: true}); 

            user.profileImage = req.file.filename; 
            await user.save();

            res.status(200).json({ 
            message: 'Profile image updated successfully.',
            photo: `http://127.0.0.1:3000/images/${req.file.filename}`
        });
    });
});
