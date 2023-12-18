const mysql = require('mysql2');
const express = require('express');
const https = require('https');
const fs = require('fs');
const { createHash } = require('crypto');
require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');

var key = fs.readFileSync('selfsigned.key');
var cert = fs.readFileSync('selfsigned.crt');
var options = {
    key: key,
    cert: cert
};

const app = express();
app.use(cors());
app.use(bodyParser.json());
const port = 3001;

const connection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DB,
    multipleStatements: true
}).promise();

app.post('/new', async (req, res) => {
    enrollmentID = createHash('sha256').update(req.body.name + req.body.age + req.body.email + req.body.phoneNumber + req.body.address + req.body.pincode).digest('hex');
    var query = "INSERT INTO user (enrollmentID, name, age, email, phoneNumber, address, pincode, batch, next_batch) VALUES ('" + enrollmentID + "', '" + req.body.name + "', '" + req.body.age + "', '" + req.body.email + "', '" + req.body.phoneNumber + "', '" + req.body.address + "', '" + req.body.pincode + "', '" + req.body.batch + "', '" + req.body.batch + "')";
    var query2 = "INSERT INTO payments (enrollmentID, payDue, startingDate) VALUES ('" + enrollmentID + "', true, '" + new Date().toISOString() + "')";
    var query3 = "INSERT INTO enrollment (phoneNumber, enrollmentID) VALUES ('" + req.body.phoneNumber + "', '" + enrollmentID + "')";

    await connection.query(query + ";" + query2 + ";" + query3 + ";")
        .then((data) => {
            res.send({
                "enrollmentID": enrollmentID
            });
        })
        .catch((err) => {
            res.send({
                "error": err
            });
        });
});

app.post('/pay', async (req, res) => {
    var query = "SELECT payDue FROM payments WHERE enrollmentID = '" + req.body.enrollmentID + "';";
    await connection.query(query)
        .then(async (data) => {
            if (data[0][0] === undefined) {
                throw "No such enrollmentID";
            }
            query = "UPDATE payments SET payDue = '0' WHERE enrollmentID = '" + req.body.enrollmentID + "';";

            await connection.query(query)
                .then((data) => {
                    res.send({
                        "success": 1
                    });
                })
                .catch((err) => {
                    res.send({
                        "error": err
                    });
                });
        })
        .catch((err) => {
            res.send({
                "error": err
            });
        });
});

app.post('/change', async (req, res) => {
    console.log("change");
    var query = "UPDATE user SET next_batch = '" + req.body.batch + "' WHERE enrollmentID = '" + req.body.enrollmentID + "';";

    await connection.query(query)
        .then((data) => {
            res.send({
                "success": 1
            });
        })
        .catch((err) => {
            res.send({
                "error": err
            });
        });
});

app.post('/leave', async (req, res) => {
    var query = "SELECT payDue FROM payments WHERE enrollmentID = '" + req.body.enrollmentID + "';";

    await connection.query(query)
        .then(async (data) => {
            if (data[0][0] === undefined) {
                throw "No such enrollmentID";
            }

            query = "DELETE FROM user WHERE enrollmentID = '" + req.body.enrollmentID + "'";
            var query2 = "DELETE FROM payments WHERE enrollmentID = '" + req.body.enrollmentID + "'";
            var query3 = "DELETE FROM enrollment WHERE enrollmentID = '" + req.body.enrollmentID + "'";

            await connection.query(query + ";" + query2 + ";" + query3 + ";")
                .then((data) => {
                    res.send({
                        "success": 1
                    });
                })
                .catch((err) => {
                    res.send({
                        "error": err
                    });
                });
        })
        .catch((err) => {
            res.send({
                "error": err
            });
        });
});

app.post('/forgot', async (req, res) => {
    var query = "SELECT * FROM enrollment WHERE phoneNumber = '" + req.body.phoneNumber + "';";

    await connection.query(query)
        .then((data) => {
            res.send({
                "enrollmentID": data[0][0].enrollmentID
            });
        })
        .catch((err) => {
            res.send({
                "error": err
            });
        });
});

app.post('/getb', async (req, res) => {
    var query = "SELECT next_batch FROM user WHERE enrollmentID = '" + req.body.enrollmentID + "';";
    
    await connection.query(query)
    .then((data) => {
        res.send({
            "batch": data[0][0].next_batch
        });
    })
    .catch((err) => {
        res.send({
            "error": err
        });
    });
});

var server = https.createServer(options, app);

server.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
