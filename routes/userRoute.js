const express = require('express');
const userController = require('./../controllers/userController');

const router = express.Router();

router.route('/').get(userController.users);
router.route('/login').get(userController.loginView);
router.route('/signup').get(userController.signupView);

router.route('/signup').post(userController.signup);
router.route('/login').post(userController.login);
router.route('/logout').get(userController.logout);
router.route('/forgotPassword').get(userController.forgotPasswordView);
router.route('/forgotPassword').post(userController.forgotPassword);
router.route('/resetPassword').get(userController.resetPasswordView);
router.route('/resetPassword/:token').post(userController.resetPassword);
router.route('/profile/:id').get(userController.profile);
router.route('/profile').post(userController.profileUpdate);

module.exports = router;