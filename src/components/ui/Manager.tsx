import {Button, Card, CardContent, CircularProgress, Grid, Typography} from "@mui/material";
import {useEffect, useState} from "react";
import {Yaba} from "../../index";
import {ArrowBack, ArrowForward} from "@mui/icons-material";
import ManningSelector from "./manager/ManningSelector.tsx";
import {arrayToYaba, EMPTY_YABA, yabaToArray} from "../../util/yabaAndGroups.ts";

const daysSince = (date = Date.now()) => Math.ceil((date - new Date('2023-10-07').getTime()) / (1000 * 60 * 60 * 24));

const getPirit = (shifter: number): { r: string, startHour: number } => {
    const now = new Date();
    const hours = [1, 4, 7, 10, 13, 16, 19, 22];
    let lastHour = hours[hours.length - 1];
    for (let i = 0; i < hours.length; i++) {
        if (now.getHours() >= hours[i]) {
            lastHour = hours[i];
        } else {
            break;
        }
    }
    const startHourIndex = (hours.indexOf(lastHour) + shifter) % hours.length;
    const endHourIndex = (startHourIndex + 1) % hours.length;
    const startHour = hours[startHourIndex];
    const endHour = hours[endHourIndex];

    // Format time
    const formatTime = (hour: number) => hour.toString().padStart(2, '0') + ':00';
    return {
        r: formatTime(startHour) + ' - ' + formatTime(endHour), startHour
    };
}


const removeFirstNElements = <T, >(array: T[], n: number): T[] => n >= array.length ? [] : array.slice(n);


// Usage example


const Manager = ({synch, back}: any) => {
    const {users, groups, createGroup, deleteAllGroups, queryUsers, queryGroups} = synch;
    const {data, saveData, queryGroups: backqueryGroups} = back;

    const [parsedPiritManning, setParsedPiritManning] = useState<Yaba>(JSON.parse(JSON.stringify(EMPTY_YABA)));
    const [savedPiritManning, setSavedPiritManning] = useState<Yaba[]>([JSON.parse(JSON.stringify(EMPTY_YABA))]);
    const [piritManning, setPiritManning] = useState<Yaba[]>([JSON.parse(JSON.stringify(EMPTY_YABA))]);
    const [index, setIndex] = useState<number>(0);

    const [sending, setSending] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setParsedPiritManning(arrayToYaba(groups));
    }, [groups]);

    useEffect(() => {
        data?.groups?.data && setSavedPiritManning(removeFirstNElements(JSON.parse(data?.groups?.data), (daysSince() * 8 + getPirit(0).startHour) - data.groups.firstPirit));
    }, [data?.groups]);

    useEffect(() => {
        if (index > piritManning.length - 1) {
            setPiritManning([...piritManning, JSON.parse(JSON.stringify(EMPTY_YABA))])
        }
    }, [index]);


    const setManning = (path: string[], id: string) => {
        setPiritManning(prevState => {
            const newArray = JSON.parse(JSON.stringify(prevState));
            const newState = JSON.parse(JSON.stringify(prevState[index]));
            let currentLevel: any = newState;
            for (let i = 0; i < path.length - 1; i++) {
                currentLevel = currentLevel[path[i]];
            }
            currentLevel[path[path.length - 1]] = id;
            newArray[index] = newState;
            return newArray
        });
    };

    const renderMannings = (mannings: any, synchMannings: any, planManninngs: any, path = [], depth = 0) => {
        const isLastLevel = Object.values(mannings).every(value => typeof value !== 'object' || value === null);
        const direction = isLastLevel ? "row" : "column";
        const header = (
            <Typography variant={("h" + (depth + 3)) as any} sx={{fontWeight: 'bold', mb: 1}}>
                {path[path.length - 1] || "איוש לפיריט " + getPirit(index).r + ": "}
            </Typography>
        );

        return (
            <Card variant="outlined" sx={{my: 2, p: 2, backgroundColor: `hsl(${depth * 65}, 35%, 97%)`}}>
                <CardContent>
                    {path.length > 0 ?
                        <Grid item container justifyContent="center" alignItems="center" spacing={2}>
                            <Grid item>
                                {header}
                            </Grid>
                        </Grid>
                        :
                        <Grid item container justifyContent="center" alignItems="center" spacing={2}>
                            <Grid item>
                                {header}
                            </Grid>
                            <Grid item>
                                <Button disabled={index === 0} onClick={() => setIndex(i => i - 1)} variant="contained">
                                    <ArrowForward/>
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button onClick={() => setIndex(i => i + 1)} variant="contained">
                                    <ArrowBack/>
                                </Button>
                            </Grid>
                        </Grid>
                    }
                    <Grid container direction={direction} justifyContent="center" alignItems="center" spacing={2}
                          wrap="nowrap">
                        {Object.keys(mannings).map((key: any) => {

                            const uniqueKey = `${path.join('_')}_${key}`;


                            if (typeof mannings[key] === 'object' && mannings[key] !== null) {
                                return renderMannings(mannings[key], synchMannings?synchMannings[key]:false, planManninngs?planManninngs[key]:false, path.concat(key), depth + 1);
                            } else {
                                return (
                                    <Grid item container direction="column" rowSpacing={2} justifyItems="center"
                                          alignItems="center" key={uniqueKey} sx={{minWidth: 250}}>
                                        <Grid item>
                                            <Typography variant={("h" + (depth + 4)) as any} sx={{mb: 1}}>
                                                {key}:
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <ManningSelector
                                                path={path.concat(key)}
                                                value={mannings[key]}
                                                color={{
                                                    state: mannings[key],
                                                    synch: synchMannings[key],
                                                    plan: planManninngs[key]
                                                }}
                                                users={users}
                                                setManning={setManning}
                                            />
                                        </Grid>
                                    </Grid>
                                );
                            }
                        })}
                    </Grid>
                </CardContent>
            </Card>
        );
    };


    const send = async () => {
        setSending(true);
        await deleteAllGroups();
        const work = yabaToArray(piritManning[0]).map(group => createGroup(group.display_name, undefined, group.profiles));
        await Promise.all(work);
        await queryGroups()
        await queryUsers();
        await backqueryGroups();
        setSending(false);
    }


    const save = async () => {
        setSaving(true);
        await saveData(piritManning, daysSince() * 8 + getPirit(0).startHour);
        await queryGroups()
        await queryUsers();
        await backqueryGroups();
        setSaving(false);
    }


    return (
        <Grid container direction="column" justifyContent="center"
              alignItems="center" rowSpacing={6} wrap="nowrap">
            <Grid item container justifyContent="center" columnSpacing={4}>

                <Grid item>
                    <Button variant="contained" sx={{fontSize:"120%"}} onClick={() => setPiritManning(prev => {
                        const newState = JSON.parse(JSON.stringify(prev));
                        newState[0] = JSON.parse(JSON.stringify(parsedPiritManning));
                        return newState;
                    })}>
                        טען ודרוס איושים נוכחיים מ- synch
                    </Button>
                </Grid>
                <Grid item>
                    <Button variant="contained" sx={{fontSize:"120%"}} onClick={() => setPiritManning(prev => {
                        const newState = JSON.parse(JSON.stringify(prev));
                        if (savedPiritManning[index]) newState[0] = JSON.parse(JSON.stringify(savedPiritManning[index]));
                        return newState;
                    })}>
                        טען ודרוס איושים נוכחיים משרת תכנון
                    </Button>
                </Grid>
                <Grid item>
                    <Button variant="contained" sx={{fontSize:"120%"}} color="secondary"
                            disabled={saving}
                            onClick={save}>
                        {(saving ?
                            <CircularProgress/> : "שמור ודרוס איושים נוכחיים לשרת התכנון")}
                    </Button>
                </Grid>
            </Grid>
            <Grid item container justifyContent="center" columnSpacing={2} alignItems="center">
                <Grid item>
                    <Typography variant="h5" sx={{fontWeight: 'bold', mb: 1}}>
                        מקרא צבעים:
                    </Typography>
                </Grid>
                <Grid item>
                    <ManningSelector value={"איוש לא שמור"} path={[""]}
                                     users={[{label: "איוש לא שמור", id: "איוש לא שמור"}]} setManning={() => {
                    }} color={{plan: "a", synch: "b", state: "c"}}/>
                </Grid>
                <Grid item>
                    <ManningSelector value={"איוש שמור לתכנון בלבד"} path={[""]}
                                     users={[{label: "איוש שמור לתכנון בלבד", id: "איוש שמור לתכנון בלבד"}]} setManning={() => {
                    }} color={{plan: "c", synch: "b", state: "c"}}/>
                </Grid>
                <Grid item>
                    <ManningSelector value={"איוש שמור לsynch בלבד"} path={[""]}
                                     users={[{label: "איוש שמור לsynch בלבד", id: "איוש שמור לsynch בלבד"}]} setManning={() => {
                    }} color={{plan: "a", synch: "c", state: "c"}}/>
                </Grid>
            </Grid>
            <Grid item>
                {piritManning[index] && renderMannings(piritManning[index], parsedPiritManning, savedPiritManning[index])}
            </Grid>
            {index === 0 && <Grid item>
                <Button color="secondary" sx={{padding: "30px 50px", margin: "20px", fontSize: "200%"}}
                        variant="contained"
                        disabled={sending || index !== 0}
                        onClick={send}>
                    {(sending ? <CircularProgress/> : "שא - גר")}
                </Button>
            </Grid>}
        </Grid>
    );
}


export default Manager;