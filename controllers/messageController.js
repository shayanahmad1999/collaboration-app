const Message = require('./../models/messageModel');
const User = require('./../models/userModel');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const customeError = require('../utils/customeError');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

exports.index = async(req, res, next) => {

    // const testToken = req.headers.authorization;
    // let token;
    // if(testToken && testToken.startsWith('bearer')){
    //     token = testToken.split(' ')[1];
    // }
    // if we use cookie-parser then the about code which i comment no need
    const token = req.cookies.jwt;
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

    const successMessage = [] ;

    res.render('messages/index', {successMessage, messages: messages, total: messages.length, title: 'Messages' });
    // res.json({
    //     total: messages.length, 
    //     messages
    // });
}

exports.createView =  async (req, res) => {
   
    const token = req.cookies.jwt;
    const decoded = jwt.verify(token, process.env.SECRET_JWT_STR); 
    const userId = decoded.id;
    const user = await User.find({
        $or: [{ _id: userId }]
    });
    const users = await User.find({});
    res.render('messages/create', {users: users, user: user, title: 'Create', user: req.user });
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

exports.details = (req, res, next) => {
    const id = req.params.id;
    Message.findById(id).populate('sender_id').populate('receiver_id')
    .then((result) => {
        res.render('messages/details', {message: result, title: 'Message Details'});
    })
    .catch((err) => {
        res.status(404).render('404-page', {title: 'Message not found'});
    });
};

exports.destroy = (req, res) => {
    const id = req.params.id;
    Message.findByIdAndDelete(id)
    .then((result) => {
        res.json({redirect: '/messages'});
    })
    .catch((err) => {
        console.log(err);
    });
}