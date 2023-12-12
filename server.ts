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
                    const exists: { department_name: string, department_id: string } = data.find(({department_name}: {
                        department_name: string
                    }) => department_name === name)
                    console.log("exists: ", JSON.stringify(exists))
                    return exists ? exists.department_id : (await axiosInstance.post("/organizations/orgizx50x/departments", {
                        display_name: name,
                        parent_department_id: "depte5fwcj_770"
                    })).data.id as string
                } catch (e) {
                    console.log((e as any)?.response?.status || console.log((e as any)?.status));
                    ;
                    return false
                }
            }
            const YABA_CLIENT_FIELD = "nelson"
            const YABA_ORGANIZATION_ID = "orgizx50x"
            const createGroup = async (name: string, department: string/* = "dept5qa8tl_770", userIDs: string*/) => {
                const getGroups = async () => {
                    try {
                        const response = await axiosInstance.get("/groups/clientField/" + YABA_CLIENT_FIELD);
                        const groups = response.data;
                        const groupsWithProfilesPromises = groups.map(async (group: any) => {
                            const membersResponse = await axiosInstance.get("/groups/" + group.id + "/members");
                            if (membersResponse.data.ids.length === 1) {
                                return {...group, profiles: membersResponse.data.ids};
                            } else {
                                return null;
                            }
                        });
                        const resolvedGroupsWithProfiles = await Promise.all(groupsWithProfilesPromises);
                        return resolvedGroupsWithProfiles.filter(group => group !== null);
                    } catch (e) {
                        console.error("Error fetching groups:", (e as any)?.response?.status || console.log((e as any)?.status));
                        return [];
                    }
                };
                const exists = (await getGroups()).find(group => group.display_name === name)
                if (exists)
                    return true
                //const data = axiosInstance.get("/groups")
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
                    // console.log((e as any)?.response?.status || console.log((e as any)?.status));;
                    console.log("maybe exists: ", (e as any)?.response?.status || console.log((e as any)?.status));
                    return true
                    // return false
                }
                // }
//        return false
            }
            const verifyGroupsAndDepartments = async () => {
                const rooms = Object.keys(EMPTY_YABA);
                const depratmentPromises = rooms.map(room => createDepartment(room))
                const depReses = await Promise.all(depratmentPromises)
                if (depReses.some(res => !res)) throw new Error("failed to create departments")
                const promises = rooms.map((room, i) => {
                    const groups = yabaToArray((EMPTY_YABA as any)[room])
                    const groupsPromises = groups.map(({display_name}) => createGroup(display_name, (depReses as string[])[i]))
                    return Promise.all(groupsPromises)
                })
                const reses = await Promise.all(promises)
                /* const res = */
                reses.some(res => res.some(ress => !ress))
                // if (!res) throw new Error("failed to create groups")
            }
            const updateGroup = async (name: string, people: string[]) => {
                console.log("update group: ", name)
                console.log("people: ", people)
                const id = await createDepartment(name)
                console.log("id: ", id)
                const fPeople = [...people.filter(person => person !== ""), "usre11w1x_770"]
                console.log("fPeople: ", fPeople)
                if (id) {
                    console.log("id is true: ", id)
                    try {
                        if (fPeople.length > 0) {
                            console.log("fPeople is true: ", fPeople)
                            const res = await axiosInstance.put("/groups/" + id + "/members", fPeople.map((person) => ({
                                id: person,
                                manager: false
                            })))
                            console.log(res?.status || console.log(res.data))
                        } else {
                            console.log("fPeople is false: ", fPeople)
                            await axiosInstance.put("/groups/" + id + "/members", (await axiosInstance.get("/groups/" + id + "/members")).data.ids)
                        }
                        return true;
                    } catch (e) {
                        console.log("error: ", (e as any)?.response?.status || console.log((e as any)?.status));
                        console.log("its the put so message: ", (e as any)?.response?.message || console.log((e as any)?.message) || (e as any)?.data?.message || JSON.stringify((e as any)?.data) || JSON.stringify((e)) || JSON.stringify((e as any)?.message));
                        return false
                    }
                }
                console.log("id is false: ", id)
                return false
            }

            const data = (await Data.find())[0]
            console.log("data before remove " + ((daysSince() * 8 + getPirit(0).startHour) - data.firstPirit) + " pirits: " + JSON.stringify(JSON.parse((data)?.data)))
            console.log("n = " + (daysSince() * 8 + getPirit(0).startHour) + " - " + data.firstPirit)
            const dataToSynch = (removeFirstNElements(JSON.parse((data)?.data), (daysSince() * 8 + (getPirit(0).startHour) - data.firstPirit) / 3));
            console.log("will send this:", JSON.stringify(dataToSynch))
            await verifyGroupsAndDepartments();
            const array = yabaToArray(dataToSynch[0] as any)
            const work = array.map(group => updateGroup(group.display_name, group.profiles));
            console.log("reqes: " + JSON.stringify(array))
            const reses =
                await Promise.all(work);
            console.log("reses:")
            console.log(JSON.stringify(reses))
            console.log("finished cloud function")
            if (!(reses.some(res => !!res))) return "no change"
            return "success"
        } catch (e) {
            console.log("cloud function failed: ", (e as any)?.response?.status || console.log((e as any)?.status))
            return "fail"
        }
    }
    cloudFunction().then();
    setInterval(cloudFunction, 1000 * 60 * 3)
    app.put('/server/trigger', async (_, res) => {
            const result = await cloudFunction();
            res.status(200).json({result})
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

