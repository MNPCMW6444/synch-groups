import useAll from "./useAll.ts";
import {Dispatch, SetStateAction, useEffect, useState} from "react";
import {Autocomplete, Box, Grid, TextField, Typography} from "@mui/material";

interface User {
    label: string,
    id: string
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


const UserSelector = ({users,setter}: { users: User[],setter:Dispatch<SetStateAction<string>> }) =>
       <Autocomplete
        key={25}
        disablePortal
        options={users}
        sx={{width: 300}}
        renderInput={(params) => <TextField onSelect={(e:any)=> {
            const str = e.target.value;
            const index = str.indexOf("##");
            return setter(str.substring(index+2,str.length))
        }} {...params} label="Crew Member"/>}
    />


const Manage = () => {

    const {getAllData} = useAll()

    const [users, setUsers] = useState<User[]>([]);

    const [m1, setM1] = useState<string>('');
    const [m2, setM2] = useState<string>('');


    useEffect(() => {
        getAllData().then(res => {
            if (res?.users) {
                const users = res?.users?.map(({first_name, last_name, id}: any) => ({
                    label: `${first_name} ${last_name} ##${id}`, // assuming 'id' is a string
                    id
                }));
                setUsers(removeDuplicatesById(users))
            }
        });
    }, []);

    return <Box overflow="scroll">
        <Grid container height="100vh" width="100vw" justifyContent="center" alignItems="center"
              wrap="nowrap">
            <Grid item>
                <UserSelector users={users} setter={setM1}/>
            </Grid>
            <Grid item>
                <UserSelector users={users} setter={setM2}/>
            </Grid>
            <Grid item>
                <Typography>{m1}</Typography>
            </Grid>
            <Grid item>
                <Typography>{m2}</Typography>
            </Grid>
        </Grid>
    </Box>
}

export default Manage;



