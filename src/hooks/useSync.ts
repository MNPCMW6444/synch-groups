import axios from 'axios';
import {useEffect, useState} from "react";
import {User} from "../components/ui/manager/ManningSelector.tsx";
//import csv from 'async-csv';

const YABA_CLIENT_FIELD = "nelson"
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

export default (x: string) => {
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
            const {data: groups} = await axiosInstance.get("/groups/clientField/" + YABA_CLIENT_FIELD)
            return groups
        } catch (e) {
            return e
        }
    }

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
        getGroups().then(res => {
            if (res) {
                const groups = res.map((x: any) => ({
                    x
                }));
                setGroups([{label: "חפש או בחר איש צוות", id: "empty",}, ...removeDuplicatesById(groups)])
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

    const updateGroups = (groups: any) => {

    }

    return {users, usersTimestamp, queryUsers, groups, groupsTimestamp, queryGroups,updateGroups}
}