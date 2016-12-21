var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var metadata = require('./webtask.json');
var request = require('request');
var jwtDecode = require('jwt-decode');
var vars = require('./vars');

const assert = require('assert');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(function (req, res, next) {
  vars.setVars(req);
  next();
});

var errorPage = [
  '<!DOCTYPE html>',
  '<html>',
  '<head>',
  '<title>Change Password</title>',
  '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u"',
  'crossorigin="anonymous">',
  '<body>',
  '<div class="container">',
  '<h4>ERROR OCCURRED</h4>',
  '<br/>',
  'Error occurred processing your request, please see the webtask logs for details',
  '</div>',
  '</body>',
  '</html'
].join('\n');

var forgotPage = [
  '<!DOCTYPE html>',
  '<html>',
  '<head>',
  '<title>Change Password</title>',
  '',
  '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"',
  'integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u"',
  'crossorigin="anonymous">',
  '',
  '<script src="https://code.jquery.com/jquery-3.1.1.min.js"',
  'integrity="sha256-hVVnYaiADRTO2PzUGmuLJr8BLUSjGIZsDYGmIJLv2b8="',
  'crossorigin="anonymous"></script>',
  '',
  '<script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-growl/1.0.0/jquery.bootstrap-growl.min.js"',
  'type="text/javascript"></script>',
  '',
  '<body>',
  '<div class="container">',
  '<h4>Reset Password For Account</h4>',
  '<br/>',
  '<form id="request-change-password" name="request-change-password" method="post" action="change">',
  '<div class="form-group row">',
  '<label class="col-sm-2 col-form-label">Email</label>',
  '<div class="col-sm-4">',
  '<input type="email" class="form-control" name="email" placeholder="Email">',
  '</div>',
  '</div>',
  '<div class="form-group row">',
  '<label class="col-sm-2 col-form-label">Old Password</label>',
  '<div class="col-sm-4">',
  '<input type="text" class="form-control" name="oldPassword" placeholder="Old Password">',
  '</div>',
  '</div>',
  '<div class="form-group row">',
  '<label class="col-sm-2 col-form-label">New Password</label>',
  '<div class="col-sm-4">',
  '<input type="text" class="form-control" name="newPassword" placeholder="New Password">',
  '</div>',
  '</div>',
  '<div class="form-group row">',
  '<label class="col-sm-2 col-form-label">Repeat New Password</label>',
  '<div class="col-sm-4">',
  '<input type="text" class="form-control" name="repeatNewPassword" placeholder="Repeat New Password">',
  '</div>',
  '</div>',
  '<button type="button" id="submitButton" class="btn btn-primary">Continue</button>',
  '</form>',
  '</div>',
  '<script>',
  '',
  'function qs(key) {',
  'key = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&"); // escape RegEx meta chars',
  'var match = location.search.match(new RegExp("[?&]" + key + "=([^&]+)(&|$)"));',
  'return match && decodeURIComponent(match[1].replace(/\\+/g, " "));',
  '}',
  '',
  '$(function() {',
  '',
  '$("#submitButton").click(function () {',
  'console.log("Submitting form..");',
  '$("#request-change-password").submit();',
  '});',
  '',
  '',
  'var errorParam = qs("error");',
  'if (errorParam) {',
  '$.bootstrapGrowl(errorParam, {',
  'ele: "body",',
  'type: "danger", // info, danger, success',
  'offset: {from: "top", amount: 20},',
  'align: "right",',
  'width: 250,',
  'delay: 4000,',
  'allow_dismiss: true,',
  'stackup_spacing: 10',
  '});',
  '}',
  '});',
  '',
  '</script>',
  '</body>',
  '</html>'
].join('\n');

var successPage = [
  '<!DOCTYPE html>',
  '<html>',
  '<head>',
  '<title>Password Successfully Updated</title>',
  '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"',
  'integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u"',
  'crossorigin="anonymous">',
  '<body>',
  '<div class="container">',
  '<br/>',
  '<div class="container">',
  '<div class="jumbotron">',
  '<h1>Password Successfully Updated</h4>',
  '<p>All done.</p>',
  '</div>',
  '</div>',
  '</body>',
  '</html>'
].join('\n');

app.get('/forgot', function (req, res) {
  res.header("Content-Type", 'text/html');
  res.status(200).send(forgotPage);
});

app.post('/change', function (req, res) {

  // console.log(JSON.stringify(vars));

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
      url: 'https://' + vars.AUTH0_DOMAIN + '/oauth/ro',
      headers: {
        'cache-control': 'no-cache',
        'content-type': 'application/json'
      },
      body: {
        client_id: vars.AUTH0_CLIENT_ID,
        username: email,
        password: oldPassword,
        connection: vars.AUTH0_CONNECTION_NAME,
        grant_type: 'password',
        scope: 'openid user_id email'
      },
      json: true
    };
    request(options, function (err, response, body) {
      if (err) {
        console.error(err);
        res.header("Content-Type", 'text/html');
        res.status(500).send(errorPage);
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
          url: 'https://' + vars.AUTH0_DOMAIN + '/api/v2/users/' + userId,
          headers: {
            'cache-control': 'no-cache',
            'content-type': 'application/json',
            authorization: 'Bearer ' + vars.AUTH0_MANAGEMENT_TOKEN
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
            res.status(500).send(errorPage);
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
