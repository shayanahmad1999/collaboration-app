const express = require('express');
const messageController = require('./../controllers/messageController');

const router = express.Router();

router.route('/').get(messageController.index);
router.route('/create').post(messageController.create);

module.exports = router;