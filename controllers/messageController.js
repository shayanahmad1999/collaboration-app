const Message = require('./../models/messageModel');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const customeError = require('../utils/customeError');
const mongoose = require('mongoose');

exports.index = async(req, res, next) => {
    const messages = await Message.find().populate('sender_id').populate('receiver_id');
    res.json({
        total: messages.length, 
        messages
    });
}

exports.create = asyncErrorHandler (async(req, res, next) => {
    const { sender_id, receiver_id, message_content } = req.body;
    const ObjectId = mongoose.Types.ObjectId;
    const newMessage = await Message.create({
        sender_id: new ObjectId(sender_id),
        receiver_id: new ObjectId(receiver_id),
        message_content: message_content
    });
    res.status(200).json({
        status: 'success',
        data:{
            message: newMessage
        } 
    });
});