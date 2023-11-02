const express = require('express');
const messageController = require('./../controllers/messageController');
const userController = require('./../controllers/userController');

const router = express.Router();

router.route('/').get(userController.protect, messageController.index);
router.route('/create').get(userController.protect, messageController.createView);
router.route('/create').post(userController.protect, messageController.create);

module.exports = router;