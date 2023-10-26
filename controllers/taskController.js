const Task = require('../models/taskModel');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const customeError = require('../utils/customeError');
const mongoose = require('mongoose');

exports.index = async(req, res, next) => {
    const tasks = await Task.find().populate('assigned_to').populate('assigned_by');
    res.json({
        total: tasks.length, 
        tasks
    });
}

exports.create = asyncErrorHandler (async(req, res, next) => {
    const {task_name, description, assigned_to, assigned_by, due_date } = req.body;
    const ObjectId = mongoose.Types.ObjectId;
    const newTask = await Task.create({
        assigned_to: new ObjectId(assigned_to),
        assigned_by: new ObjectId(assigned_by),
        due_date: due_date,
        task_name: task_name,
        description: description,
    });
    res.status(200).json({
        status: 'success',
        data:{
            task: newTask
        } 
    });
});