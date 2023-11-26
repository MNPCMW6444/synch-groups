import axios from 'axios';
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


export default () => {
    return {getAllData}
}