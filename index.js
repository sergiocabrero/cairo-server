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

// Load moongose
const models = require('./model')
var UserModel = db.model('User'),
  SensorSampleModel = db.model('SensorSample'),
  SensorConfModel = db.model('SensorConf'),
  ActivityModel = db.model('Activity'), 
  BeaconModel = db.model('Beacon');

// Express app
var https = require('https');
var fs = require('fs');
var express = require('express'),
  bodyParser = require('body-parser'),
  app = express(),
  port = process.env.PORT || 3000;

// parse requests with json content
app.use(bodyParser.json());



// certbot
/*
// This is needed to validate the certificate with certbot, together with creating the route static/.well-known/acme-challenge
app.use(express.static('static'));
app.listen(80);
*/

// sslOptions once certificates have been obtained, using: sudo certbot certonly --webroot -w ./static -d <domain>

var sslOptions = {
  cert: fs.readFileSync('/etc/letsencrypt/live/cairoapp.5gnetwork-cwi.surf-hosted.nl/fullchain.pem'),
  key: fs.readFileSync('/etc/letsencrypt/live/cairoapp.5gnetwork-cwi.surf-hosted.nl/privkey.pem')
};


// self-signed certs (use generateServerCertificate.sh)
// var sslOptions = {
//   key: fs.readFileSync('key.pem'),
//   cert: fs.readFileSync('cert.pem'),
//   passphrase: String(fs.readFileSync('passphrase.txt'))
// };





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
function checkUserToken(token){
  const tokensfile = 'usertokens.txt'
  try {
    // read tokens
    var allowed_tokens = String(fs.readFileSync(tokensfile)).split('\n');
    // is token?
    const i = allowed_tokens.indexOf(token);
    if(i == -1) return false;
    // remove (one use only)
    allowed_tokens.splice(i,1)
    // rewrite file without the used token
    fs.writeFile(tokensfile, allowed_tokens.join('\n'), (err) => {  
      if (err) throw err;
      console.log('Tokens saved!');
    });

    return true;
  }
  catch(err){ return false }  // no auth if something goes wrong
}

app.post('/user/:token/', function(req, res, next){
  if(!checkUserToken(req.params.token)){
      res.status(401).send({success: false});
      next();
      return;
  }
  
  let user = new UserModel(req.body);
  user.save(function(err, dataObject){  
    if (err) {
        res.status(401).send({success: false});
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

// readFactory('/users/', UserModel);

// Data getters and setters

// setFactory('/sample/', SensorSampleModel);
// readFactory('/samples/', SensorSampleModel);

// setFactory('/config/', SensorConfModel);
// readFactory('/configs/', SensorConfModel);

// setFactory('/activity/', ActivityModel);
// readFactory('/activities/', ActivityModel);

// setFactory('/beacon/', BeaconModel);
// readFactory('/beacon/', BeaconModel);

// used for testing: 

app.post('/echo/', function(req, res, next) {
  // authenticateRequest(req, function(authenticated){
  //   if(!authenticated)
  //   {
  //     res.status(500).send({success: false});
  //     return;
  //   }


  console.log(req.body)
  res.status(200).send(req.body);
  return
});

app.post('/samples/:user/', function(req, res, next) {
  console.log(req.body)
  console.log(req.param.user)
  res.status(200).send({success=true});
  return
});




// RUN
https.createServer(sslOptions, app).listen(port);


console.log('Cairo REST Data Server running in port '+port);
