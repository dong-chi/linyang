var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var defaults = require('./config/initParams')
var _ = require('lodash')
var createTemplateEngine = require('./unit/createTemplateEngine')
var routes = require('./routes/route')
var urlSettings = require('./config/app.setting')
var restApi = require('./routes/rest')

var app = express();

var viewPath = path.join(__dirname, './static/View')
var templateSettings = {
    rootPath: viewPath,
    debug: false,
    paths: {},
    defaults: _.extend({}, defaults,urlSettings),
    extname: '.html',
}
//app.engine('ejs', require('ejs-mate'));
app.engine('html', createTemplateEngine(templateSettings))
// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'ejs');
app.set('views', viewPath)
app.set('view engine', 'html')


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//app.use(express.static(path.join(__dirname, 'public')));

//app.use(require('./routes/index'));
app.use('/resource', express.static(path.join(__dirname, './static/resource')))
app.use('/css', express.static(path.join(__dirname, './css')))
app.use('/src', express.static(path.join(__dirname, './src')))
//接口
app.use('/login', restApi.login);
app.use('/registered', restApi.registered);
app.use('/getDepartInfo', restApi.getDepartInfo);
app.use('/getUsers', restApi.getUsers);
//
app.use('/', routes)



// catch 404 and forward to error handle
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});



module.exports = app;
