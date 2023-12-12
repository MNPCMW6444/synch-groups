import express from 'express';
import path from 'path';
import basicAuth from 'basic-auth';
import mongoose from "mongoose";
import {ConnectOptions} from "mongoose";
import cors from "cors";
import {EMPTY_YABA, yabaToArray} from "./src/util/yabaAndGroups";
import {daysSince, getPirit, removeFirstNElements} from "./src/components/ui/Manager";
import axios from "axios";
import {GroupCreationRequest} from "./src";

require('dotenv').config();


const app = express();

app.use(cors({
    credentials: true,
    origin: "*"
}))

app.use((req, res, next) => {
    if (req.path === '/health-check') {
        return next();
    }

    const credentials = basicAuth(req);
    if (credentials && (credentials.name === process.env.VITE_USER || credentials.name === process.env.VITE_USER2) && credentials.pass === process.env.VITE_PASSWORD) {
        return next();
    }

    res.setHeader('WWW-Authenticate', 'Basic realm="example"');
    res.status(401).send('Authentication required');
});


app.get('/config', (req, res) => {
    const credentials = basicAuth(req);
    res.json({
        IAF_TOKEN: process.env.VITE_IAF_TOKEN,
        USR: process.env.VITE_USER,
        PASSWD: process.env.VITE_PASSWORD,
        ENV: process.env.VITE_NODE_ENV,
        IS_USER: credentials?.name === process.env.VITE_USER2,
    });
});


let connection: any = null;


console.log("Trying to connect mongodb...");
connection = mongoose.createConnection(
    process.env.MONGO_URI + "",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    } as ConnectOptions
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
            res.json({
                data: (await Data.find())[0]
            })
        }
    );

    const cloudFunction = async () => {
        console.log("started cloud function")
        try {
            const axiosInstance = axios.create({
                baseURL: "https://api.synchapp.io",
                headers: {
                    'Authorization': `Bearer ${process.env.VITE_IAF_TOKEN}`,
                    "Content-Type": "application/json",
                    'X-API-Version': '1.0.0'
                },
            });
            const createDepartment = async (name: string) => {
                try {
                    const {data} = await axiosInstance.get("/organizations/orgizx50x/departments")
                    const exists: { department_name: string, id: string } = data.find(({department_name}: {
                        department_name: string
                    }) => department_name === name)
                    return exists ? exists.id : (await axiosInstance.post("/organizations/orgizx50x/departments", {
                        display_name: name,
                        parent_department_id: "depte5fwcj_770"
                    })).data.id as string
                } catch (e) {
                    console.log(e);
                    return false
                }
            }
            const YABA_CLIENT_FIELD = "nelson"
            const YABA_ORGANIZATION_ID = "orgizx50x"
            const createGroup = async (name: string, department: string/* = "dept5qa8tl_770", userIDs: string*/) => {
                //  if (userIDs) {
                try {
                    const data: GroupCreationRequest = {
                        organization_id: YABA_ORGANIZATION_ID,
                        display_name: name,
                        client_field: YABA_CLIENT_FIELD,
                        media: "audio",
                        department,
                        priority: 1,
                        ptt_lock: false,
                        members: [/*{id: userIDs, manager: false}*/]//.map(id => ({id, manager: false}))
                    };
                    await axiosInstance.post("/groups", data)
                    return true
                } catch (e) {
                    console.log(e);
                    return false
                }
                // }
//        return false
            }
            const verifyGroupsAndDepartments = async () => {
                const rooms = Object.keys(EMPTY_YABA);
                const depratmentPromises = rooms.map(room => createDepartment(room))
                const depReses = await Promise.all(depratmentPromises)
                if (depReses.some(res => !res)) return false;
                const promises = rooms.map(async (room, i) => {
                    const groups = yabaToArray((EMPTY_YABA as any)[room])
                    const groupsPromises = groups.map(({display_name}) => createGroup(display_name, (depReses as string[])[i]))
                    const grpReses = await Promise.all(groupsPromises)
                    return !grpReses.some(res => !res);
                })
                return !promises.some(res => !res);
            }
            const updateGroup = async (name: string, people: string[]) => {
                const id = await createDepartment(name)
                const fPeople = [...people.filter(person => person !== ""), "usre11w1x_770"]
                if (id) {
                    try {
                        fPeople.length > 0 ? await axiosInstance.put("/groups/" + id + "/members", fPeople.map((person) => ({
                            id: person,
                            manager: false
                        }))) : await axiosInstance.put("/groups/" + id + "/members", (await axiosInstance.get("/groups/" + id + "/members")).data.ids)
                        return true;
                    } catch (e) {
                        console.log(e);
                        return false
                    }
                }
                return false
            }

            const data = (await Data.find())[0]
            const dataToSynch = (removeFirstNElements(JSON.parse((data)?.data), (daysSince() * 8 + getPirit(0).startHour) - data.firstPirit));
            console.log("will send this:", dataToSynch)
            await verifyGroupsAndDepartments();
            const array = yabaToArray(dataToSynch as any)
            const work = array.map(group => updateGroup(group.display_name, group.profiles));
            const reses = await Promise.all(work);
            console.log("reses:")
            console.log(reses)
            console.log("finished cloud function")
        } catch (e) {
            console.log("cloud function failed: ", e)
        }
    }
    cloudFunction().then();
    setInterval(cloudFunction, 1000 * 60 * 3)
    app.put('/server/trigger', async (_, res) => {
            await cloudFunction();
            res.status(200).send()
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

