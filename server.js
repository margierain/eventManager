const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')
const config = require('config');
const app = express();

const dbConfig = config.get('dbHost');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: 'application/json' }));

require('./app/routes/')(app);

const port = process.env.PORT || 8080;

mongoose.connect(dbConfig, (err) => {
  if (!err) console.log('connected to db');
});


app.set('superSecret', config.secret);

app.use(morgan('dev'));

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found.');
  err.status = 404;
  next(err);
});


// production error handler
// no stacktraces leaked to user
app.use((err, req, res) => res.status(err.status || 500)
  .send({
    message: err.message,
    error: {}
  }));


app.listen(port, () => {
  console.log(`API running on localhost:${port}`)
})

module.exports = app;