var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var expressSession = require("express-session");
var MongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://user:12345@cluster0.6zwa0.mongodb.net/Credit-Management?retryWrites=true&w=majority";

// setting views and public folder for css, images, and js access
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));

// setting up body parser to get login details filled by user
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSession({
    secret: "Rusty is a dog",
    resave: false,
    saveUninitialized: false
}));

// Setting up the logic of authentication and display page
app.get("/", function (req, res) {
    res.render("index");
});

app.get("/login", function (req, res) {
    console.log(req.body);
    res.render("login");
})

app.post("/login", function (req, res) {
    console.log("Username filled:", req.body.username);
    console.log("Password filled:", req.body.password);
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("Credit-Management");
        dbo.collection("Password-Details").findOne({ username: req.body.username }, function (err, result) {
            if (err) throw "Not Found";
            if (result == null) {
                console.log("Credentials Not found");
                res.send("NOT FOUND");
            }
            else if (req.body.password == result["password"]) {
                console.log("Verified");
                console.log(result);
                res.send("Verified");
            }
            else {
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


// Setting up the port and making it listen to requests
var port = process.env.PORT || 5000;
app.listen(port, function () {
    console.log("Server started on port:", port);
});