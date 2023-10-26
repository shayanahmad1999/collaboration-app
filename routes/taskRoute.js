const express = require('express');
const taskController = require('./../controllers/taskController');

const router = express.Router();

router.route('/').get(taskController.index);
router.route('/create').post(taskController.create);

module.exports = router;