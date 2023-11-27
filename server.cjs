const express= require('express');
const fs = require('fs');
const path = require('path');
const basicAuth = require('basic-auth');
require('dotenv').config();

const app = express();



const USERNAME = "yab";
const PASSWORD = "50";


app.use((req, res, next) => {
    if (req.path === '/health-check') {
        return next();
    }

    const credentials = basicAuth(req);
    if (credentials && credentials.name === USERNAME && credentials.pass === PASSWORD) {
        return next();
    }

    res.setHeader('WWW-Authenticate', 'Basic realm="example"');
    res.status(401).send('Authentication required');
});


app.get('/config', (req, res) => {
    res.json({
        IAF_TOKEN: process.env.VITE_IAF_TOKEN
    });
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (_, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});


const port = 5100;
app.listen(port, "0.0.0.0");

console.log('App is listening on port ' + port);
