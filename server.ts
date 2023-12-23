import express from 'express';
import path from 'path';
import basicAuth from 'basic-auth';
import mongoose from "mongoose";
import {ConnectOptions} from "mongoose";
import cors from "cors";
import {/*EMPTY_YABA,*/ yabaToArray} from "./src/util/yabaAndGroups";
import {daysSince, getPirit, removeFirstNElements} from "./src/components/ui/Manager";
import axios from "axios";
import {GroupCreationRequest} from "./src";

require('dotenv').config();


const smaransMap =

    {
        'מכלול 25/צוות למסער/מסק״ר 2':
            'מסק"ר 2',
        'מכלול 25/צוות למסער/אוצר 2':
            'אוצר 2',
        'מכלול 25/צוות למסער/אוצר 3':
            'אוצר 3',
        'מכלול 25/צוות למסער/מסער 2':
            'מסער 2',
        'מכלול 25/צוות למסער/מ״ע תמרון':
            'מ"ע תמרון',
        'מכלול 25/צוות למסער/פיצול שוהות':
            'פיצול שוהות',
        'מכלול 25/צוות למסער/מסער 1':
            'מסער 1',
        'מכלול 25/צוות למסער':
            'צוות למסער',
        'מכלול 25/צוות למסער/פיצול בת״ק':
            'פיצול בת״ק',
    }


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
    console.log(Date.now());
    console.log(new Date(Date.now()).getHours());


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
            const x = await Data.find()
            res.json({
                data: (x)[x.length - 1]
            })
        }
    );

    const cloudFunction = async (long: boolean) => {
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
                    console.log(name)
                    console.log(data)
                    const exists: { department_name: string, department_id: string } = data.find(({department_name}: {
                        department_name: string
                    }) => department_name === name)
                    console.log("exists: ", JSON.stringify(exists))
                    if (exists?.department_id)
                        return exists?.department_id
                    else {
                        const x = (await axiosInstance.post("/organizations/orgizx50x/departments", {
                            display_name: name,
                            parent_department_id: "depte5fwcj_770"
                        }))
                        return x.data.id
                    }
                } catch (e) {
                    // console.log((e as any)?.response?.status ||((e as any)?.status));
                    return false
                }
            }
            const YABA_CLIENT_FIELD = "nelson"
            const YABA_ORGANIZATION_ID = "orgizx50x"
            const getGroups = async () => {
                try {
                    const response = await axiosInstance.get("/groups"/*/clientField/" + YABA_CLIENT_FIELD*/);
                    const groups = response.data;
                    const groupsWithProfilesPromises = groups.map(async (group: any) => {
                        const membersResponse = await axiosInstance.get("/groups/" + group.id + "/members");
                        //  if (membersResponse.data.ids.length === 1) {
                        return {...group, profiles: membersResponse.data.ids};
                        //  } else {
                        //      return null;
                        // }
                    });
                    const resolvedGroupsWithProfiles = await Promise.all(groupsWithProfilesPromises);
                    return resolvedGroupsWithProfiles.filter(group => group !== null);
                } catch (e) {
                    // console.error("Error fetching groups:", (e as any)?.response?.status || (e as any)?.status);
                    return null;
                }
            };
            const createGroup = async (namex: string, department: string/* = "dept5qa8tl_770", userIDs: string*/, existing: any) => {
                const name: string = smaransMap[namex as keyof typeof smaransMap] || namex
                const exists = (existing)?.find((group: any) => group.display_name === name)
                // console.log("exists: ", JSON.stringify(exists))
                if (exists) {
                    console.log("group exists: " + exists.id)
                    return exists.id
                }
                //const data = axiosInstance.get("/groups")
                //  if (userIDs) {
                try {
                    console.log("creating group: ", name)
                    console.log("PROBLEM lie BECAUSE WE NEED THE ID!!!!!: ");
                    // console.log(JSON.stringify(await getGroups()));
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
                    const r = await axiosInstance.post("/groups", data)
                    return r.data.id
                } catch (e) {
                    console.log((e as any)?.response?.data?.message || (e as any)?.response?.data?.status);
                    //    console.log("PROBLEM catch BECAUSE WE NEED THE ID!!!!!: ");
                    //  console.log(e);
                    return true
                    // return false
                }
                // }
//        return false
            }
            const verifyGroupsAndDepartments = async (/*existing: any*/) => {
                /*  const rooms = Object.keys(EMPTY_YABA);
                  const depratmentPromises = rooms.map(room => createDepartment(room))
                  const depReses = await Promise.all(depratmentPromises)
                  // console.log("finished creating departments");
                  if (depReses.some(res => !res)) throw new Error("failed to create departments")
                  const promises = rooms.map((room, i) => {
                      const groups = yabaToArray((EMPTY_YABA as any)[room])
                      const groupsPromises = groups.map(({display_name}) => createGroup(display_name, (depReses as string[])[i], existing))
                      return Promise.all(groupsPromises)
                  })
                  const reses = await Promise.all(promises)
                  /!* const res = *!/
                  reses.some(res => res.some(ress => !ress))
                  // if (!res) throw new Error("failed to create groups")*/
            }
            const updateGroup = async (name: string, people: string[], existing: any, dep: string) => {
                // console.log("update group: ", name)
                console.log("people: ", people)
                const depID = await createDepartment(dep)
                // console.log("depID: ", depID)
                if (depID) {
                    const grpID = await createGroup(name, depID, existing)
                    // console.log("grpID: ", grpID)
                    const fPeople = [...people.filter(person => person !== ""), "usre11w1x_770"]
                    // console.log("fPeople:M catch BECAUSE WE NEED TH ", fPeople)
                    // console.log("grpID is true: ", grpID)
                    try {
                        /*
                                                if (fPeople.length > 0) {
                        */
                        // console.log("fPeople is true: ", fPeople)
                        const xxx = fPeople.map((person) => ({
                            id: person,
                            manager: false
                        }))
                        const res =
                            await axiosInstance.put("/groups/" + grpID + "/members", xxx)
                        console.log(res?.status || (res.data), "updated group: ", JSON.stringify(xxx))
                        /* } else {
                            // console.log("fPeople is false: ", fPeople)
                             await axiosInstance.put("/groups/" + grpID + "/members", (await axiosInstance.get("/groups/" + grpID + "/members")).data.ids)
                         }*/
                        return true;
                    } catch (e) {
                        // console.log("error: ", (e as any)?.response?.status ||// console.log((e as any)?.status));
                        console.log("its the put so message: ", (e as any)?.response?.message || ((e as any)?.message) || (e as any)?.data?.message || JSON.stringify((e as any)?.data) /*|| JSON.stringify((e as any)?.message)*/ || JSON.stringify((e)));
                        return false
                    }
                }
                // console.log("id is false: ", depID)
                return false
            }

            const existing = await getGroups();
            if (existing === null) return "failed to get groups"
            const x = await Data.find()
            const data = (x)[x.length - 1]
            console.log("data: " + JSON.stringify(data))
            // console.log("data before remove " + ((daysSince() * 8 + getPirit(0).startHour) - data.firstPirit) + " pirits: " + JSON.stringify(JSON.parse((data)?.data)))
            const wanaN = ((daysSince() * 8 + getPirit(0).startHour) - (data)?.firstPirit) / 3
            console.log("n = " + wanaN)
            const dataToSynch = removeFirstNElements(JSON.parse((data)?.data), wanaN);
            // console.log("will send this:", JSON.stringify(dataToSynch))
            long && await verifyGroupsAndDepartments();
            const array = yabaToArray(dataToSynch[0] as any)
            console.log("xxxxxxxxx", JSON.stringify(array))
            const work = array.map(group => updateGroup(group.display_name, group.profiles, existing, group.display_name.split('/')[0]));
            // console.log("reqes: " + JSON.stringify(array))
            const reses =
                await Promise.all(work);
            // console.log("reses:")
            // console.log(JSON.stringify(reses))
            console.log("finished cloud function")
            if (!(reses.some(res => !!res))) return "no change"
            return "success"
        } catch (e) {
            console.log("finished cloud function")
            console.log("cloud function failed: ", (e as any)?.response?.status || ((e as any)?.status || e))
            return "fail"
        }
    }
    cloudFunction(false).then();
    setTimeout(() => {
        setInterval(() => cloudFunction(false).then(), 1000 * 90)
    }, 1000 * 60)
    /*    setTimeout(() => {
            setInterval(() => cloudFunction(true), 1000 * 60 * 30)
        }, 1000 * 60 * 10)*/
    app.put('/server/trigger', async (_, res) => {
            const result = await cloudFunction(false);
            res.status(200).json({result})
        }
    );
    app.post('/server', async (req, res) => {
        try {
            //   console.log(await connection.db.collection('datas').deleteMany({}));
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

