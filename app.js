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

var courseIndex = 0;
var courseSelected = [];
var courseDisplay = [];
var username = ""
var person_name = ""
var initial_num_of_courses = 0;
var message = ""
var message_password = "Update your password"


// Setting up the logic of authentication and display page
app.get("/", function (req, res) {
    res.render("index");
});

app.get("/login", function (req, res) {
    console.log(req.body);
    res.render("login");
})

app.get("/changePassword", function (req, res) {
    if (username != ""){
        res.render("change-password", { message_password: "Update your Password" });
    } else {
        res.render("index");
    }
})

app.post("/changePassword", function (req, res) {
    newPassword = req.body.newPassword;
    confirmPassword = req.body.confirmPassword;
    buttonPressed = req.body.submit;

    console.log(req.body)

    if (buttonPressed === "login") {
        res.redirect("/")
    } else if (buttonPressed === "change") {

        if (newPassword === confirmPassword) {
            console.log("can change")
            MongoClient.connect(url, function (err, db) {
                if (err) throw err;
                var dbo = db.db("Credit-Management");
                dbo.collection("Password-Details").updateOne({ _id: username }, {$set: {PASSWORD:newPassword} }, function (err, res) {
                    if (err) throw err;
                    console.log(res);
                    db.close();
                }); 
            });
            message_password = "Password changed!";

        } else {
            message_password = "Passwords don't match";
        }
        res.render("change-password",{message_password:message_password});
    }

});

function fetchSelectedCourses(username) {
    console.log(username)
    username = String(username);
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("Credit-Management");
        dbo.collection("Student-Course-Info").findOne({ _id: username }, function (err, result) {
            if (err) throw "Not Found";
            if (result != null) {
                var courses = result["Selected_Courses"];
                for (var i = 0; i < courses.length; i++)
                    courseSelected.push(courses[i]);
                initial_num_of_courses = courses.length;
            }
            db.close();
        });
    });
}



app.post("/login", function (req, res) {

    console.log("Username filled:", req.body.username);
    console.log("Password filled:", req.body.password);

    buttonPressed = req.body.submit

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

                if (buttonPressed === "login") {

                    console.log("Verified");
                    console.log(result);
                    courseSelected = [];
                    message = "";
                    fetchSelectedCourses(req.body.username);
                    username = req.body.username;
                    person_name = result["NAME"];
                    res.redirect("/courses");

                } else if (buttonPressed === "change-password") {
                    username = req.body.username;
                    res.redirect("/changePassword");
                }
            }
            else {
                console.log("Invalid Details");
                res.redirect("/");
            }
            db.close();
        });
    });
});


app.post("/logout", function (req, res) {
    console.log("Logging out");
    res.redirect("/");
});


// Setting up the logic for displaying courses


app.get("/courses", function (req, res) {
    if (username != "") {

        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            var dbo = db.db("Credit-Management");
            dbo.collection("Course-Details").find().toArray(function (err, result) {

                courseDisplay = result.slice(courseIndex, courseIndex + 10);
                db.close();
                res.render("courses", { courseDisplay: courseDisplay, courseChosen: courseSelected, name: person_name, message: message });

            });
        });
    }
    else {
        res.render("index");
    }
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
        if (check != null) {
            for (var i = 0; i < check.length; i++) {
                var p = true;
                if (courseSelected != null) {
                    for (var j = 0; j < courseSelected.length; j++) {
                        if (courseSelected[j]["_id"] == courseDisplay[Number(check[i])]["_id"]) {
                            p = false;
                            break;
                        }
                    }
                }
                console.log(p);
                if (p == true) {
                    courseSelected.push(courseDisplay[Number(check[i])]);
                }
            }
        }
    }

    else if (req.body.add_drop == "drop") {
        check = req.body.selected_to_drop;

        if (check != null) {
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
    }

    else if (req.body.submit == "submit") {
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            var dbo = db.db("Credit-Management");
            var total_credits = Number(0);
            for (var i = 0; i < courseSelected.length; i++) {
                total_credits += Number(courseSelected[i].CREDITS);
            }
            console.log(total_credits);
            if (total_credits <= 23) {
                if (initial_num_of_courses != 0) {
                    var newvalues = { $set: { Selected_Courses: courseSelected } };
                    dbo.collection("Student-Course-Info").updateOne({ _id: username }, newvalues, function (err, res) {
                        if (err) throw err;
                        console.log(res);
                        db.close();
                    });
                    message = "Courses Updated Successfully!";
                }
                else {
                    var newvalues = [
                        {
                            "_id": username,
                            "Selected_Courses": courseSelected
                        }
                    ]
                    var dbo = db.db("Credit-Management");
                    var p = false;
                    dbo.collection("Student-Course-Info").findOne({ _id: username }, function (err, result) {
                        if (err) throw "Not Found";
                        if (result != null) {
                            console.log("Hello");
                            var newvalues = { $set: { Selected_Courses: courseSelected } };
                            dbo.collection("Student-Course-Info").updateOne({ _id: username }, newvalues, function (err, res) {
                                if (err) throw err;
                                console.log(res);
                                db.close();
                            });
                            p = true;
                            message = "Courses Updated Successfully!";
                        }
                    });
                    if (p == false) {
                        dbo.collection("Student-Course-Info").insertMany(newvalues, function (err, res) {
                            if (err) throw err;
                            console.log(res);
                            initial_num_of_courses = courseSelected.length;
                            db.close();
                        });
                        message = "Courses Inserted Successfully!";
                    }
                    else
                        db.close();
                }
            }
            else
                message = "You can add upto 23 credits only.";

        });
    }
    console.log("Selected Courses: " + courseSelected);
    console.log("------------");
    res.redirect("/courses");

});



// Setting up the port and making it listen to requests
var port = process.env.PORT || 5000;
app.listen(port, function () {
    console.log("Server started at: http://localhost:" + String(port) + "/");
});