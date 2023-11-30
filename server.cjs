const express = require('express');
const path = require('path');
const basicAuth = require('basic-auth');
const mongoose = require("mongoose");

require('dotenv').config();

const app = express();


app.use((req, res, next) => {
    if (req.path === '/health-check') {
        return next();
    }

    const credentials = basicAuth(req);
    if (credentials && credentials.name === process.env.VITE_USER && credentials.pass === process.env.VITE_PASSWORD) {
        return next();
    }

    res.setHeader('WWW-Authenticate', 'Basic realm="example"');
    res.status(401).send('Authentication required');
});


app.get('/config', (req, res) => {
    res.json({
        IAF_TOKEN: process.env.VITE_IAF_TOKEN,
        USR: process.env.VITE_USER,
        PASSWD: process.env.VITE_PASSWORD
    });
});


let connection = null;


console.log("Trying to connect mongodb...");
connection = mongoose.createConnection(
    process.env.MONGO_URI,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
);
connection.on("error", console.error.bind(console, "mongo connection error:"));
connection.once("open", function () {
    console.log("Mongo DB connected successfully");


    const dataModel = new mongoose.Schema(
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
            },
            data: {
                type: String,
                required: true,
            },
            firstPirit: {
                type: Number,
                required: true,
            }
        },
        {
            timestamps: true,
        }
    );


    const Data = connection.model("data", dataModel);


    app.get('/server', async (req, res) =>
        res.json({
            data: (await Data.find())[0]
        })
    );

    app.post('/server', async (req, res) => {
        await connection.db.dropCollection('data');
        const data = new Data({...req.body.data});
        await data.save()
        return res.json({suc: true})
    });

    app.use(express.static(path.join(__dirname, 'dist')));

    app.get('*', (_, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });


    const port = 5100;
    app.listen(port, "0.0.0.0");

    console.log('App is listening on port ' + port);


});



