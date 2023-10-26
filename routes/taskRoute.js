const express = require('express');
const taskController = require('./../controllers/taskController');
const userController = require('./../controllers/userController');

const router = express.Router();

router.route('/').get(userController.protect, taskController.index);
router.route('/create').post(userController.protect, taskController.create);

module.exports = router;