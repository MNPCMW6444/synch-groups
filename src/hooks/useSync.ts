import axios from 'axios';
import {useEffect, useState} from "react";
import {User} from "../ui/manage/Pirit/manning/ManningSelector.tsx";
//import csv from 'async-csv';

const YABA_CLIENT_FIELD = "nelson"

const axiosInstance = axios.create({
    baseURL: "https://api.synchapp.io",
    headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_IAF_TOKEN}`,
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

const removeDuplicatesById = (users: User[]): User[] => {
    const unique = new Map<string, User>();
    users.forEach(user => {
        if (!(unique.has(user.id) && unique.has(user.label))) {
            user.id && user.id !== "null" && user.label && user.label !== "null" && unique.set(user.id, user);
        }
    });
    return Array.from(unique.values());
}


const getGroups = async () => {
    try {
        const {data: groups} = await axiosInstance.get("/groups/clientField/" + YABA_CLIENT_FIELD)
        return groups
    } catch (e) {
        return e
    }
}


export default () => {
    const [users, setUsers] = useState<User[]>([]);
    const [groups, setGroups] = useState<any[]>([]);

    useEffect(() => {
        const queryUsers = () => {
            getUsers().then(res => {
                if (res) {
                    const users = res.map(({first_name, last_name, id}: any) => ({
                        label: `${first_name} ${last_name} ##${id}`, // assuming 'id' is a ""
                        id
                    }));
                    setUsers([{label: "חפש או בחר איש צוות", id: "empty",}, ...removeDuplicatesById(users)])
                }
            })
        };
        queryUsers();
        const usersPolling = setInterval(queryUsers, 1000 * 60 * 10);

        const queryGroups = () => {
            getGroups().then(res => {
                if (res) {
                    const groups = res.map((x: any) => ({
                        x
                    }));
                    setGroups([{label: "חפש או בחר איש צוות", id: "empty",}, ...removeDuplicatesById(groups)])
                }
            })
        };
        queryGroups();
        const groupsPolling = setInterval(queryUsers, 1000 * 60 * 10);

        return () => {
            clearInterval(usersPolling)
            clearInterval(groupsPolling)
        }
    }, []);

    return {users, groups}
}