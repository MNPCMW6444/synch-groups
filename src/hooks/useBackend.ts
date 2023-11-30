import {useEffect, useState} from "react";
import axios from "axios";
import {Yaba} from "../index";


export const POLLING_INTERVAL = 1000 * 60;

export default ({u, p}: { u: string, p: string }) => {
    const [data, setData] = useState<{ groups: any[], firstPirit: number }>();
    const [groupsTimestamp, setGroupsTimestamp] = useState<number>(Date.now());


    const axiosInstance = axios.create({
        baseURL: "https://f-ai-ler.com/server",
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
            const response = await axiosInstance.put("/");
            return {
                groups: response.data.data,
                firstPirit: response.data.firstPirit
            }
        } catch (e) {
            console.error("Error fetching groups from backend:", e);
            return false;
        }
    };

    const saveData = async (groups: Yaba[], firstPirit: number) => {
        try {
            await axiosInstance.post("/", {data: JSON.stringify(groups), firstPirit});
            return true
        } catch (e) {
            console.error("Error saving groups to backend:", e);
            return false;
        }
    }

    const queryGroups = () => {
        getGroups().then(res => {
            if (res) {

                setData(res)
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

    return {data, groupsTimestamp, queryGroups, saveData}
}