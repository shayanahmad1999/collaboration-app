const express = require('express');
const userController = require('./../controllers/userController');

const router = express.Router();

router.route('/').get(userController.users);
router.route('/signup').post(userController.signup);
router.route('/login').post(userController.login);
router.route('/forgotPassword').post(userController.forgotPassword);
router.route('/resetPassword/:token').post(userController.resetPassword);

module.exports = router;