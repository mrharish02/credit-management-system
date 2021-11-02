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
        dbo.collection("Password-Details").findOne({ _id: req.body.username }, function (err, result) {
            if (err) throw "Not Found";
            if (result == null) {
                console.log("Credentials Not found");
                res.send("NOT FOUND");
            }
            else if (req.body.password == result["PASSWORD"]) {
                console.log("Verified");
                console.log(result);
                res.redirect("/courses");
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


// Setting up the logic for displaying courses

var courseIndex = 0;
var courseSelected = [];
var courseDisplay = [];

app.get("/courses", function (req, res) {

    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("Credit-Management");
        dbo.collection("Course-Details").find().toArray(function (err, result) {

            courseDisplay = result.slice(courseIndex, courseIndex + 10);
            db.close();
            res.render("courses", { courseDisplay: courseDisplay, courseChosen: courseSelected });

        });
    });

    // res.render("courses", {courseDisplay : courseDisplay});


})


app.post("/courses", function (req, res) {

    console.log("Add or drop: " + req.body.add_drop);
    console.log("selected to add: " + req.body.selected_to_add);
    console.log("Selected to drop: " + req.body.selected_to_drop);

    // logic for showing next and previous page courses
    if (req.body.change == "prev") {

        courseIndex = courseIndex - 10;

    }
    else if (req.body.change == "next") {

        courseIndex = courseIndex + 10;

    }

    // logic for adding and dropping courses
    if (req.body.add_drop == "Add") {
        check = req.body.selected_to_add;

        for (var i = 0; i < check.length; i++) {

            courseSelected.push(courseDisplay[Number(check[i])]);

        }
    }

    else if (req.body.add_drop == "drop") {
        check = req.body.selected_to_drop;

        // console.log(check);

        if (typeof (check) != 'string') {
            for (var i = 0; i < check.length; i++) {
                for (var j = 0; j < courseSelected.length; j++) {
                
                    if (courseSelected[j]._id === check[i]) {

                        courseSelected.splice(j, 1);

                    }
                }
            }
        } else if (typeof (check) == 'string') {

            for (var j = 0; j < courseSelected.length; j++) {

                if (courseSelected[j]._id === check) {

                    courseSelected.splice(j, 1);

                }
            }
        }
    }

    console.log("Selected Courses: " + courseSelected);
    console.log("------------");
    res.redirect("/courses");

});



// Setting up the port and making it listen to requests
var port = process.env.PORT || 5000;
app.listen(port, function () {
    console.log("Server started on port:", port);
});