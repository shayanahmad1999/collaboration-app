const Task = require('../models/taskModel');
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

    const tasks = await Task.find(
        {
            $or: [{ sender_id: userId }, { receiver_id: userId }]
        }
    ).populate('assigned_to').populate('assigned_by');
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