const express = require('express');
const morgan = require('morgan');
const userRoute = require('./routes/userRoute');
const messageRoute = require('./routes/messageRoute');
const taskRoute = require('./routes/taskRoute');
const customeError = require('./utils/customeError');
const globalErrorHandler = require('./controllers/errorController');
const cookieParser = require('cookie-parser');

const app = express();

// Enable CORS for all requests
app.use(function(req, res, next) {
   res.header('Access-Control-Allow-Origin', 'http://localhost:5173'); // Replace with your actual front-end's URL
   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
   next();
 });

// register ejs view engine
app.set('view engine', 'ejs');

// Middleware
app.use(express.json());
 if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
 }

 // static file middleware
app.use(express.static('./public'));

// cookie middleware
app.use(cookieParser());

// routes
// user route
app.use('/users', userRoute);

// message route
app.use('/messages', messageRoute);

// task route
app.use('/tasks', taskRoute);

app.get('/about', (req, res) => {
   res.render('about', {title: 'About', user: req.user});
});

app.get('/', (req, res) => {
   res.render('users/index', {title: 'Login', user: req.user});
});


app.use((req, res) => {
   res.status(404).render('404-page', {title: '404-page', user: req.user});
});

// 404-page 
app.all('*', (req, res, next) => {
   const err = new customeError(`Can't find ${req.originalUrl} on the server`, 404);
   next(err);
});

app.use(globalErrorHandler);

module.exports = app;