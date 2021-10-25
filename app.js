var express = require("express"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    bodyParser = require("body-parser"),
    LocalStrategy = require("passport-local");

var MongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://user:12345@cluster0.6zwa0.mongodb.net/Credit-Management?retryWrites=true&w=majority";

var app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname+'/public'));


app.use(require("express-session")({
    secret: "Rusty is a dog",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.get("/", function (req, res) {
    res.render("index");
});

//Showing login form
app.get("/login", function (req, res) {
    console.log(req.body);
    res.render("login");
})

app.post("/login", function (req, res) {
    console.log(req.body.username);
    console.log(req.body.password);
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("Credit-Management");
            dbo.collection("Password-Details").findOne({
                username: req.body.username
            }, 
            function(err, result) {
                if (err) throw "Not Found";
                // if(req.body.password)
                if(result==null)
                {
                    console.log("Credentials Not found");
                    res.send("NOT FOUND");
                }
                else if(req.body.password==result["password"])
                {
                    console.log("Verified");
                    console.log(result);
                    res.send("Verified");
                }
                else
                {
                    console.log("Invalid Details");
                    res.redirect("/");
                }
                db.close();
            });
    });
});

app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});

var port = process.env.PORT || 5000;
app.listen(port, function () {
    console.log("Server Has Started!");
});