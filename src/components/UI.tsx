import ConnectivityOC from "./ui/ConnectivityOC.tsx";
import Manager from "./ui/Manager.tsx";
import useSync from "../hooks/useSync.ts";
import {Grid} from "@mui/material";
import useBackend from "../hooks/useBackend.ts";

const UI = ({x}: any) => {
    const synch = useSync(x)
    const back = useBackend(x)

    return <Grid container direction="column" alignItems="center" rowSpacing={6} paddingTop="4%">
        <Grid item>
            <Manager synch={synch} back={back}/>
        </Grid>
        <Grid item container justifyContent="center" columnSpacing={4}>
            <Grid item>
                <ConnectivityOC name="synch" data={synch}/>
            </Grid>
            <Grid item>
                <ConnectivityOC name="שרת תכנון" data={back}/>
            </Grid>
        </Grid>
    </Grid>
}

export default UI