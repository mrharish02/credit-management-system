// TO RUN THE FILE RUN COMMAND - node connect.js

// ----------------------------------------------------------
/*
CONNECTING TO WEBSITE

FIRST INSTLL NPM HTTP PACKAGE USING npm install http
*/

// var http = require("http");
// var server = http.createServer((function (req, res) {
//     res.writeHead(200, { "Content-Type": "text/plain" });
//     res.end("Hello world\n");
// }));

// PORT = 7000;
// HOST = '127.0.0.1';
// server.listen(PORT, HOST, function () {
//     console.log("Server running at http://%s:%s/", HOST, PORT);
// });
// ----------------------------------------------------------

// ----------------------------------------------------------
/*
MYSQL CONNECTION

FIRST INSTLL NPM MYSQL PACKAGE USING npm install mysql
RUN MYSQL ON YOUR PC
    WINDOWS : USING XAMPP
    LINUX :  RUN /opt/lampp/lampp startmysql
*/

// var mysql = require("mysql");
// var conn = mysql.createConnection({
//     host: "localhost", // Replace with your host name
//     user: "root", // Replace with your database username
//     password: "", // Replace with your database password
//     database: "credit_management", // // Replace with your database Name
// });
// conn.connect(function (err) {
//     if (err) throw err;
//     console.log("Database is connected successfully !");
// });
// module.exports = conn;
// ----------------------------------------------------------

// ----------------------------------------------------------
/*
MONGODB CONNECTION

FIRST INSTLL NPM MONGODB PACKAGE USING npm install mongodb
RUN MONGODB ON YOUR PC
    LINUX :  RUN 
            1)sudo systemctl start mongodbl
            2)sudo systemctl status mongodb;
*/

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var databaseName = "Credit_Management";
var collectionName = "Students";

MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db(databaseName);
    var myobj = { name: "Company Inc", address: "Highway 37" };
    dbo.collection(collectionName).insertOne(myobj, function (err, res) {
        if (err) throw err;
        console.log("1 document inserted");
        db.close();
    });
});

// MongoClient.connect(url, function (err, db) {
//     if (err) throw err;
//     var dbo = db.db(databaseName);
//     var myobj = [
////        just for reference(TO BE CHANGED)
//         { mame: 'Jonn', address: 'Highway 71' },
//         { name: 'Peter', address: 'Lowstreet 4' }
//     ];

//     dbo.collection(collectionName).insertMany(myobj, function (err, res) {
//         if (err) throw err;
//         console.log("Number of documents inserted:" + res.insertedCount);
//         db.close();
//     });
// });
// ----------------------------------------------------------
