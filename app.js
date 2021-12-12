const express = require("express");
const bodyParser = require("body-parser");

var MongoClient = require("mongodb").MongoClient;
const { Router } = require("express");
var url = "mongodb://localhost:27017/";

const mongoose = require("mongoose");
const { URLSearchParams } = require("url");
mongoose.connect("mongodb://localhost:27017/mydb", { useNewUrlParser: true });

const Schema = mongoose.Schema;
const UserSchema = new Schema({
  name: String,
  img: String,
});
const Model = mongoose.model;
const User = Model("datas", UserSchema);
const app = express();
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.set("view engine", "ejs");

app.use(express.static("public"));

//variables made global but ingore block scope
var username;
var password;
var userobj;
var inroom;
var insertdata;
var signupuser;
var signuppass;

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const { captureRejectionSymbol } = require("stream");
const io = new Server(server);

MongoClient.connect(url, function (err, db) {
  var dbo = db.db("mydb");
  insertdata = function () {
    var myobj = {
      name: signupuser,
      Password: signuppass,
      img: "/muchcold-1tbom1k.png",
    };
    dbo.collection("datas").insertOne(myobj, function (err, res) {
      if (err) throw err;
      console.log("1 document inserted");
    });
  };
  app.post("/a", function (req, res) {
    username = String(req.body.Username);
    password = String(req.body.Password); // remember to type the two variables lowercase!
    function finddata() {
      let loggedin = false;
      dbo.collection("datas").find({ name: username, Password: password }).forEach(function (doc) {
          loggedin = true;
          console.log("logged in");
          userobj = doc;
          //send data to client which will store the data in session storage
          res.redirect("/homepage");
        });

      setTimeout(() => {
        if (loggedin === false) {
          console.log("retry");
          res.sendFile(__dirname + "/login.html");
        }
      }, 1000);
    }
    finddata();
  });
  io.on("connection", (socket) => {
    socket.on("chat message", (msg, room) => {
      msgobj = { message: msg };
      dbo.collection(room).insertOne(msgobj, function (err, res) {
        console.log("message added to db");
      });
      io.emit(room, msg);
    });
    socket.on("newroom", (roomname) => {
      dbo.createCollection(roomname, function (err, res) {
        console.log(roomname + " Collection created!");
      });
      let colnameobj = {name: roomname}
      dbo.collection('colnames').insertOne(colnameobj)
      io.emit("showroom", roomname);
    });
    socket.on("loadfromdb", (room, id) => {
      console.log(id);
      dbo.collection(room).find().forEach(function (doc) {
          io.emit("msg" + id, doc); // ultimatly wanted to send collection as obj the ireterate but im too lazy, please do later
        });
    });
    socket.on("loadrooms", (id) => {
      dbo.collection('colnames').find().forEach(function (doc) {
        io.emit("room" + id, doc); 
      });
    });
  });
});

server.listen(8080, function () {
  console.log("server is running on port 8080");
});

app.get("/homepage", function (req, res) {
  res.render(__dirname + "/home.ejs");
});

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/signup.html");
});

app.post("/", function (req, res) {
  signupuser = String(req.body.Username);
  signuppass = String(req.body.Password);
  res.sendFile(__dirname + "/login.html");

  insertdata();
});

app.get("/a", function (req, res) {
  res.sendFile(__dirname + "/login.html");
});

app.get("/b", function (req, res) {
  res.render(__dirname + "/profile.ejs", { userobj });
});

app.post("/b", function (req, res) {
  var formidable = require("formidable");
  var fs = require("fs");
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    var oldpath = files.filetoupload.filepath;
    var newpath =
      "/Users/eriktuft/Desktop/untitled folder/public/" +
      files.filetoupload.originalFilename;
    var imgname = files.filetoupload.originalFilename;
    console.log(imgname);
    User.updateOne({ name: username }, { img: imgname }, (err, res) => {
      console.log("Updated");
    });
    fs.rename(oldpath, newpath, function (err) {
      if (err) throw err;
      res.redirect("/b");
    });
  });
});
