import express  from 'express';
import path  from 'path';
import basicAuth  from 'basic-auth';
import mongoose  from "mongoose";
import {ConnectionOptions} from "tls";

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


app.get('/config', (_, res) => {
    res.json({
        IAF_TOKEN: process.env.VITE_IAF_TOKEN,
        USR: process.env.VITE_USER,
        PASSWD: process.env.VITE_PASSWORD
    });
});


let connection :any= null;


console.log("Trying to connect mongodb...");
connection = mongoose.createConnection(
    process.env.MONGO_URI+"",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    } as ConnectionOptions
);
connection.on("error", console.error.bind(console, "mongo connection error:"));
connection.once("open", function () {
    console.log("Mongo DB connected successfully");


    const dataModel = new mongoose.Schema(
        {
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

    app.use(express.json());

    app.put('/server', async (_, res) => {
            console.log("GET /server");
            res.json({
                data: (await Data.find())[0]
            })
        }
    );

    app.post('/server', async (req, res) => {
        try {
            console.log(await connection.db.collection('datas').deleteMany({}));
            const data = new Data({...req.body});
            await data.save()
            return res.json({suc: true})
        } catch {
            return res.json({suc: false})
        }
    })
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (_, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});


const port = 5100;
app.listen(port, "0.0.0.0");

console.log('App is listening on port ' + port);

