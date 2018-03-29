'use strict';


// DB connection
var MongoClient = require('mongodb').MongoClient;
const DB_NAME = "cairo";
var DBURL = 'mongodb://localhost/' + DB_NAME;

var dbo;

MongoClient.connect(DBURL, function(err, db) {
  if (err) throw err;
  dbo = db.db("cairo");
  console.log("Connected to MongoDB");
});
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



app.post('/echo/', function(req, res, next) {
  console.log(req.body)
  res.status(200).send(req.body);
  return
});

app.post('/samples/:user/', function(req, res, next) {
  let user = req.params.user.toLowerCase()
  dbo.collection(user).insert(req.body, function(err, result) {
      if (err) {
        res.status(200).send({success: false, message: err});
        console.log(err)
        return
      }
      console.log("Documents inserted");
      res.status(200).send({success: true});
    });
  return
});

app.get('/samples/:user/', function(req, res, next){
  let user = req.params.user.toLowerCase()

  dbo.collection(user).find().toArray(function(err, results){
    res.status(200).send(results);
  });
});



// RUN
https.createServer(sslOptions, app).listen(port);


console.log('Cairo REST Data Server running in port '+port);
