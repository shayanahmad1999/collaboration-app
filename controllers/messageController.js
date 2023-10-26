const Message = require('./../models/messageModel');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const customeError = require('../utils/customeError');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

exports.index = async(req, res, next) => {

    const testToken = req.headers.authorization;
    let token;
    if(testToken && testToken.startsWith('bearer')){
        token = testToken.split(' ')[1];
    }
    if(!token){
        next(new customeError('you are not logged in!', 401))
    }

    const decoded = jwt.verify(token, process.env.SECRET_JWT_STR); 
    const userId = decoded.id;

    const messages = await Message.find(
        {
            $or: [{ sender_id: userId }, { receiver_id: userId }]
        }
    ).populate('sender_id').populate('receiver_id');
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