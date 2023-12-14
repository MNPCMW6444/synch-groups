import axios from 'axios';
import {useEffect, useState} from "react";
import {User} from "../components/ui/manager/ManningSelector.tsx";
import {GroupCreationRequest} from "../index";
import {EMPTY_YABA, yabaToArray} from "../util/yabaAndGroups.ts";

const YABA_CLIENT_FIELD = "nelson"
const YABA_ORGANIZATION_ID = "orgizx50x"
export const POLLING_INTERVAL = 1000 * 60;

const removeDuplicatesById = (users: User[]): User[] => {
    const unique = new Map<string, User>();
    users.forEach(user => {
        if (!(unique.has(user.id) && unique.has(user.label))) {
            user.id && user.id !== "null" && user.label && user.label !== "null" && unique.set(user.id, user);
        }
    });
    return Array.from(unique.values());
}

export default ({x}: { x: string }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [usersTimestamp, setUsersTimestamp] = useState<number>(Date.now());
    const [groupsTimestamp, setGroupsTimestamp] = useState<number>(Date.now());

    const axiosInstance = axios.create({
        baseURL: "https://api.synchapp.io",
        headers: {
            'Authorization': `Bearer ${x || import.meta.env.VITE_IAF_TOKEN}`,
            "Content-Type": "application/json",
            'X-API-Version': '1.0.0'
        },
    });

    const getUsers = async () => {
        try {
            const {data: users} = await axiosInstance.get("/users")
            return users
        } catch (e) {
            return e
        }
    }


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
            console.error("Error fetching groups:", e);
            return [];
        }
    };

    /* const deleteAllGroups = async () => {


         try {
             let groups = await getGroups();
             let length = groups.length;
             while (length && length > 0) {

                 groups = await getGroups();
                 length = groups.length
                 if (groups && groups.length) {

                     const deletePromises = groups.map((group: any) => axiosInstance.delete("/groups/" + group.id));
                     await Promise.all(deletePromises);
                 }
             }
             queryUsers();


             return true;
         } catch (e) {
             throw false;
         }
     }*/

    const createDepartment = async (name: string) => {
        try {
            const {data} = await axiosInstance.get("/organizations/orgizx50x/departments")
            const exists: { department_name: string, department_id: string } = data.find(({department_name}: {
                department_name: string
            }) => department_name === name)
            return exists ? exists.department_id : (await axiosInstance.post("/organizations/orgizx50x/departments", {
                display_name: name,
                parent_department_id: "depte5fwcj_770"
            })).data.id as string
        } catch (e) {
            console.log((e as any)?.response?.status || console.log((e as any)?.status));
            return false
        }
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
                console.log((e as any)?.response?.status || console.log((e as any)?.status));
                return false
            }
        }
        return false
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
            console.log((e as any)?.response?.status || console.log((e as any)?.status));
            return false
        }
        // }
//        return false
    }


    /*const michaelTo25 = async () => {
        try {
            await axiosInstance.post("/organizations/orgizx50x/departments", data)
            return true
        } catch (e) {console.log((e as any)?.response?.status || console.log((e as any)?.status));;
            return false
        }

    }*/


    /*const cleanAll = async () => {
        const allGroups = await axiosInstance.get("/groups")
        console.log(allGroups.data)
        allGroups.data.forEach(({id}: any) => axiosInstance.delete("/groups/" + id))
        const allDepartments = await axiosInstance.get("/organizations/orgizx50x/departments")
        console.log(allDepartments.data)
        allDepartments.data.forEach(({department_id}: any, i: number) => {
            setTimeout(() => axiosInstance.delete("/organizations/orgizx50x/departments/" + department_id), 200 * i)
        })
    }
    cleanAll().then()*/


    const queryUsers = () => {
        getUsers().then(res => {
            if (res) {
                const users = res.map(({first_name, last_name, id}: any) => ({
                    label: `${first_name} ${last_name} ##${id}`, // assuming 'id' is a ""
                    id
                }));
                setUsers([{label: "חפש או בחר איש צוות", id: "empty",}, ...removeDuplicatesById(users)])
                setUsersTimestamp(Date.now())
            }
        })
    };

    const queryGroups = () => {
        getGroups().then(groups => {
            if (groups) {
                setGroups(groups)
                setGroupsTimestamp(Date.now())
            }
        })
    };

    useEffect(() => {
        queryUsers();
        const usersPolling = setInterval(queryUsers, POLLING_INTERVAL);
        queryGroups();
        const groupsPolling = setInterval(queryGroups, POLLING_INTERVAL);
        return () => {
            clearInterval(usersPolling)
            clearInterval(groupsPolling)
        }
    }, []);

    return {
        users,
        usersTimestamp,
        queryUsers,
        groups,
        groupsTimestamp,
        queryGroups,
        updateGroup,
        verifyGroupsAndDepartments
    }
}

