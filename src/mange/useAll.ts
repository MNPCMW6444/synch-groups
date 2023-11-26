import axios from 'axios';
//import csv from 'async-csv';

const YABA_CLIENT_FIELD = "nelson"

const axiosInstance = axios.create({
    baseURL: "https://api.synchapp.io",
    headers: {
        'Authorization': `Bearer ${import.meta.env.YABAYOKEN}`,
        "Content-Type": "application/json",
        'X-API-Version': '1.0.0'
    },
});


const getData = async ()=>{
    const {data:users} = await axiosInstance.get("/users")
    const {data:groups} = await axiosInstance.get("/groups/clientField",{params:{clientField:YABA_CLIENT_FIELD}})

    return {users,groups}
}


export default ()=>{
    return {getData}
}