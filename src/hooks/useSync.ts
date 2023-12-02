import axios from 'axios';
import {useEffect, useState} from "react";
import {User} from "../components/ui/manager/ManningSelector.tsx";
import {GroupCreationRequest} from "../index";
//import csv from 'async-csv';

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
                    return {...group, profiles: membersResponse.data.ids[0]};
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


    const deleteAllGroups = async () => {


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
    }


    const createGroup = async (name: string, department = "dept5qa8tl_770", userIDs: string) => {
        if (userIDs) {
            try {
                const data: GroupCreationRequest = {
                    organization_id: YABA_ORGANIZATION_ID,
                    display_name: name,
                    client_field: YABA_CLIENT_FIELD,
                    media: "audio",
                    department,
                    priority: 1,
                    ptt_lock: false,
                    members: [{id: userIDs, manager: false}]//.map(id => ({id, manager: false}))
                };
                await axiosInstance.post("/groups", data)
                return true
            } catch {
                return false
            }
        }
        return false
    }

    const create = async () => {
            try {
                const data = {
                    display_name: "צוות מסער",
                    parent_department_id:"deptbhyc6v_770"
                };
                await axiosInstance.post("/organizations/orgizx50x/departments", data)
                return true
            } catch {
                return false
            }

    }

  //  create()

    /*const michaelTo25 = async () => {
        try {
            await axiosInstance.post("/organizations/orgizx50x/departments", data)
            return true
        } catch {
            return false
        }

    }*/



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

    return {users, usersTimestamp, queryUsers, groups, groupsTimestamp, queryGroups, createGroup, deleteAllGroups}
}