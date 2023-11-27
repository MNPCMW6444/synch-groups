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

const getGroups = async () => {
    try {
        const {data: groups} = await axiosInstance.get("/groups/clientField", {params: {clientField: YABA_CLIENT_FIELD}})
        return groups
    } catch (e) {
        return e
    }
}

const getAllData = async () => {
    return {users: await getUsers(), groups: await getGroups()}
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




export default () => {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        getAllData().then(res => {
            if (res?.users) {
                const users = res?.users?.map(({first_name, last_name, id}: any) => ({
                    label: `${first_name} ${last_name} ##${id}`, // assuming 'id' is a ""
                    id
                }));
                setUsers(removeDuplicatesById(users))
            }
        });
    }, []);

    return {users}
}