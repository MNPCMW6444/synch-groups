const express = require("express");
const path = require("path");
require('dotenv').config();

const app = express();

app.use('/', express.static(path.join(__dirname, 'website')));
/*app.get('/manifest.json', (_, res) => {
    res.json(manifestJSONData);
});*/


// Production environment: serve the dist
//if (process.env.NODE_ENV === 'production') {
app.use(express.static(path.join(__dirname, 'dist')));

/*

    app.get('/tos', (_, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'tos.html'));
    });

    app.get('/sub', (_, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'sub.html'));
    });

    app.get('/tok', (_, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'tok.html'));
    });
*/

app.get('*', (_, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
//}
// Development environment: forward the requests to localhost:5992
/*else if (process.env.NODE_ENV === 'development') {
    const {createProxyMiddleware} = require('http-proxy-middleware');

    app.get('/tos', (_, res) => {
        res.sendFile(path.join(__dirname, 'public', 'tos.html'));
    });

    app.get('/sub', (_, res) => {
        res.sendFile(path.join(__dirname, 'public', 'sub.html'));
    });

    app.get('/tok', (_, res) => {
        res.sendFile(path.join(__dirname, 'public', 'tok.html'));
    });


    app.use(createProxyMiddleware({
        target: 'http://localhost:5992',
        changeOrigin: true
    }));
}*/

const port = 5100;
app.listen(port, "0.0.0.0");

console.log('App is listening on port ' + port);
