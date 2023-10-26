const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    receiver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    message_content: String,
    sent_at: { type: Date, default: Date.now }
});

const Message = new mongoose.model('message', messageSchema);
module.exports = Message;