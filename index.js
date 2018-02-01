'use strict';


// DB connection
var mongoose = require('mongoose');
const DB_NAME = "cairo";
mongoose.connect('mongodb://localhost/' + DB_NAME);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB!')
});

// Load models
const models = require('./model')
var UserModel = db.model('User'),
  SensorSampleModel = db.model('SensorSample'),
  SensorConfModel = db.model('SensorConf'),
  ActivityModel = db.model('Activity');

// Express app
var https = require('https');
var fs = require('fs');
var express = require('express'),
  bodyParser = require('body-parser'),
  app = express(),
  port = process.env.PORT || 3000;

  
var sslOptions = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
  passphrase: String(fs.readFileSync('passphrase.txt'))
};

var secret = String(fs.readFileSync('secret.txt'));

app.use(bodyParser.json());




// Factory GET and POST functions to replicate the same behavior with all the mongoose models
function setFactory(url, model){
  app.post(url, function(req, res, next) {
    authenticateRequest(req, function(authenticated){
      if(!authenticated)
      {
        res.status(500).send({success: false});
        return;
      }
      let data = new model(req.body);
      data.save(function(err, dataObject){  
        if (err) {
            res.status(500).send({success: false});
        }
        res.status(200).send(dataObject);
      });
    });
  });

}

function readFactory(url, model){
  app.post(url+':offset?/:limit?', function(req, res, next) {
    authenticateRequest(req, function(authenticated){
      if(!authenticated)
      {
        res.status(500).send({success: false});
        return;
      }

      var offset = !(req.params.offset) ? 0:parseInt(req.params.offset);
      var limit = !(req.params.limit) ? 0:parseInt(req.params.limit);


      model.find(function(err, samples){  
        if (err) {
            res.status(500).send({success: false});
        }
        res.status(200).send(samples);
      }).skip(offset).limit(limit);
    });
  });
}


// Authentication
app.post('/user/', function(req, res, next){
  if(req.body.secret != secret){
    res.status(500).send({success: false});
    next();
    return;
  }

  let user = new UserModel(req.body);
  user.save(function(err, dataObject){  
    if (err) {
        res.status(500).send({success: false});
    }
    res.status(200).send({success: true, user: dataObject._id, token: dataObject.token});
  });
});

function authenticateRequest(req, next){
  let user = UserModel.findById(req.body.user, function(err, user){
    if(err || !user){
      next(false);
      return;
    }
    next(user.token == req.body.token);
  });
}

readFactory('/users/', UserModel)

// Data getters and setters

setFactory('/sample/', SensorSampleModel)
readFactory('/samples/', SensorSampleModel)

setFactory('/config/', SensorConfModel)
readFactory('/configs/', SensorConfModel)

setFactory('/activity/', ActivityModel)
readFactory('/activities/', ActivityModel)



// RUN
// app.listen(port);
https.createServer(sslOptions, app).listen(port);


console.log('Cairo REST Data Server running in port '+port)