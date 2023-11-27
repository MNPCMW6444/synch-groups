const express= require('express');
const fs = require('fs');
const path = require('path');
const basicAuth = require('express-basic-auth');
require('dotenv').config();

const app = express();


app.use(basicAuth({
    users: {'yaba': '509'}
}))


app.get('*', (req, res) => {
    let indexPath = path.join(__dirname, 'dist', 'index.html');
    fs.readFile(indexPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading index.html', err);
            return res.status(500).send('An error occurred');
        }

        let updatedHtml = data.replace('"VITE_IAF_TOKEN": ""', `"VITE_IAF_TOKEN": "${process.env.VITE_IAF_TOKEN}"`);
        res.send(updatedHtml);
    });
});

const port = 5100;
app.listen(port, "0.0.0.0");

console.log('App is listening on port ' + port);
