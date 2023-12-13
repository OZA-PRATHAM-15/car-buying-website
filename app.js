const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const compression = require('compression');

const electricRouter = require('./routes/electric_index');
const gasRouter = require('./routes/gas_index');
const adminRouter = require('./routes/admin');
const Customer = require("./models/CustomerModel");
const app = express();

//Connecting to Mongodb
const db = async () => {
    try {
        const conn = await mongoose.connect('mongodb://localhost:27017/pratham',
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: false
            });

        console.log("MongoDB connected");

    } catch (err) {
        console.log("MongoDB Error : Failed to connect");
        console.log(err);
        process.exit(1);
    }
}

db();

// view engine setup
app.engine('.hbs', exphbs({
    defaultLayout: 'layout', extname: '.hbs',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    }
}));
app.set('view engine', '.hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(compression());

console.log("App running on Localhost:5000");

// Routing
app.get('/', (req, res) => {
    res.redirect('/home');
});

app.get('/home', function (req, res) {
    res.sendFile(__dirname + "/routes/home.html");

});
app.get('/login', async (req, res) => {
    res.render('login.hbs');
});
app.get('/customers', async (req, res) => {
    try {
        const customers = await Customer.find({}); // Fetch all customers from the database
        res.render('customers_list', { list: customers });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching customers');
    }
});

app.use('/admin', adminRouter);
app.use('/electric', electricRouter);
app.use('/gas', gasRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;