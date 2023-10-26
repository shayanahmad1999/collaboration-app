const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({path: './config.env'});
const app = require('./app');

mongoose.connect(process.env.CONN_STR, {
    useNewUrlParser: true
}).then((success) => {
    // console.log(success);
    console.log('Database connected successfully');
}).catch((err => {
    console.log(err);
    console.log('Database not connected successfully');
}));

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
    console.log('server has been started...');
});

process.on('unhandledRejection', (err) => {
    console.log(err.name, err.message);
    console.log('unhandled rejection occoured! Shutting down...');

    server.close(() => {
        process.exit(1);
    })
})