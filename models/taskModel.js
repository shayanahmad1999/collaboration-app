const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    task_name: String,
    description: String,
    assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    assigned_by: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    due_date: Date,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const Task = new mongoose.model('task', taskSchema);
module.exports = Task;