var express = require('express');
var mongoose = require('mongoose');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');

var movie_router = require('./routes/movie_router');
var user_router = require('./routes/user_router');
var admin_router = require('./routes/admin_router');
var cinema_router = require('./routes/cinema_router');

var app = express();
// ----------------------------------------------------------------------------------
mongoose.connect('mongodb://localhost/ethiocinema', {useMongoClient: true}, (err) => {
  if (err) console.log('ERROR! COULD NOT CONNECT TO MONGO IN app.js');
  else console.log('MONGOOSE CONNECTED SUCCESSFULLY!');
});
mongoose.Promise = global.Promise;
// ----------------------------------------------------------------------------------

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) { //allow cross origin requests
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

app.use('/user', user_router);
app.use('/admin', admin_router);
app.use('/movie', movie_router);
app.use('/cinema', cinema_router);

// catch 404
app.use(function(req, res, next) {
  res.status(404);
  res.json({success: false, msg: 'route not found!'});
});

module.exports = app;
