
var MongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://user:12345@cluster0.6zwa0.mongodb.net/Credit-Management?retryWrites=true&w=majority";


MongoClient.connect(url,function(err,db){
    if (err) throw err;
    var dbo = db.db("Credit-Management");

    const loginData = require("./LOGIN_DATA");
    const courseData = require('./COURSE_DATA');

    dbo.collection("Password-Details").insertMany(loginData, function(err,res){
        if (err) throw err;
        console.log("Collection items created");
        console.log("Number of documents inserted: "+res.insertedCount);
        db.close();
    });

    dbo.collection("Course-Details").insertMany(courseData, function(err,res){
        if (err) throw err;
        console.log("Collection items created");
        console.log("Number of documents inserted: "+res.insertedCount);
        db.close();
    });

});

