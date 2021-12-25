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
  bio: String,
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
var insertdata;
var signupuser;
var signuppass;

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const { captureRejectionSymbol } = require("stream");
const { name } = require("ejs");
const { profile } = require("console");
const io = new Server(server);

MongoClient.connect(url, function (err, db) {
  var dbo = db.db("mydb");
  app.post("/signup", function (req, res) {
    signupuser = String(req.body.Username);
    signuppass = String(req.body.Password);
    insertdata = function () {
      let bool = true
        dbo.collection('datas').find({name: signupuser}).forEach(function (doc) {
          if (doc.name === signupuser) {
            bool = false
          }
        });
        setTimeout(() => {
          if (bool === true) {
            var myobj = {
              name: signupuser,
              Password: signuppass,
              img: "/muchcold-1tbom1k.png",
              bio: "Default Doge enjoyer"
            };
            dbo.collection("datas").insertOne(myobj, function (err, res) {
              if (err) throw err;
              console.log("1 document inserted");
            });
            res.redirect('/a')
          }else {
            res.redirect('/signup')
          }
        }, 250);
    };
    insertdata();
  });
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
          res.redirect('/a');
        }
      }, 250); //gotta learn async functions this will break my app some time later...
    }
    finddata();
  });
  io.on("connection", (socket) => {
    socket.on("chat message", (nameuser, msg, room) => {
      msgobj = { message: msg, name: nameuser};
      dbo.collection(room).insertOne(msgobj, function (err, res) {
        console.log("message added to db");
      });
      io.emit(room, msgobj);
    });
    socket.on("newroom", (roomname) => {
      let bool = true
      dbo.collection('colnames').find({name: roomname}).forEach(function (doc) {
        if (doc.name === roomname) {
          bool = false
        }
      })
      setTimeout(() => {
        if (bool === true) {
          dbo.createCollection(roomname, function (err, res) {
            console.log(roomname + " Collection created!");
          });
          let colnameobj = {name: roomname}
          dbo.collection('colnames').insertOne(colnameobj)
          io.emit("showroom", roomname);
        }
      }, 500);
    });
    socket.on("loadfromdb", (room, id) => {
      dbo.collection(room).find().forEach(function (doc) {
          io.emit("msg" + id, doc); // ultimatly wanted to send collection as obj the ireterate but im too lazy, please do later
      })
    });
    socket.on("loadrooms", (id) => {
      dbo.collection('colnames').find().forEach(function (doc) {
        io.emit("room" + id, doc); 
      });
    });
    socket.on('requser', (id) => {
      io.emit('userobj' + id, userobj)
    });
    socket.on('savebio', (data, nm) => {
      User.updateOne({ name: nm }, { bio: data }, (err, res) => {
        dbo.collection("datas").findOne({name: nm}, function(err, result) {
          console.log(result)
          io.emit('userobj', result)        
        });
      });
    })
    socket.on('userprofile', (name, id) => {
      dbo.collection("datas").find({ name: name}).forEach(function (doc) {
        io.emit('userprofiledata' + id, doc.bio)
      });
    })
    socket.on("newdmroom", (dmname, otheruser) => {
      var bool = true
      var bool2 = false
      if (dmname !== otheruser) {
        dbo.collection('coldmnames').find({name: dmname + ' and ' + otheruser}).forEach(function (doc) {
          if (doc.name === dmname + ' and ' + otheruser) {
            console.log('retry')
            bool = false
          }
        })
        dbo.collection('datas').find().forEach(function (doc) {
          if (dmname === doc.name) {
            bool2 = true
          }
        })
        setTimeout(() => {
          console.log(bool2)
          if (bool === true && bool2 === true) {
            dbo.createCollection(dmname + ' and ' + otheruser, function (err, res) {
              console.log(dmname + " Collection created!");
            });
            let colnameobj = {name: dmname + ' and ' + otheruser, user1: dmname, user2: otheruser}
            dbo.collection('coldmnames').insertOne(colnameobj)
            io.emit(dmname, colnameobj.name);
            io.emit(otheruser, colnameobj.name);
          }          
        }, 500);
      }
    })
    socket.on("loaddmrooms", (id) => {
      dbo.collection('coldmnames').find().forEach(function (doc) {
        if (doc.user1 === id) {
          io.emit("room" + id, doc.name); 
        }
        if (doc.user2 === id) {
          io.emit("room" + id, doc.name); 
        }
      });
    });
  });
});
app.get('/userprofile', function (req, res) {
  res.sendFile(__dirname + "/userprofile.html")
})
server.listen(8080, function () {
  console.log("server is running on port 8080");
});
app.get("/homepage", function (req, res) {
  res.sendFile(__dirname + "/home.html");
});
app.get("/signup", function (req, res) {
  res.sendFile(__dirname + "/signup.html");
});

app.get("/a", function (req, res) {
  res.sendFile(__dirname + "/login.html");
});

app.get("/Profile", function (req, res) {
  res.sendFile(__dirname + "/profile.html", {});
});

app.get("/homedm", function (req, res) {
  res.sendFile(__dirname + "/homedm.html", {});
});

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/bubbapp.html");
});

