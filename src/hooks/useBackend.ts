import {useEffect, useState} from "react";
import axios from "axios";


export const POLLING_INTERVAL = 1000 * 60;

export default ({u, p}: { u: string, p: string }) => {
    const [groups, setGroups] = useState<any[]>([]);
    const [groupsTimestamp, setGroupsTimestamp] = useState<number>(Date.now());


    const axiosInstance = axios.create({
        baseURL: "http://localhost:5100/" + "server",
        headers: {
            "Content-Type": "application/json",
            'X-API-Version': '1.0.0'
        },
        auth: {
            username: u || import.meta.env.VITE_USER,
            password: p || import.meta.env.VITE_PASSWORD
        }
    });


    const getGroups = async () => {
        try {
            const response = await axiosInstance.get("/");
            return JSON.parse(response.data)
        } catch (e) {
            console.error("Error fetching groups from backend:", e);
            return [];
        }
    };

    const saveData = async (groups: any[]) => {
        try {
            await axiosInstance.post("/", {data: JSON.stringify(groups)});
            return true
        } catch (e) {
            console.error("Error saving groups to backend:", e);
            return false;
        }
    }

    const queryGroups = () => {
        getGroups().then(groups => {
            if (groups) {
                setGroups(groups)
                setGroupsTimestamp(Date.now())
            }
        })
    };

    useEffect(() => {
        queryGroups();
        const groupsPolling = setInterval(queryGroups, POLLING_INTERVAL);
        return () => {
            clearInterval(groupsPolling)
        }
    }, []);

    return {groups, groupsTimestamp, queryGroups, saveData}
}