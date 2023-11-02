const Task = require('../models/taskModel');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const customeError = require('../utils/customeError');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.index = async(req, res, next) => {
    
    const token = req.cookies.jwt;
    if(!token){
        next(new customeError('you are not logged in!', 401))
    }

    const decoded = jwt.verify(token, process.env.SECRET_JWT_STR); 
    const userId = decoded.id;

    const tasks = await Task.find(
        {
            $or: [{ assigned_by: userId }, { assigned_to: userId }]
        }
    ).populate('assigned_to').populate('assigned_by');
     // for web page
     const successMessage = [] ;
     res.render('tasks/index', {successMessage, tasks: tasks, total: tasks.length, title: 'Tasks' });
    // res.json({
    //     total: tasks.length, 
    //     tasks
    // });
}

exports.createView = async (req, res, next) => {
    const token = req.cookies.jwt;
    const decoded = jwt.verify(token, process.env.SECRET_JWT_STR); 
    const userId = decoded.id;
    const user = await User.find({
        $or: [{ _id: userId }]
    });
    const users = await User.find({});
    res.render('tasks/create', {users: users, user: user, title: 'Create', user: req.user });
};

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

exports.details = (req, res, next) => {
    const id = req.params.id;
    Task.findById(id).populate('assigned_to').populate('assigned_by')
    .then((result) => {
        // for web page
        res.render('tasks/details', {task: result, title: 'Task Details'});
    })
    .catch((err) => {
        // for web page
        res.status(404).render('404-page', {title: 'Task not found'});
    });
};

exports.destroy = (req, res) => {
    const id = req.params.id;
    Task.findByIdAndDelete(id)
    .then((result) => {
        res.json({redirect: '/tasks'});
    })
    .catch((err) => {
        console.log(err);
    });
};