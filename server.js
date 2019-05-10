'use strict';

var express = require('express');
var mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dns = require('dns')
var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });

mongoose.Promise = require('bluebird');

const db = mongoose.connection
const Schema = mongoose.Schema;

const urlSchema = new Schema({
  original_url: String,
  short_url: String
})
const ShortUrl = mongoose.model('ShortUrl', urlSchema)

app.use(cors());
app.use(bodyParser.json());
/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.post("/api/shorturl/new", bodyParser.urlencoded({extended:false}), (req, res) => {
 let url = req.body.url.replace(/https?:\/\//, "");
 dns.lookup(url, (err, add, fam) => {
    if (err) {
      res.json({"error": "invalid url"});
    } else  {
      let num = Math.ceil(Math.random()*1000);
      const obj = new ShortUrl({original_url: req.body.url, short_url:String(num)})
      obj.save((err,data) => {
        if (err) { res.send("Error saving to database")}
      })
      res.json({original_url: req.body.url, short_url:String(num)})
      
      
  }
  })
  
})

app.get("/api/shorturl/:id", (req,res) => {
  ShortUrl.findOne({short_url: req.params.id}, (err, data) => {
    if (data) {
      let url = data.original_url
      let newUrl = url.match(/https?:\/\//) ? url : "https://" + url
      res.redirect(newUrl);
    } else {
      res.send("URL not found")
      
    }
  })
});
 
  



app.listen(port, function () {
  console.log('Node.js listening ...');
});
