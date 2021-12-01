const express = require("express");
const bodyParser = require("body-parser")

var MongoClient = require('mongodb').MongoClient;
const { Router } = require("express");
var url = "mongodb://localhost:27017/";

const mongoose = require('mongoose'); //PLEASE CHANGE everything to mongoose standard
const { URLSearchParams } = require("url");
mongoose.connect('mongodb://localhost:27017/mydb', {useNewUrlParser: true});

const Schema = mongoose.Schema
const BookSchema = new Schema({
  name : String,
  color: String,
  img: String
})
const Model = mongoose.model
const Book = Model('datas',BookSchema)


const app = express();
app.use(bodyParser.urlencoded({
    extended:true
}));

app.set('view engine', 'ejs');

app.use( express.static( "public" ) );

//variables made global
var username
var password

//socket.io code
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/c', (req, res) => {
  res.sendFile(__dirname + '/test.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');
});
//end
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
      var myobj = { name: num1, Password: num2, img: '/muchcold-1tbom1k.png'};
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



app.get('/b', function(req, res) {
  var user
  Book.findOne({name: username},(err,result)=>{
    user = result

  })
  setTimeout(() => {
    res.render(__dirname + "/profile.ejs", {user})
  }, 1000);
})
app.get('/homepage', function(req, res) {

  res.sendFile(__dirname + "/complete.html")
})

app.post('/b', function(req, res) {

  // var http = require('http');
  var formidable = require('formidable');
  var fs = require('fs');

  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    var oldpath = files.filetoupload.filepath;
    var newpath = '/Users/XXX/Desktop/untitled folder/public/' + files.filetoupload.originalFilename;
    var imgname = files.filetoupload.originalFilename;
    console.log(imgname)
    Book.updateOne({name: username},{img: imgname},(err,res)=>{
      console.log('Updated');
    })
    fs.rename(oldpath, newpath, function (err) {
      if (err) throw err;
      res.redirect('/b')
    });
  })                 
})
