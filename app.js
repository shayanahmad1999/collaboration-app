const express = require('express');
const morgan = require('morgan');
const userRoute = require('./routes/userRoute');
const messageRoute = require('./routes/messageRoute');
const taskRoute = require('./routes/taskRoute');
const customeError = require('./utils/customeError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

// register ejs view engine
app.set('view engine', 'ejs');

// Middleware
app.use(express.json());
 if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
 }

 // static file middleware
app.use(express.static('./public'));

// routes
// user route
app.use('/users', userRoute);

// message route
app.use('/messages', messageRoute);

// task route
app.use('/tasks', taskRoute);

// 404-page 
app.all('*', (req, res, next) => {
   const err = new customeError(`Can't find ${req.originalUrl} on the server`, 404);
   next(err);
});

app.use(globalErrorHandler);

module.exports = app;