const express = require("express");
const bodyParser = require("body-parser")

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
  
// New app using express module
const app = express();
app.use(bodyParser.urlencoded({
    extended:true
}));
  
app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});


app.post("/", function(req, res) {
  var num1 = String(req.body.Username);
  var num2 = String(req.body.Password);
  res.sendFile(__dirname + "/login.html");

  function insertdata() {
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("mydb");
      var myobj = { name: num1, Password: num2};
      dbo.collection("datas").insertOne(myobj, function(err, res) {
        if (err) throw err;
        console.log("1 document inserted");
        db.close();
      });
    });
  }
  insertdata()
});

app.get("/a", function(req, res) {
  res.sendFile(__dirname + "/login.html");
});

app.post("/a", function(req, res) {
  var num1 = String(req.body.Username);
  var num2 = String(req.body.Password);
  finddata();

  function finddata() {
      MongoClient.connect(url, function(err, db) {
        var dbo = db.db("mydb");
        let loggedin = false
        dbo.collection('datas').find({name: num1}).forEach(function(doc) {
          loggedin = true;
          res.sendFile(__dirname + "/complete.html");
        });
        if (loggedin === false) {
          res.sendFile(__dirname + "/login.html");
        }
      });
    };
  });

app.listen(8080, function(){
  console.log("server is running on port 8080");
})


