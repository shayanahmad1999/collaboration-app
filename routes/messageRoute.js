const express = require('express');
const messageController = require('./../controllers/messageController');
const userController = require('./../controllers/userController');

const router = express.Router();

router.route('/').get(userController.protect, messageController.index);
router.route('/create').get(userController.protect, messageController.createView);
router.route('/create').post(userController.protect, messageController.create);
router.route('/details/:id').get(userController.protect, messageController.details);
router.route('/:id').delete(userController.protect, messageController.destroy);

module.exports = router;