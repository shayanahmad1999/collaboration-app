const express = require('express');
const taskController = require('./../controllers/taskController');
const userController = require('./../controllers/userController');

const router = express.Router();

router.route('/').get(userController.protect, taskController.index);
router.route('/create').get(userController.protect, taskController.createView);
router.route('/create').post(userController.protect, taskController.create);
router.route('/details/:id').get(userController.protect, taskController.details);
router.route('/:id').delete(userController.protect, taskController.destroy);

module.exports = router;