const express = require("express");
const bodyParser = require("body-parser")

var MongoClient = require('mongodb').MongoClient;
const { Router } = require("express");
var url = "mongodb://localhost:27017/";

const app = express();
app.use(bodyParser.urlencoded({
    extended:true
}));
//variables made global
var username
var password

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/signup.html");
});


app.post("/", function(req, res) {
  var num1 = String(req.body.Username);
  var num2 = String(req.body.Password);
  res.sendFile(__dirname + "/login.html");

  function insertdata() {
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("mydb");
      var myobj = { name: num1, Password: num2, img: '/Users/eriktuft/Desktop/database-pictures/muchcold-1tbom1k.png'};
      dbo.collection("datas").insertOne(myobj, function(err, res) {
        if (err) throw err;
        console.log("1 document inserted");
        
      });
    });
  }
  insertdata()
});

app.get("/a", function(req, res) {
  res.sendFile(__dirname + "/login.html");
});

app.post("/a", function(req, res) {
  username = String(req.body.Username);
  password = String(req.body.Password); // remember to type the two variables lowercase!
  finddata();

  function finddata() {
      MongoClient.connect(url, function(err, db) {
        var dbo = db.db("mydb");
        let loggedin = false
        dbo.collection('datas').find({name: username, Password: password}).forEach(function(doc) {
          loggedin = true;
          console.log('logged in')
          res.redirect('/homepage');
        });

        setTimeout(() => {
          if (loggedin === false) {
            console.log('retry')
            res.sendFile(__dirname + "/login.html");
          }
        }, 1000);
      });
    };
  });

app.listen(8080, function(){
  console.log("server is running on port 8080");
})
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.get('/b', function(req, res) {
  res.sendFile(__dirname + "/index.html")
})
app.get('/homepage', function(req, res) {

  res.sendFile(__dirname + "/complete.html")
})

app.post('/b', function(req, res) {

  var http = require('http');
  var formidable = require('formidable');
  var fs = require('fs');

  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    var oldpath = files.filetoupload.filepath;
    var newpath = '/Users/eriktuft/Desktop/database-pictures/' + files.filetoupload.originalFilename;
    fs.rename(oldpath, newpath, function (err) {
      if (err) throw err;
      res.sendFile(__dirname + "/index.html")
    });
    MongoClient.connect(url, function(err, db) {
      var dbo = db.db("mydb");
      dbo.collection('datas').find({name: username, Password: password}).forEach(function(doc) {
        doc.//method
      });                                                                                                                                                                                 
  })
})                 
})