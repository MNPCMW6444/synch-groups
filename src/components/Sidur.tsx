import {Grid, Typography} from "@mui/material";
import useSync from "../hooks/useSync.ts";
import ManningSelector from "./ui/manager/ManningSelector.tsx";
import {useState} from "react";
import useBackend from "../hooks/useBackend.ts";

const Sidur = ({x}: any) => {

    const {users, groups:nowPirit} = useSync(x);
    const {data} = useBackend(x);
    const [selectedUser, setSelectedUser] = useState<string>("");

   // const {groups, firstPirit} = data

    return (
        <Grid paddingTop="5vh" container width="100vw" height="100vh" direction="column" rowSpacing={4}
              alignItems="center" wrap="nowrap">
            <Grid item>
                <Typography variant="h4">מה הסידור של:</Typography>
            </Grid>
            <Grid item>
                <ManningSelector value={selectedUser} path={[]} users={users} setManning={() => {
                }} color={{state: "1", plan: "1", synch: "1"}} sidur setter={setSelectedUser}/>
            </Grid>
            nowPirit
            <Grid item>
                <Typography>{nowPirit.find((x:any)=>{console.log(x)})}</Typography>
            </Grid>
            <Grid item>
                <Typography>{JSON.stringify(data)}</Typography>
            </Grid>
        </Grid>
    );
}

export default Sidur;