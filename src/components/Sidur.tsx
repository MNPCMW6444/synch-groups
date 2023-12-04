import {Grid, Typography} from "@mui/material";
import useSync from "../hooks/useSync.ts";
import ManningSelector from "./ui/manager/ManningSelector.tsx";
import {useEffect, useState} from "react";
import useBackend from "../hooks/useBackend.ts";
import {Yaba} from "../index";
import {EMPTY_YABA, yabaToArray} from "../util/yabaAndGroups.ts";
import {daysSince, getPirit, removeFirstNElements} from "./ui/Manager.tsx";

const Sidur = ({x}: any) => {

    const {users, groups: nowPirit} = useSync(x);
    const {data} = useBackend(x);
    const [selectedUser, setSelectedUser] = useState<string>("");

    const [savedPiritManning, setSavedPiritManning] = useState<Yaba[]>([JSON.parse(JSON.stringify(EMPTY_YABA))]);


    useEffect(() => {
        (data?.groups as any)?.data && setSavedPiritManning(removeFirstNElements(JSON.parse((data?.groups as any)?.data), (daysSince() * 8 + getPirit(0).startHour) - (data?.groups as any).firstPirit));
    }, [data?.groups]);

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
            {selectedUser && <>
                <Grid item>
                    <Typography> ע״פ
                        Synch ברגע
                        זה: {((nowPirit.find(({profiles}) => profiles.some((id: string) => id === selectedUser))?.display_name) || "ללא עמדה")}</Typography>
                </Grid>
                <Grid item>
                    <Typography> ע״פ תכנון בעמדות הבאות
                        הן: </Typography>
                </Grid>
                {savedPiritManning.map((pirit, i) => <Grid item>
                        <Typography>{getPirit((data?.groups as any).firstPirit + i).r}: {((yabaToArray(pirit).find(({profiles}) => profiles.some((id: string) => id === selectedUser))?.display_name) || "ללא עמדה")}</Typography>
                    </Grid>
                )}

            </>}
        </Grid>
    );
}

export default Sidur;