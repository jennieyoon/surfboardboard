var express = require('express');
var hbs = require('hbs');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// Setup database
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGOURI, {}, function (error) {
    if (error) {
        console.error('Error connecting to', process.env.MONGOURI);
        console.error(error);
        process.exit(1);
    }
});

var app = express();

// Setup Handlebars as the View Engine.
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Create ability to extend layouts.
var blocks = {};

hbs.registerHelper('extend', function (name, context) {
    var block = blocks[name];
    if (!block) {
        block = blocks[name] = [];
    }

    block.push(context.fn(this));
});

hbs.registerHelper('block', function (name) {
    var val = (blocks[name] || []).join('\n');

    // clear the block
    blocks[name] = [];
    return val;
});

hbs.registerHelper('repeat', function (amount, options) {
    var out = '';
    for (var i = 0; i < amount; i++) {
        out += options.fn(amount[i]);
    }
    return out;
});

hbs.registerHelper('n_minus_repeat', function (n, amount, options) {
    var out = '';
    for (var i = 0; i < n - amount; i++) {
        out += options.fn(amount[i]);
    }
    return out;
});

hbs.registerHelper('if_even', function (conditional, options) {
    if ((conditional % 2) == 0) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

hbs.registerHelper('if_odd', function (conditional, options) {
    if ((conditional % 2) == 1) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

hbs.registerHelper('ifEq', function (v1, v2, options) {
    if (v1 === v2) {
        return options.fn(this);
    }
    return options.inverse(this);
});

// app.use(favicon(path.join(__dirname, 'public', 'img', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var passport = require('passport');
var session = require('express-session');
app.use(session({secret: 'ilovescotchscotchyscotchscotch'})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

var routes = require('./routes/index')(app, passport);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
