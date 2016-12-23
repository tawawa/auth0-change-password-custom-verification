'use strict';

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var metadata = require('./webtask.json');
var request = require('request');
var jwtDecode = require('jwt-decode');
var config = require('./config');

const assert = require('assert');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(function (req, res, next) {
  config.setVars(req);
  next();
});

var errorPage = require('./resources/errorPage');
var forgotPage = require('./resources/forgotPage');
var successPage = require('./resources/successPage');


app.get('/forgot', function (req, res) {
  res.header("Content-Type", 'text/html');
  res.status(200).send(forgotPage);
});

app.post('/change', function (req, res) {

  // console.log(JSON.stringify(config));

  var email = req.body.email;
  var oldPassword = req.body.oldPassword;
  var newPassword = req.body.newPassword;
  var repeatNewPassword = req.body.repeatNewPassword;

  try {
    assert(email);
    assert(oldPassword);
    assert(newPassword);
    assert(repeatNewPassword);
  } catch (e) {
    res.header("Content-Type", 'text/html');
    res.status(200);
    res.redirect('/forgot?error=All fields are mandatory');
    return;
  }
  console.log('email: ' + email);
  console.log('oldPassword: ' + oldPassword);
  console.log('newPassword: ' + newPassword);
  console.log('repeatNewPassword: ' + repeatNewPassword);

  if (newPassword !== repeatNewPassword) {
    res.header("Content-Type", 'text/html');
    res.status(200);
    res.redirect('/forgot?error=New Password and Repeat New Password do not match');
  } else {
    var options = {
      method: 'POST',
      url: 'https://' + config.AUTH0_DOMAIN + '/oauth/ro',
      headers: {
        'cache-control': 'no-cache',
        'content-type': 'application/json'
      },
      body: {
        client_id: config.AUTH0_CLIENT_ID,
        username: email,
        password: oldPassword,
        connection: config.AUTH0_CONNECTION_NAME,
        grant_type: 'password',
        scope: 'openid user_id email'
      },
      json: true
    };
    request(options, function (err, response, body) {
      if (err) {
        console.error(err);
        res.header("Content-Type", 'text/html');
        res.status(200).send(errorPage);
      } else if (response.statusCode !== 200) {
        res.header("Content-Type", 'text/html');
        res.status(200);
        res.redirect('/forgot?error=Incorrect Username (email) or Password');
      } else {
        var decoded = jwtDecode(body.id_token);
        var userId = decoded.user_id;
        console.log('User id: ' + userId);
        var options = {
          method: 'PATCH',
          url: 'https://' + config.AUTH0_DOMAIN + '/api/v2/users/' + userId,
          headers: {
            'cache-control': 'no-cache',
            'content-type': 'application/json',
            authorization: 'Bearer ' + config.AUTH0_MANAGEMENT_TOKEN
          },
          body: {
            password: newPassword
          },
          json: true
        };
        request(options, function (err, response /*, body */) {
          if (err) {
            console.error(err);
            res.header("Content-Type", 'text/html');
            res.status(200).send(errorPage);
          } else if (response.statusCode !== 200) {
            res.header("Content-Type", 'text/html');
            res.status(200);
            res.redirect('/forgot?error=Failed to update new password. Please contact support');
          } else {
            console.log('Password successfully updated!');
            res.header("Content-Type", 'text/html');
            res.status(200).send(successPage);
          }
        });
      }
    });

  }

});

// This endpoint would be called by webtask-gallery to discover your metadata
app.get('/meta', function (req, res) {
  res.status(200).send(metadata);
});

module.exports = app;
