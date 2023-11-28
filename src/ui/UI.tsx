import ConnectivityOC from "./ConnectivityOC.tsx";
import Manager from "./manage/Manager.tsx";
import useSync from "../hooks/useSync.ts";
import {Grid} from "@mui/material";

const UI = ({x}: any) => {
    const synch = useSync(x)


    return <Grid container direction="column" alignItems="center" rowSpacing={6} paddingTop="4%">
        <Grid item>
            <ConnectivityOC synch={synch}/>
        </Grid>
        <Grid item>
            <Manager users={synch.users}/>
        </Grid>
    </Grid>
}

export default UI